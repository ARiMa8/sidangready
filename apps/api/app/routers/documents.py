from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.document import (
    DocumentConfirmRequest,
    DocumentExtractionResponse,
    DocumentPresignRequest,
    DocumentPresignResponse,
    DocumentResponse,
)
from app.services.auth_service import get_current_user
from app.services.document_service import (
    apply_document_extraction_result,
    create_document_record,
    delete_document_record,
    get_document_for_project,
    get_total_project_upload_size,
    list_documents_for_project,
    mark_document_extraction_failed,
    mark_document_extraction_running,
)
from app.services.document_parser_service import DocumentParserError, parse_document_bytes
from app.services.project_service import get_project_for_user
from app.services.r2_storage_service import (
    R2StorageService,
    StorageConfigurationError,
    get_r2_storage_service,
)
from app.utils.file_validation import (
    build_raw_object_key,
    validate_object_key_matches_document,
    validate_total_project_upload_size,
    validate_upload_file,
)

router = APIRouter(prefix="/projects/{project_id}/documents", tags=["documents"])


def _validate_project_upload_quota(
    db: Session,
    project_id: UUID,
    file_size: int,
    settings: Settings,
) -> None:
    current_total_size = get_total_project_upload_size(db, project_id)
    validate_total_project_upload_size(current_total_size, file_size, settings)


@router.post("/presign", response_model=DocumentPresignResponse)
def presign_document_upload(
    project_id: UUID,
    payload: DocumentPresignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: R2StorageService = Depends(get_r2_storage_service),
) -> DocumentPresignResponse:
    settings = get_settings()
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    validate_upload_file(
        payload.document_type,
        payload.file_name,
        payload.file_mime_type,
        payload.file_size,
        settings,
    )
    _validate_project_upload_quota(db, project_id, payload.file_size, settings)

    document_id = uuid4()
    object_key = build_raw_object_key(
        current_user.id,
        project_id,
        document_id,
        payload.file_name,
    )

    try:
        upload_url = storage.generate_presigned_upload_url(
            object_key=object_key,
            content_type=payload.file_mime_type,
            expires_in=settings.presigned_upload_expires_seconds,
        )
    except StorageConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi Cloudflare R2 belum lengkap.",
        ) from exc

    return DocumentPresignResponse(
        document_id=document_id,
        object_key=object_key,
        upload_url=upload_url,
        expires_in=settings.presigned_upload_expires_seconds,
        headers={"Content-Type": payload.file_mime_type},
    )


@router.post("/confirm", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def confirm_document_upload(
    project_id: UUID,
    payload: DocumentConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    settings = get_settings()
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    validate_upload_file(
        payload.document_type,
        payload.file_name,
        payload.file_mime_type,
        payload.file_size,
        settings,
    )
    validate_object_key_matches_document(
        payload.r2_object_key,
        current_user.id,
        project_id,
        payload.document_id,
    )
    _validate_project_upload_quota(db, project_id, payload.file_size, settings)

    document = create_document_record(db, project_id=project_id, payload=payload)
    db.commit()
    db.refresh(document)
    return DocumentResponse.model_validate(document)


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    documents = list_documents_for_project(db, project_id)
    return [DocumentResponse.model_validate(document) for document in documents]


@router.post("/{document_id}/extract", response_model=DocumentExtractionResponse)
def extract_document_text(
    project_id: UUID,
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: R2StorageService = Depends(get_r2_storage_service),
) -> DocumentExtractionResponse:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    document = get_document_for_project(db, document_id=document_id, project_id=project_id)

    if not document.r2_object_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dokumen belum memiliki object key storage.",
        )

    mark_document_extraction_running(document)
    db.commit()

    try:
        file_bytes = storage.get_object_bytes(document.r2_object_key)
    except StorageConfigurationError as exc:
        mark_document_extraction_failed(document, "Konfigurasi Cloudflare R2 belum lengkap.")
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi Cloudflare R2 belum lengkap.",
        ) from exc
    except Exception as exc:
        mark_document_extraction_failed(
            document,
            "File dokumen belum dapat diambil dari storage.",
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="File dokumen belum dapat diambil dari storage.",
        ) from exc

    try:
        parsed_document = parse_document_bytes(
            file_name=document.file_name,
            file_mime_type=document.file_mime_type,
            file_bytes=file_bytes,
            document_type=document.document_type,
        )
    except DocumentParserError as exc:
        mark_document_extraction_failed(document, str(exc))
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    apply_document_extraction_result(document, parsed_document)
    db.commit()
    db.refresh(document)

    response = DocumentExtractionResponse.model_validate(document)
    return response.model_copy(
        update={"extracted_text_length": len(document.extracted_text or "")}
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    project_id: UUID,
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: R2StorageService = Depends(get_r2_storage_service),
) -> Response:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    document = get_document_for_project(db, document_id=document_id, project_id=project_id)

    if document.r2_object_key:
        try:
            storage.delete_object(document.r2_object_key)
        except StorageConfigurationError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Konfigurasi Cloudflare R2 belum lengkap.",
            ) from exc

    delete_document_record(db, document)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
