from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.analysis import AnalysisQueueResponse, AnalysisResponse
from app.services.analysis_queue_service import (
    AnalysisQueueError,
    AnalysisQueueService,
    get_analysis_queue_service,
)
from app.services.analysis_service import (
    create_full_analysis,
    get_active_full_analysis_for_project,
    get_analysis_for_project,
    get_latest_analysis_for_project,
    mark_analysis_queue_failed,
    mark_analysis_queued,
    prepare_failed_analysis_retry,
)
from app.services.auth_service import get_current_user
from app.services.document_service import list_documents_for_project
from app.services.project_service import get_project_for_user

router = APIRouter(prefix="/projects/{project_id}/analyses", tags=["analyses"])


@router.post(
    "/full",
    response_model=AnalysisQueueResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def queue_full_analysis(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    queue_service: AnalysisQueueService = Depends(get_analysis_queue_service),
) -> AnalysisQueueResponse:
    project = get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    documents = list_documents_for_project(db, project_id)
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unggah dan konfirmasi dokumen terlebih dahulu sebelum analisis.",
        )

    active_analysis = get_active_full_analysis_for_project(db, project_id)
    if active_analysis is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analisis untuk proyek ini masih berjalan.",
        )

    analysis = create_full_analysis(db, project)
    db.commit()
    db.refresh(analysis)

    try:
        queue_job_id = queue_service.enqueue_full_analysis(
            analysis.id,
            analysis.retry_count,
        )
    except AnalysisQueueError as exc:
        mark_analysis_queue_failed(analysis, str(exc))
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Antrean analisis belum tersedia. Coba lagi beberapa saat.",
        ) from exc

    mark_analysis_queued(analysis, queue_job_id)
    db.commit()
    db.refresh(analysis)

    return AnalysisQueueResponse(
        message="Analisis masuk antrean.",
        analysis=AnalysisResponse.model_validate(analysis),
    )


@router.get("/latest", response_model=AnalysisResponse)
def get_latest_analysis(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisResponse:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    analysis = get_latest_analysis_for_project(db, project_id)
    return AnalysisResponse.model_validate(analysis)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    project_id: UUID,
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisResponse:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    analysis = get_analysis_for_project(db, analysis_id, project_id)
    return AnalysisResponse.model_validate(analysis)


@router.post(
    "/{analysis_id}/retry",
    response_model=AnalysisQueueResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def retry_analysis(
    project_id: UUID,
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    queue_service: AnalysisQueueService = Depends(get_analysis_queue_service),
) -> AnalysisQueueResponse:
    get_project_for_user(db, project_id=project_id, user_id=current_user.id)
    analysis = get_analysis_for_project(db, analysis_id, project_id)
    prepare_failed_analysis_retry(analysis)
    db.commit()
    db.refresh(analysis)

    try:
        queue_job_id = queue_service.enqueue_full_analysis(
            analysis.id,
            analysis.retry_count,
        )
    except AnalysisQueueError as exc:
        mark_analysis_queue_failed(analysis, str(exc))
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Antrean analisis belum tersedia. Coba lagi beberapa saat.",
        ) from exc

    mark_analysis_queued(analysis, queue_job_id)
    db.commit()
    db.refresh(analysis)

    return AnalysisQueueResponse(
        message="Retry analisis masuk antrean.",
        analysis=AnalysisResponse.model_validate(analysis),
    )
