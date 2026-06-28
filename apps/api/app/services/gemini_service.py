from __future__ import annotations

import json
import re
import time
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.config import Settings, get_settings

T = TypeVar("T", bound=BaseModel)


class GeminiConfigurationError(Exception):
    """Raised when Gemini is not configured."""


class GeminiResponseError(Exception):
    """Raised when Gemini cannot return valid structured data."""


class GeminiService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def generate_structured(
        self,
        *,
        model_name: str,
        prompt: str,
        response_model: type[T],
    ) -> T:
        self._validate_settings()
        prompt_with_schema = _append_json_instruction(prompt)
        last_error: Exception | None = None
        last_text: str | None = None

        for attempt in range(2):
            candidate_prompt = prompt_with_schema
            if attempt == 1:
                repair_context = _build_repair_context(last_text, last_error)
                candidate_prompt = (
                    f"{prompt_with_schema}\n\n"
                    "Output sebelumnya gagal diproses. Perbaiki dengan ketentuan berikut:\n"
                    f"{repair_context}\n"
                    "Kembalikan JSON valid saja, tanpa markdown, tanpa komentar, "
                    "dan tanpa teks tambahan."
                )

            for payload in self._payload_variants(candidate_prompt):
                try:
                    response_json = self._post_generate_content(model_name, payload)
                    text = self._extract_text(response_json)
                    last_text = text
                    data = _load_json_object(text)
                    return response_model.model_validate(data)
                except httpx.HTTPStatusError as exc:
                    last_error = exc
                    status_code = exc.response.status_code
                    if status_code == 400 or status_code == 429 or status_code >= 500:
                        continue
                    raise GeminiResponseError(_http_error_message(status_code)) from exc
                except (json.JSONDecodeError, ValidationError) as exc:
                    last_error = exc
                    continue

        if isinstance(last_error, httpx.HTTPStatusError):
            status_code = last_error.response.status_code
            raise GeminiResponseError(_http_error_message(status_code)) from last_error

        raise GeminiResponseError(
            "Gemini belum mengembalikan JSON valid sesuai schema."
        ) from last_error

    def _validate_settings(self) -> None:
        if not self.settings.gemini_api_key:
            raise GeminiConfigurationError("GEMINI_API_KEY belum dikonfigurasi.")

    def _post_generate_content(
        self,
        model_name: str,
        payload: dict[str, object],
    ) -> dict[str, object]:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model_name}:generateContent"
        )
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.settings.gemini_api_key,
        }
        with httpx.Client(timeout=self.settings.gemini_timeout_seconds) as client:
            for attempt in range(3):
                response = client.post(url, headers=headers, json=payload)
                try:
                    response.raise_for_status()
                    return response.json()
                except httpx.HTTPStatusError as exc:
                    status_code = exc.response.status_code
                    should_retry = status_code == 429 or 500 <= status_code < 600
                    if should_retry and attempt < 2:
                        time.sleep(2 * (attempt + 1))
                        continue
                    raise

        raise GeminiResponseError("Gemini API tidak mengembalikan respons.")

    def _payload_variants(
        self,
        prompt: str,
    ) -> list[dict[str, object]]:
        base = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
        }
        generation_config = {
            "temperature": 0.2,
            "topP": 0.8,
            "topK": 32,
        }
        return [
            {
                **base,
                "generationConfig": {
                    **generation_config,
                    "responseMimeType": "application/json",
                },
            }
        ]

    def _extract_text(self, response_json: dict[str, object]) -> str:
        try:
            candidates = response_json["candidates"]
            candidate = candidates[0]
            content = candidate["content"]
            parts = content["parts"]
            return parts[0]["text"]
        except (KeyError, IndexError, TypeError) as exc:
            raise GeminiResponseError("Respons Gemini tidak memiliki teks output.") from exc


def get_gemini_service() -> GeminiService:
    return GeminiService(get_settings())


def _append_json_instruction(prompt: str) -> str:
    return (
        f"{prompt.strip()}\n\n"
        "Output harus berupa satu objek JSON valid saja. "
        "Jangan gunakan markdown, code fence, komentar, atau teks pembuka."
    )


def _strip_json_fences(text: str) -> str:
    stripped = text.strip()
    fence_match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", stripped, re.S)
    if fence_match:
        return fence_match.group(1).strip()
    return stripped


def _load_json_object(text: str) -> object:
    stripped = _strip_json_fences(text)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        candidate = _extract_first_json_object(stripped)
        if candidate is None:
            raise
        return json.loads(candidate)


def _extract_first_json_object(text: str) -> str | None:
    start = text.find("{")
    if start == -1:
        return None

    depth = 0
    in_string = False
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start : index + 1]

    return None


def _build_repair_context(last_text: str | None, last_error: Exception | None) -> str:
    parts = []
    if last_error is not None:
        error_text = str(last_error).strip()
        if error_text:
            parts.append(f"Error validasi/parsing: {error_text[:1200]}")
    if last_text:
        excerpt = last_text.strip()[:2500]
        parts.append(f"Output sebelumnya yang perlu diperbaiki:\n{excerpt}")
    if not parts:
        return "JSON sebelumnya tidak valid atau tidak sesuai schema."
    return "\n\n".join(parts)


def _http_error_message(status_code: int) -> str:
    if status_code == 429:
        return (
            "Gemini API sedang membatasi permintaan atau kuota habis (HTTP 429). "
            "Coba ulang nanti atau periksa kuota dan billing Gemini."
        )
    if status_code == 400:
        return (
            "Gemini API menolak format permintaan (HTTP 400). "
            "Periksa prompt, model, dan konfigurasi Gemini."
        )
    if status_code >= 500:
        return (
            f"Gemini API sedang mengalami gangguan sementara (HTTP {status_code}). "
            "Coba ulang beberapa saat lagi."
        )
    return f"Gemini API mengembalikan HTTP {status_code}."
