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
    )
