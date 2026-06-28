from __future__ import annotations

import re
from pathlib import Path

from fastapi import HTTPException, status

from app.config import Settings

MB = 1024 * 1024

ALLOWED_UPLOADS = {
    "thesis": {
        "extensions": {".pdf", ".docx"},
        "mime_types": {
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    },
    "slides": {
        "extensions": {".pptx", ".pdf"},
        "mime_types": {
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        },
    },
    "revision_notes": {
        "extensions": {".txt", ".docx"},
        "mime_types": {
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    },
    "other": {
        "extensions": {".pdf", ".docx", ".pptx", ".txt"},
        "mime_types": {
            "application/pdf",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        },
    },
}


def safe_filename(file_name: str) -> str:
    original_name = Path(file_name).name.strip()
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "-", original_name)
    normalized = normalized.strip(".-")
    return normalized or "document"


def get_max_file_size_bytes(document_type: str, settings: Settings) -> int:
    if document_type == "thesis":
        return settings.max_thesis_file_mb * MB
    if document_type == "slides":
        return settings.max_slide_file_mb * MB
    if document_type == "revision_notes":
        return settings.max_revision_file_mb * MB
    return settings.max_revision_file_mb * MB


def validate_upload_file(
    document_type: str,
    file_name: str,
    file_mime_type: str,
    file_size: int,
    settings: Settings,
) -> None:
    upload_rule = ALLOWED_UPLOADS.get(document_type)
    if upload_rule is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipe dokumen tidak didukung.",
        )

    extension = Path(file_name).suffix.lower()
    if extension not in upload_rule["extensions"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ekstensi file tidak sesuai dengan tipe dokumen.",
        )

    if file_mime_type not in upload_rule["mime_types"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MIME type file tidak didukung.",
        )

    max_file_size = get_max_file_size_bytes(document_type, settings)
    if file_size > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Ukuran file melebihi batas upload untuk tipe dokumen ini.",
        )


def validate_total_project_upload_size(
    current_total_size: int,
    new_file_size: int,
    settings: Settings,
) -> None:
    max_total_size = settings.max_total_project_upload_mb * MB
    if current_total_size + new_file_size > max_total_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Total ukuran file proyek melebihi batas upload beta.",
        )


def build_raw_object_key(
    user_id: object,
    project_id: object,
    document_id: object,
    file_name: str,
) -> str:
    return (
        f"users/{user_id}/projects/{project_id}/raw/"
        f"{document_id}-{safe_filename(file_name)}"
    )


def build_export_object_key(
    user_id: object,
    project_id: object,
    export_id: object,
    file_name: str,
) -> str:
    return (
        f"users/{user_id}/projects/{project_id}/exports/"
        f"{export_id}-{safe_filename(file_name)}"
    )


def validate_object_key_matches_document(
    object_key: str,
    user_id: object,
    project_id: object,
    document_id: object,
) -> None:
    expected_prefix = f"users/{user_id}/projects/{project_id}/raw/{document_id}-"
    if not object_key.startswith(expected_prefix):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Object key tidak valid untuk proyek dan dokumen ini.",
        )
