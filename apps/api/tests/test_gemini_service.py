from __future__ import annotations

import json
import unittest

from pydantic import BaseModel

from app.config import Settings
from app.services.gemini_service import GeminiService


class SimpleGeminiResponse(BaseModel):
    status: str
    items: list[str]


class FakeGeminiService(GeminiService):
    def __init__(self, responses: list[str]) -> None:
        super().__init__(make_settings())
        self.responses = responses
        self.prompts: list[str] = []

    def _post_generate_content(
        self,
        model_name: str,
        payload: dict[str, object],
    ) -> dict[str, object]:
        self.prompts.append(
            payload["contents"][0]["parts"][0]["text"]  # type: ignore[index]
        )
        text = self.responses.pop(0)
        return {"candidates": [{"content": {"parts": [{"text": text}]}}]}


def make_settings() -> Settings:
    return Settings(
        app_name="SidangReady AI API",
        environment="test",
        api_prefix="/api",
        database_url="sqlite:///:memory:",
        redis_url="redis://localhost:6379/0",
        jwt_secret="test-secret",
        jwt_expires_minutes=60,
        cors_origins=["http://localhost:3000"],
        r2_account_id="account",
        r2_access_key_id="access",
        r2_secret_access_key="secret",
        r2_bucket_name="bucket",
        r2_endpoint_url="https://example.com",
        r2_public_base_url="",
        gemini_api_key="test-key",
        gemini_cheap_model="gemini-lite",
        gemini_analysis_model="gemini-flash",
        gemini_timeout_seconds=10,
        gemini_max_thesis_chars=1000,
        gemini_max_slide_chars=1000,
        gemini_max_revision_chars=1000,
        max_thesis_file_mb=30,
        max_slide_file_mb=30,
        max_revision_file_mb=10,
        max_total_project_upload_mb=70,
        presigned_upload_expires_seconds=900,
        analysis_queue_name="sidangready-analysis",
        analysis_job_timeout_seconds=900,
        analysis_max_retries=1,
    )


class GeminiServiceTest(unittest.TestCase):
    def test_generate_structured_accepts_json_embedded_in_text(self) -> None:
        service = FakeGeminiService(
            [
                "Berikut JSON yang diminta:\n"
                + json.dumps({"status": "ok", "items": ["a", "b"]})
            ]
        )

        result = service.generate_structured(
            model_name="gemini-test",
            prompt="Return JSON",
            response_model=SimpleGeminiResponse,
        )

        self.assertEqual(result.status, "ok")
        self.assertEqual(result.items, ["a", "b"])

    def test_generate_structured_repairs_invalid_schema_with_context(self) -> None:
        service = FakeGeminiService(
            [
                json.dumps({"status": "ok", "items": "not-a-list"}),
                json.dumps({"status": "ok", "items": ["fixed"]}),
            ]
        )

        result = service.generate_structured(
            model_name="gemini-test",
            prompt="Return JSON",
            response_model=SimpleGeminiResponse,
        )

        self.assertEqual(result.items, ["fixed"])
        self.assertEqual(len(service.prompts), 2)
        self.assertIn("Error validasi/parsing", service.prompts[1])
        self.assertIn("Output sebelumnya", service.prompts[1])


if __name__ == "__main__":
    unittest.main()
