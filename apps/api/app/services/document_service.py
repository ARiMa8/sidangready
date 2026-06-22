from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import DocumentConfirmRequest
from app.services.document_parser_service import ParsedDocument


def get_total_project_upload_size(db: Session, project_id: UUID) -> int:
    statement = select(func.coalesce(func.sum(Document.file_size), 0)).where(
        Document.project_id == project_id
    )
    return int(db.execute(statement).scalar_one())


def list_documents_for_project(db: Session, project_id: UUID) -> list[Document]:
    statement = (
        select(Document)
        .where(Document.project_id == project_id)
        .order_by(Document.created_at.desc())
    )
    return list(db.execute(statement).scalars().all())


def get_document_for_project(
    db: Session,
    document_id: UUID,
    project_id: UUID,
) -> Document:
    statement = select(Document).where(
        Document.id == document_id,
        Document.project_id == project_id,
    )
    document = db.execute(statement).scalar_one_or_none()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumen tidak ditemukan.",
        )
    return document


def create_document_record(
    db: Session,
    project_id: UUID,
    payload: DocumentConfirmRequest,
) -> Document:
    existing = db.get(Document, payload.document_id)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Dokumen sudah pernah dikonfirmasi.",
        )

    document = Document(
        id=payload.document_id,
        project_id=project_id,
        document_type=payload.document_type,
        file_name=payload.file_name,
        file_mime_type=payload.file_mime_type,
        file_size=payload.file_size,
        r2_object_key=payload.r2_object_key,
        extraction_status="pending",
        extraction_warning=None,
        extraction_error_message=None,
    )
    db.add(document)
    return document


def mark_document_extraction_running(document: Document) -> None:
    document.extraction_status = "running"
    document.extraction_warning = None
    document.extraction_error_message = None


def apply_document_extraction_result(
    document: Document,
    result: ParsedDocument,
) -> None:
    document.extracted_text = result.text
    document.extraction_status = result.extraction_status
    document.extraction_warning = result.extraction_warning
    document.extraction_error_message = None
    document.page_count = result.page_count
    document.slide_count = result.slide_count


def mark_document_extraction_failed(document: Document, error_message: str) -> None:
    document.extraction_status = "failed"
    document.extraction_error_message = error_message


def delete_document_record(db: Session, document: Document) -> None:
    db.delete(document)
