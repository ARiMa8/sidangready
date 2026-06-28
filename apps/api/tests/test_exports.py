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
from app.services.r2_storage_service import get_r2_storage_service


class FakeR2StorageService:
    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    def put_object_bytes(
        self,
        object_key: str,
        file_bytes: bytes,
        content_type: str,
    ) -> None:
        self.objects[object_key] = file_bytes

    def generate_presigned_download_url(
        self,
        object_key: str,
        file_name: str,
        expires_in: int,
    ) -> str:
        return f"https://example.r2.dev/{object_key}?file={file_name}&expires={expires_in}"


class ExportRoutesTestCase(unittest.TestCase):
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
        cls.fake_storage = FakeR2StorageService()

        def override_get_db():
            db: Session = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_r2_storage_service] = lambda: cls.fake_storage
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def setUp(self) -> None:
        self.fake_storage.objects.clear()

    def _create_headers_and_project(self) -> tuple[dict[str, str], str]:
        email = "export-routes@example.com"
        self.client.post(
            "/api/auth/register",
            json={
                "name": "Export User",
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
                "title": "Laporan Final Sidang",
                "thesis_title": "Sistem Analisis Kesiapan Sidang",
                "student_name": "Export User",
                "university": "Universitas Nusantara",
                "major": "Informatika",
                "description": "Proyek export markdown.",
                "target_presentation_minutes": 15,
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
                        "readiness_score": 82,
                        "readiness_category": "Siap dengan Catatan",
                        "critical_issues_count": 1,
                        "important_issues_count": 2,
                        "minor_issues_count": 3,
                        "total_slides_checked": 12,
                        "total_examiner_questions": 10,
                        "recommended_next_actions": ["Perbaiki klaim utama."],
                        "disclaimer": "Hasil perlu ditinjau ulang.",
                    },
                    "official_revision_items": [],
                    "revision_items": [
                        {
                            "title": "Perjelas dataset",
                            "description": "Dataset belum detail.",
                            "priority": "critical",
                            "related_chapter": "BAB III",
                            "related_slide": 4,
                            "reason": "Validitas data perlu jelas.",
                            "suggested_action": "Tambahkan sumber dataset.",
                            "status": "todo",
                        }
                    ],
                    "slide_checks": [],
                    "problematic_claims": [],
                    "defense_questions": [],
                    "presentation_scripts": [],
                    "raw_disclaimer": "Hasil perlu ditinjau ulang.",
                },
            )
            db.add(analysis)
            db.commit()

    def test_creates_lists_downloads_and_sorts_exports(self) -> None:
        headers, project_id = self._create_headers_and_project()
        self._create_success_analysis(project_id)

        created_exports = []
        for export_type, mime_type, extension in [
            ("markdown", "text/markdown; charset=utf-8", ".md"),
            ("pdf", "application/pdf", ".pdf"),
            (
                "docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".docx",
            ),
        ]:
            create_response = self.client.post(
                f"/api/projects/{project_id}/exports",
                headers=headers,
                json={"export_type": export_type},
            )
            self.assertEqual(create_response.status_code, 201)
            created = create_response.json()
            created_exports.append(created)
            self.assertEqual(created["export_type"], export_type)
            self.assertEqual(created["file_mime_type"], mime_type)
            self.assertTrue(created["file_name"].endswith(extension))
            self.assertIn("-readiness-report-", created["file_name"])
            self.assertGreater(created["file_size"], 0)
            self.assertIn(created["r2_object_key"], self.fake_storage.objects)

        markdown_export = created_exports[0]
        markdown = self.fake_storage.objects[markdown_export["r2_object_key"]].decode(
            "utf-8"
        )
        self.assertIn("# Laporan Kesiapan Sidang - Laporan Final Sidang", markdown)
        self.assertIn("## Daftar Isi", markdown)
        self.assertIn("- [Ringkasan Proyek](#ringkasan-proyek)", markdown)
        self.assertIn("Target durasi presentasi: 15 menit", markdown)
        self.assertIn("Perjelas dataset", markdown)
        self.assertIn("Hasil perlu ditinjau ulang.", markdown)

        list_response = self.client.get(
            f"/api/projects/{project_id}/exports?sort=latest",
            headers=headers,
        )
        self.assertEqual(list_response.status_code, 200)
        latest_exports = list_response.json()
        self.assertEqual(latest_exports[0]["id"], created_exports[-1]["id"])

        oldest_response = self.client.get(
            f"/api/projects/{project_id}/exports?sort=oldest",
            headers=headers,
        )
        self.assertEqual(oldest_response.status_code, 200)
        self.assertEqual(oldest_response.json()[0]["id"], created_exports[0]["id"])

        pdf_response = self.client.get(
            f"/api/projects/{project_id}/exports?sort=latest&export_type=pdf",
            headers=headers,
        )
        self.assertEqual(pdf_response.status_code, 200)
        self.assertEqual(len(pdf_response.json()), 1)
        self.assertEqual(pdf_response.json()[0]["export_type"], "pdf")

        download_response = self.client.get(
            f"/api/projects/{project_id}/exports/{markdown_export['id']}/download",
            headers=headers,
        )
        self.assertEqual(download_response.status_code, 200)
        self.assertIn(
            markdown_export["r2_object_key"],
            download_response.json()["download_url"],
        )


if __name__ == "__main__":
    unittest.main()
