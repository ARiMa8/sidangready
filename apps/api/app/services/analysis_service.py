from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.analysis import Analysis
from app.models.project import Project

ACTIVE_ANALYSIS_STATUSES = {"pending", "queued", "running"}


def get_analysis_for_project(
    db: Session,
    analysis_id: UUID,
    project_id: UUID,
) -> Analysis:
    statement = select(Analysis).where(
        Analysis.id == analysis_id,
        Analysis.project_id == project_id,
    )
    analysis = db.execute(statement).scalar_one_or_none()
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analisis tidak ditemukan.",
        )
    return analysis


def get_latest_analysis_for_project(
    db: Session,
    project_id: UUID,
) -> Analysis:
    statement = (
        select(Analysis)
        .where(Analysis.project_id == project_id)
        .order_by(Analysis.created_at.desc())
        .limit(1)
    )
    analysis = db.execute(statement).scalar_one_or_none()
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Belum ada analisis untuk proyek ini.",
        )
    return analysis


def get_active_full_analysis_for_project(
    db: Session,
    project_id: UUID,
) -> Analysis | None:
    statement = (
        select(Analysis)
        .where(
            Analysis.project_id == project_id,
            Analysis.analysis_type == "full_readiness",
            Analysis.status.in_(ACTIVE_ANALYSIS_STATUSES),
        )
        .order_by(Analysis.created_at.desc())
        .limit(1)
    )
    return db.execute(statement).scalar_one_or_none()


def create_full_analysis(db: Session, project: Project) -> Analysis:
    settings = get_settings()
    analysis = Analysis(
        project_id=project.id,
        analysis_type="full_readiness",
        status="pending",
        progress=0,
        current_step="Menyiapkan antrean analisis.",
        retry_count=0,
        max_retries=settings.analysis_max_retries,
    )
    project.status = "analyzing"
    db.add(analysis)
    return analysis


def mark_analysis_queued(analysis: Analysis, queue_job_id: str) -> None:
    analysis.status = "queued"
    analysis.progress = 0
    analysis.current_step = (
        "Analisis masuk antrean. Proses dapat memakan waktu beberapa menit "
        "tergantung ukuran dokumen."
    )
    analysis.queue_job_id = queue_job_id
    analysis.error_message = None


def mark_analysis_queue_failed(analysis: Analysis, error_message: str) -> None:
    analysis.status = "failed"
    analysis.progress = 0
    analysis.current_step = "Gagal memasukkan analisis ke antrean."
    analysis.error_message = error_message


def prepare_failed_analysis_retry(analysis: Analysis) -> None:
    if analysis.status != "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hanya analisis yang gagal yang dapat dicoba ulang.",
        )
    if analysis.retry_count >= analysis.max_retries:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Batas retry analisis sudah tercapai.",
        )

    analysis.retry_count += 1
    analysis.status = "pending"
    analysis.progress = 0
    analysis.current_step = "Menyiapkan retry analisis."
    analysis.queue_job_id = None
    analysis.error_message = None
    analysis.result_json = None
