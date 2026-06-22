from __future__ import annotations

import unittest
from unittest.mock import patch
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base
from app.models.analysis import Analysis
from app.models.document import Document
from app.services.analysis_queue_service import get_analysis_queue_service
from app.workers.tasks import run_full_analysis_task


class FakeAnalysisQueueService:
    def __init__(self) -> None:
        self.jobs: list[dict[str, object]] = []

    def enqueue_full_analysis(self, analysis_id: UUID, retry_count: int) -> str:
        job_id = f"fake-analysis-{analysis_id}-attempt-{retry_count}"
        self.jobs.append(
            {
                "analysis_id": analysis_id,
                "retry_count": retry_count,
                "job_id": job_id,
            }
        )
        return job_id


class AnalysisQueueFlowTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=cls.engine,
        )
        Base.metadata.create_all(bind=cls.engine)
        cls.fake_queue = FakeAnalysisQueueService()

        def override_get_db():
            db: Session = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_analysis_queue_service] = lambda: cls.fake_queue
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def setUp(self) -> None:
        self.fake_queue.jobs.clear()

    def _create_auth_headers(self, email: str) -> dict[str, str]:
        self.client.post(
            "/api/auth/register",
            json={
                "name": "Alya Prameswari",
                "email": email,
                "password": "sidangready123",
            },
        )
        login_response = self.client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": "sidangready123",
            },
        )
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def _create_project(self, headers: dict[str, str]) -> str:
        response = self.client.post(
            "/api/projects",
            headers=headers,
            json={
                "title": "Analisis Antrean Sidang",
                "thesis_title": "Analisis Antrean Dokumen Skripsi",
                "student_name": "Alya Prameswari",
                "university": "Universitas Nusantara",
                "major": "Informatika",
                "description": "Proyek untuk test antrean analisis.",
                "target_presentation_minutes": 10,
            },
        )
        return response.json()["id"]

    def _create_document(self, project_id: str) -> None:
        with self.SessionLocal() as db:
            document = Document(
                id=uuid4(),
                project_id=UUID(project_id),
                document_type="revision_notes",
                file_name="catatan-revisi.txt",
                file_mime_type="text/plain",
                file_size=1024,
                r2_object_key=f"users/test/projects/{project_id}/raw/catatan-revisi.txt",
                extracted_text="Catatan revisi yang sudah diekstrak. " * 12,
                extraction_status="success",
            )
            db.add(document)
            db.commit()

    def test_queues_full_analysis_and_polls_progress(self) -> None:
        headers = self._create_auth_headers("alya-analysis@example.com")
        project_id = self._create_project(headers)
        self._create_document(project_id)

        queue_response = self.client.post(
            f"/api/projects/{project_id}/analyses/full",
            headers=headers,
        )

        self.assertEqual(queue_response.status_code, 202)
        queue_data = queue_response.json()
        analysis = queue_data["analysis"]
        self.assertEqual(queue_data["message"], "Analisis masuk antrean.")
        self.assertEqual(analysis["status"], "queued")
        self.assertEqual(analysis["retry_count"], 0)
        self.assertEqual(len(self.fake_queue.jobs), 1)

        latest_response = self.client.get(
            f"/api/projects/{project_id}/analyses/latest",
            headers=headers,
        )
        self.assertEqual(latest_response.status_code, 200)
        self.assertEqual(latest_response.json()["id"], analysis["id"])

        detail_response = self.client.get(
            f"/api/projects/{project_id}/analyses/{analysis['id']}",
            headers=headers,
        )
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["queue_job_id"], analysis["queue_job_id"])

    def test_rejects_duplicate_active_full_analysis(self) -> None:
        headers = self._create_auth_headers("alya-duplicate@example.com")
        project_id = self._create_project(headers)
        self._create_document(project_id)

        first_response = self.client.post(
            f"/api/projects/{project_id}/analyses/full",
            headers=headers,
        )
        second_response = self.client.post(
            f"/api/projects/{project_id}/analyses/full",
            headers=headers,
        )

        self.assertEqual(first_response.status_code, 202)
        self.assertEqual(second_response.status_code, 409)

    def test_retries_failed_analysis_once(self) -> None:
        headers = self._create_auth_headers("alya-retry@example.com")
        project_id = self._create_project(headers)
        self._create_document(project_id)

        queue_response = self.client.post(
            f"/api/projects/{project_id}/analyses/full",
            headers=headers,
        )
        analysis_id = queue_response.json()["analysis"]["id"]

        with self.SessionLocal() as db:
            analysis = db.get(Analysis, UUID(analysis_id))
            analysis.status = "failed"
            analysis.error_message = "Redis worker berhenti saat test."
            db.commit()

        retry_response = self.client.post(
            f"/api/projects/{project_id}/analyses/{analysis_id}/retry",
            headers=headers,
        )
        self.assertEqual(retry_response.status_code, 202)
        self.assertEqual(retry_response.json()["analysis"]["retry_count"], 1)

        with self.SessionLocal() as db:
            analysis = db.get(Analysis, UUID(analysis_id))
            analysis.status = "failed"
            analysis.error_message = "Percobaan ulang gagal saat test."
            db.commit()

        second_retry_response = self.client.post(
            f"/api/projects/{project_id}/analyses/{analysis_id}/retry",
            headers=headers,
        )
        self.assertEqual(second_retry_response.status_code, 409)

    def test_worker_task_marks_placeholder_analysis_success(self) -> None:
        headers = self._create_auth_headers("alya-worker@example.com")
        project_id = self._create_project(headers)
        self._create_document(project_id)

        with self.SessionLocal() as db:
            analysis = Analysis(
                project_id=UUID(project_id),
                analysis_type="full_readiness",
                status="queued",
                progress=0,
                current_step="Analisis masuk antrean.",
                retry_count=0,
                max_retries=1,
            )
            db.add(analysis)
            db.commit()
            analysis_id = analysis.id

        with patch("app.workers.tasks.get_session_factory", return_value=self.SessionLocal):
            result = run_full_analysis_task(str(analysis_id))

        self.assertEqual(result["status"], "success")
        with self.SessionLocal() as db:
            analysis = db.get(Analysis, analysis_id)
            self.assertEqual(analysis.status, "success")
            self.assertEqual(analysis.progress, 100)
            self.assertEqual(analysis.result_json["phase"], "phase_5_queue_placeholder")
            self.assertEqual(analysis.result_json["document_count"], 1)
