import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base


class AuthAndProjectFlowTestCase(unittest.TestCase):
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

    def test_register_login_and_project_crud_flow(self) -> None:
        register_response = self.client.post(
            "/api/auth/register",
            json={
                "name": "Andi Mahesa",
                "email": "andi@example.com",
                "password": "sidangready123",
            },
        )
        self.assertEqual(register_response.status_code, 201)
        self.assertEqual(register_response.json()["email"], "andi@example.com")

        login_response = self.client.post(
            "/api/auth/login",
            json={
                "email": "andi@example.com",
                "password": "sidangready123",
            },
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        swagger_token_response = self.client.post(
            "/api/auth/token",
            data={
                "username": "andi@example.com",
                "password": "sidangready123",
            },
        )
        self.assertEqual(swagger_token_response.status_code, 200)
        self.assertIn("access_token", swagger_token_response.json())

        me_response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["email"], "andi@example.com")

        project_response = self.client.post(
            "/api/projects",
            headers=headers,
            json={
                "title": "Sidang Skripsi AI",
                "thesis_title": "Sistem Rekomendasi Topik Skripsi Berbasis AI",
                "student_name": "Andi Mahesa",
                "university": "Universitas Nusantara",
                "major": "Teknik Informatika",
                "description": "Proyek demo untuk persiapan sidang.",
                "target_presentation_minutes": 10,
            },
        )
        self.assertEqual(project_response.status_code, 201)
        self.assertEqual(project_response.json()["status"], "draft")

        list_response = self.client.get("/api/projects", headers=headers)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(list_response.json()[0]["title"], "Sidang Skripsi AI")
