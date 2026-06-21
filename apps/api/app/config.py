from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


def _get_env(name: str, default: str) -> str:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default
    return value.strip()


def _parse_cors_origins(value: str) -> list[str]:
    return [origin.strip() for origin in value.split(",") if origin.strip()]


def _parse_duration_minutes(value: str) -> int:
    raw = value.strip().lower()
    if raw.endswith("d"):
        return int(raw[:-1]) * 24 * 60
    if raw.endswith("h"):
        return int(raw[:-1]) * 60
    if raw.endswith("m"):
        return int(raw[:-1])
    if raw.endswith("s"):
        seconds = int(raw[:-1])
        return max(1, seconds // 60)
    return int(raw)


def _parse_int_env(name: str, default: int) -> int:
    value = _get_env(name, str(default))
    return int(value)


@dataclass(frozen=True)
class Settings:
    app_name: str
    environment: str
    api_prefix: str
    database_url: str
    redis_url: str
    jwt_secret: str
    jwt_expires_minutes: int
    cors_origins: list[str]
    r2_account_id: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str
    r2_endpoint_url: str
    r2_public_base_url: str
    max_thesis_file_mb: int
    max_slide_file_mb: int
    max_revision_file_mb: int
    max_total_project_upload_mb: int
    presigned_upload_expires_seconds: int


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_name=_get_env("APP_NAME", "SidangReady AI API"),
        environment=_get_env("ENVIRONMENT", "development"),
        api_prefix=_get_env("API_PREFIX", "/api"),
        database_url=_get_env(
            "DATABASE_URL",
            "postgresql+psycopg://sidangready:sid4ngr3ady@localhost:5432/sidangready",
        ),
        redis_url=_get_env("REDIS_URL", "redis://localhost:6379/0"),
        jwt_secret=_get_env("JWT_SECRET", "change-me-in-production"),
        jwt_expires_minutes=_parse_duration_minutes(_get_env("JWT_EXPIRES_IN", "7d")),
        cors_origins=_parse_cors_origins(
            _get_env("CORS_ORIGINS", "http://localhost:3000")
        ),
        r2_account_id=_get_env("R2_ACCOUNT_ID", ""),
        r2_access_key_id=_get_env("R2_ACCESS_KEY_ID", ""),
        r2_secret_access_key=_get_env("R2_SECRET_ACCESS_KEY", ""),
        r2_bucket_name=_get_env("R2_BUCKET_NAME", ""),
        r2_endpoint_url=_get_env("R2_ENDPOINT_URL", ""),
        r2_public_base_url=_get_env("R2_PUBLIC_BASE_URL", ""),
        max_thesis_file_mb=_parse_int_env("MAX_THESIS_FILE_MB", 30),
        max_slide_file_mb=_parse_int_env("MAX_SLIDE_FILE_MB", 30),
        max_revision_file_mb=_parse_int_env("MAX_REVISION_FILE_MB", 10),
        max_total_project_upload_mb=_parse_int_env("MAX_TOTAL_PROJECT_UPLOAD_MB", 70),
        presigned_upload_expires_seconds=_parse_int_env(
            "PRESIGNED_UPLOAD_EXPIRES_SECONDS",
            900,
        ),
    )
