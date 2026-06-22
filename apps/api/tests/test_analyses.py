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
from app.schemas.ai_analysis import (
    ExtractionBundle,
    GeminiAnalysisOutput,
    ProblematicClaimOutput,
    RevisionItemOutput,
    SlideClaim,
    SlideConsistencyOutput,
    ThesisStructure,
)
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


class FakeGeminiService:
    def generate_structured(self, *, model_name, prompt, response_model):
        if response_model is ExtractionBundle:
            return ExtractionBundle(
                thesis_structure=ThesisStructure(
                    title="Analisis Antrean Dokumen Skripsi",
                    problem_statements=["Bagaimana sistem antrean analisis berjalan?"],
                    objectives=["Menguji pipeline analisis asinkron."],
                    methodology="Pengujian dilakukan dengan dokumen dummy.",
                    dataset_or_data="Data dummy untuk unit test.",
                    implementation="FastAPI, Redis, RQ, dan PostgreSQL.",
                    evaluation_metrics=["status antrean", "progress"],
                    results=["Worker dapat menyelesaikan task."],
                    conclusion="Pipeline queue dapat diproses.",
                    limitations=["Belum memakai dokumen sungguhan pada unit test."],
                ),
                slide_claims=[
                    SlideClaim(
                        slide_number=1,
                        slide_title="Metodologi",
                        claims=["Worker memproses analisis secara asinkron."],
                    )
                ],
            )
        if response_model is GeminiAnalysisOutput:
            return GeminiAnalysisOutput(
                overall_summary="Dokumen dummy cukup untuk menguji pipeline.",
                revision_items=[
                    RevisionItemOutput(
                        title="Perjelas batasan sistem",
                        description="Batasan pengujian perlu dibuat eksplisit.",
                        priority="important",
                        related_chapter="BAB III",
                        related_slide=1,
                        reason="Agar pembaca memahami cakupan pengujian.",
                        suggested_action="Tambahkan batasan pada metodologi.",
                    )
                ],
                slide_checks=[
                    SlideConsistencyOutput(
                        slide_number=1,
                        slide_title="Metodologi",
                        detected_claim="Worker memproses analisis secara asinkron.",
                        matched_thesis_section="BAB III",
                        status="supported",
                        issue_summary="Klaim didukung dokumen dummy.",
                        suggested_fix="Pertahankan klaim.",
                        evidence_excerpt="Worker dapat menyelesaikan task.",
                    )
                ],
                problematic_claims=[
                    ProblematicClaimOutput(
                        slide_number=1,
                        claim_text="Semua pengujian pasti selalu berhasil.",
                        problem_type="too_broad",
                        risk_level="medium",
                        evidence_excerpt=None,
                        suggested_revision="Ubah menjadi hasil berdasarkan skenario uji.",
                    )
                ],
                defense_questions=[
                    {
                        "category": "Metodologi",
                        "question": "Mengapa memakai queue untuk analisis?",
                        "why_asked": "Penguji dapat menilai alasan desain sistem.",
                        "answer_guidance": "Jelaskan proses asinkron dan keterbatasan VPS.",
                        "related_section": "BAB III",
                        "difficulty": "medium",
                    }
                ],
                presentation_scripts=[
                    {
                        "slide_number": 1,
                        "slide_title": "Metodologi",
                        "estimated_duration_seconds": 60,
                        "script_text": "Pada slide ini saya menjelaskan metodologi pengujian.",
                        "key_points": ["queue", "worker", "progress"],
                        "delivery_tips": ["Sampaikan alur secara runtut."],
                    }
                ],
                recommended_next_actions=["Tinjau kembali batasan pengujian."],
                disclaimer="Hasil ini adalah saran AI dan perlu ditinjau kembali.",
            )
        raise AssertionError(f"Unexpected response model: {response_model}")


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
            documents = [
                Document(
                    id=uuid4(),
                    project_id=UUID(project_id),
                    document_type="thesis",
                    file_name="laporan.pdf",
                    file_mime_type="application/pdf",
                    file_size=2048,
                    r2_object_key=f"users/test/projects/{project_id}/raw/laporan.pdf",
                    extracted_text=(
                        "BAB III Metodologi. Worker dapat menyelesaikan task. "
                        "BAB V Kesimpulan. Pipeline queue dapat diproses. "
                    )
                    * 8,
                    extraction_status="success",
                    page_count=5,
                ),
                Document(
                    id=uuid4(),
                    project_id=UUID(project_id),
                    document_type="slides",
                    file_name="slides.pptx",
                    file_mime_type=(
                        "application/vnd.openxmlformats-officedocument."
                        "presentationml.presentation"
                    ),
                    file_size=2048,
                    r2_object_key=f"users/test/projects/{project_id}/raw/slides.pptx",
                    extracted_text=(
                        "[Slide 1: Metodologi]\n"
                        "Worker memproses analisis secara asinkron."
                    ),
                    extraction_status="success",
                    slide_count=1,
                ),
                Document(
                    id=uuid4(),
                    project_id=UUID(project_id),
                    document_type="revision_notes",
                    file_name="catatan-revisi.txt",
                    file_mime_type="text/plain",
                    file_size=1024,
                    r2_object_key=f"users/test/projects/{project_id}/raw/catatan.txt",
                    extracted_text="Catatan revisi yang sudah diekstrak. " * 12,
                    extraction_status="success",
                ),
            ]
            db.add_all(documents)
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

        with (
            patch("app.workers.tasks.get_session_factory", return_value=self.SessionLocal),
            patch(
                "app.services.analysis_orchestrator.get_gemini_service",
                return_value=FakeGeminiService(),
            ),
        ):
            result = run_full_analysis_task(str(analysis_id))

        self.assertEqual(result["status"], "success")
        with self.SessionLocal() as db:
            analysis = db.get(Analysis, analysis_id)
            self.assertEqual(analysis.status, "success")
            self.assertEqual(analysis.progress, 100)
            self.assertEqual(analysis.result_json["phase"], "phase_6_gemini_analysis")
            self.assertEqual(analysis.result_json["overview"]["readiness_score"], 99)
            self.assertEqual(analysis.model_provider, "google_gemini")
