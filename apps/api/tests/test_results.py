from __future__ import annotations

import unittest
from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base
from app.models.analysis import Analysis


class ResultsRoutesTestCase(unittest.TestCase):
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

        def override_get_db():
            db: Session = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def _create_headers_and_project(self) -> tuple[dict[str, str], str]:
        email = "result-routes@example.com"
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
            json={"email": email, "password": "sidangready123"},
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        project_response = self.client.post(
            "/api/projects",
            headers=headers,
            json={
                "title": "Hasil Analisis Sidang",
                "thesis_title": "Analisis Hasil Sidang dengan AI",
                "student_name": "Alya Prameswari",
                "university": "Universitas Nusantara",
                "major": "Informatika",
                "description": "Proyek untuk test result routes.",
                "target_presentation_minutes": 10,
            },
        )
        return headers, project_response.json()["id"]

    def _create_success_analysis(self, project_id: str) -> None:
        with self.SessionLocal() as db:
            analysis = Analysis(
                project_id=UUID(project_id),
                analysis_type="full_readiness",
                status="success",
                progress=100,
                current_step="Analisis selesai.",
                retry_count=0,
                max_retries=1,
                result_json={
                    "overview": {
                        "readiness_score": 88,
                        "readiness_category": "Siap dengan Catatan",
                    },
                    "official_revision_items": [
                        {
                            "title": "Revisi dari dosen",
                            "description": "Tambahkan data uji.",
                            "priority": "critical",
                            "related_chapter": "BAB IV",
                            "related_slide": None,
                            "reason": "Berdasarkan catatan revisi.",
                            "suggested_action": "Lengkapi hasil pengujian.",
                            "status": "todo",
                        }
                    ],
                    "revision_items": [
                        {
                            "title": "Perjelas batasan",
                            "description": "Batasan penelitian perlu eksplisit.",
                            "priority": "important",
                            "related_chapter": "BAB I",
                            "related_slide": 2,
                            "reason": "Agar klaim tidak terlalu luas.",
                            "suggested_action": "Tambahkan batasan pada slide.",
                            "status": "todo",
                        }
                    ],
                    "slide_checks": [],
                    "problematic_claims": [],
                    "defense_questions": [],
                    "presentation_scripts": [],
                },
            )
            db.add(analysis)
            db.commit()

    def test_reads_overview_and_updates_checklist_status(self) -> None:
        headers, project_id = self._create_headers_and_project()
        self._create_success_analysis(project_id)

        overview_response = self.client.get(
            f"/api/projects/{project_id}/results/overview",
            headers=headers,
        )
        self.assertEqual(overview_response.status_code, 200)
        self.assertEqual(overview_response.json()["readiness_score"], 88)

        checklist_response = self.client.get(
            f"/api/projects/{project_id}/results/checklist",
            headers=headers,
        )
        self.assertEqual(checklist_response.status_code, 200)
        checklist = checklist_response.json()
        self.assertEqual(checklist[0]["id"], "fix-1")
        self.assertEqual(checklist[0]["status"], "todo")

        update_response = self.client.patch(
            f"/api/projects/{project_id}/results/checklist/fix-1",
            headers=headers,
            json={"status": "done"},
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["status"], "done")
        refreshed_checklist_response = self.client.get(
            f"/api/projects/{project_id}/results/checklist",
            headers=headers,
        )
        self.assertEqual(refreshed_checklist_response.status_code, 200)
        self.assertEqual(refreshed_checklist_response.json()[0]["status"], "done")

        official_response = self.client.get(
            f"/api/projects/{project_id}/results/revision-checklist",
            headers=headers,
        )
        self.assertEqual(official_response.status_code, 200)
        official = official_response.json()
        self.assertEqual(official[0]["id"], "official-rev-1")

        official_update_response = self.client.patch(
            f"/api/projects/{project_id}/results/revision-checklist/official-rev-1",
            headers=headers,
            json={"status": "in_progress"},
        )
        self.assertEqual(official_update_response.status_code, 200)
        self.assertEqual(official_update_response.json()["status"], "in_progress")
        refreshed_official_response = self.client.get(
            f"/api/projects/{project_id}/results/revision-checklist",
            headers=headers,
        )
        self.assertEqual(refreshed_official_response.status_code, 200)
        self.assertEqual(
            refreshed_official_response.json()[0]["status"],
            "in_progress",
        )
