import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base
from app.services.r2_storage_service import get_r2_storage_service


class FakeR2StorageService:
    def __init__(self) -> None:
        self.deleted_keys: list[str] = []
        self.objects: dict[str, bytes] = {}

    def generate_presigned_upload_url(
        self,
        object_key: str,
        content_type: str,
        expires_in: int,
    ) -> str:
        return (
            "https://example.r2.dev/upload"
            f"?key={object_key}&content_type={content_type}&expires={expires_in}"
        )

    def delete_object(self, object_key: str) -> None:
        self.deleted_keys.append(object_key)

    def get_object_bytes(self, object_key: str) -> bytes:
        return self.objects[object_key]


class DocumentUploadFlowTestCase(unittest.TestCase):
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

    def _create_auth_headers(self) -> dict[str, str]:
        self.client.post(
            "/api/auth/register",
            json={
                "name": "Dina Puspita",
                "email": "dina@example.com",
                "password": "sidangready123",
            },
        )
        login_response = self.client.post(
            "/api/auth/login",
            json={
                "email": "dina@example.com",
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
                "title": "Upload Dokumen Sidang",
                "thesis_title": "Analisis Kesiapan Sidang Skripsi",
                "student_name": "Dina Puspita",
                "university": "Universitas Nusantara",
                "major": "Sistem Informasi",
                "description": "Proyek untuk test upload R2.",
                "target_presentation_minutes": 10,
            },
        )
        return response.json()["id"]

    def test_presign_confirm_list_and_delete_document(self) -> None:
        headers = self._create_auth_headers()
        project_id = self._create_project(headers)

        presign_response = self.client.post(
            f"/api/projects/{project_id}/documents/presign",
            headers=headers,
            json={
                "document_type": "thesis",
                "file_name": "laporan skripsi.pdf",
                "file_mime_type": "application/pdf",
                "file_size": 1_024_000,
            },
        )
        self.assertEqual(presign_response.status_code, 200)
        presign_data = presign_response.json()
        self.assertTrue(presign_data["object_key"].endswith("-laporan-skripsi.pdf"))
        self.assertEqual(presign_data["headers"], {})

        confirm_response = self.client.post(
            f"/api/projects/{project_id}/documents/confirm",
            headers=headers,
            json={
                "document_id": presign_data["document_id"],
                "document_type": "thesis",
                "file_name": "laporan skripsi.pdf",
                "file_mime_type": "application/pdf",
                "file_size": 1_024_000,
                "r2_object_key": presign_data["object_key"],
            },
        )
        self.assertEqual(confirm_response.status_code, 201)
        document_id = confirm_response.json()["id"]

        list_response = self.client.get(
            f"/api/projects/{project_id}/documents",
            headers=headers,
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

        delete_response = self.client.delete(
            f"/api/projects/{project_id}/documents/{document_id}",
            headers=headers,
        )
        self.assertEqual(delete_response.status_code, 204)
        self.assertIn(presign_data["object_key"], self.fake_storage.deleted_keys)

    def test_presign_rejects_invalid_file_type(self) -> None:
        headers = self._create_auth_headers()
        project_id = self._create_project(headers)

        response = self.client.post(
            f"/api/projects/{project_id}/documents/presign",
            headers=headers,
            json={
                "document_type": "thesis",
                "file_name": "malware.exe",
                "file_mime_type": "application/octet-stream",
                "file_size": 1000,
            },
        )

        self.assertEqual(response.status_code, 400)

    def test_extracts_revision_note_text_from_storage(self) -> None:
        headers = self._create_auth_headers()
        project_id = self._create_project(headers)

        presign_response = self.client.post(
            f"/api/projects/{project_id}/documents/presign",
            headers=headers,
            json={
                "document_type": "revision_notes",
                "file_name": "catatan-revisi.txt",
                "file_mime_type": "text/plain",
                "file_size": 2_000,
            },
        )
        self.assertEqual(presign_response.status_code, 200)
        presign_data = presign_response.json()

        confirm_response = self.client.post(
            f"/api/projects/{project_id}/documents/confirm",
            headers=headers,
            json={
                "document_id": presign_data["document_id"],
                "document_type": "revision_notes",
                "file_name": "catatan-revisi.txt",
                "file_mime_type": "text/plain",
                "file_size": 2_000,
                "r2_object_key": presign_data["object_key"],
            },
        )
        self.assertEqual(confirm_response.status_code, 201)
        document_id = confirm_response.json()["id"]

        revision_note = (
            "Catatan revisi sidang: perjelas rumusan masalah, "
            "tambahkan batasan penelitian, dan sesuaikan kesimpulan "
            "dengan tujuan penelitian. "
        ) * 4
        self.fake_storage.objects[presign_data["object_key"]] = revision_note.encode(
            "utf-8"
        )

        extract_response = self.client.post(
            f"/api/projects/{project_id}/documents/{document_id}/extract",
            headers=headers,
        )

        self.assertEqual(extract_response.status_code, 200)
        extract_data = extract_response.json()
        self.assertEqual(extract_data["extraction_status"], "success")
        self.assertIsNone(extract_data["extraction_warning"])
        self.assertGreater(extract_data["extracted_text_length"], 300)

        list_response = self.client.get(
            f"/api/projects/{project_id}/documents",
            headers=headers,
        )
        listed_document = list_response.json()[0]
        self.assertEqual(listed_document["extraction_status"], "success")
