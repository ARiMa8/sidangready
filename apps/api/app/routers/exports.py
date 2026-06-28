from __future__ import annotations

from uuid import UUID

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.export import (
    ExportCreateRequest,
    ExportDownloadResponse,
    ExportResponse,
)
from app.services.analysis_service import get_latest_analysis_for_project
from app.services.auth_service import get_current_user
from app.services.export_service import (
    create_export_record,
    get_export_for_project,
    list_exports_for_project,
)
from app.services.project_service import get_project_for_user
from app.services.r2_storage_service import (
    R2StorageService,
    StorageConfigurationError,
    get_r2_storage_service,
)

router = APIRouter(prefix="/projects/{project_id}/exports", tags=["exports"])


@router.post("", response_model=ExportResponse, status_code=status.HTTP_201_CREATED)
def create_export(
    project_id: UUID,
    payload: ExportCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: R2StorageService = Depends(get_r2_storage_service),
) -> ExportResponse:
    project = get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    analysis = get_latest_analysis_for_project(db, project_id)
    export, file_bytes = create_export_record(
        db,
        project=project,
        analysis=analysis,
        user_id=current_user.id,
        export_type=payload.export_type,
    )

    try:
        storage.put_object_bytes(
            object_key=export.r2_object_key,
            file_bytes=file_bytes,
            content_type=export.file_mime_type,
        )
    except StorageConfigurationError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi Cloudflare R2 belum lengkap.",
        ) from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="File export belum dapat disimpan ke storage.",
        ) from exc

    db.commit()
    db.refresh(export)
    return ExportResponse.model_validate(export)


@router.get("", response_model=list[ExportResponse])
def list_exports(
    project_id: UUID,
    sort: Literal["latest", "oldest"] = Query(default="latest"),
    export_type: Literal["all", "markdown", "pdf", "docx"] = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ExportResponse]:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    exports = list_exports_for_project(
        db,
        project_id,
        sort=sort,
        export_type=None if export_type == "all" else export_type,
    )
    return [ExportResponse.model_validate(export) for export in exports]


@router.get("/{export_id}/download", response_model=ExportDownloadResponse)
def download_export(
    project_id: UUID,
    export_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: R2StorageService = Depends(get_r2_storage_service),
) -> ExportDownloadResponse:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    export = get_export_for_project(db, export_id=export_id, project_id=project_id)
    expires_in = get_settings().presigned_upload_expires_seconds

    try:
        download_url = storage.generate_presigned_download_url(
            object_key=export.r2_object_key,
            file_name=export.file_name,
            expires_in=expires_in,
        )
    except StorageConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi Cloudflare R2 belum lengkap.",
        ) from exc

    return ExportDownloadResponse(
        export_id=export.id,
        download_url=download_url,
        expires_in=expires_in,
    )
