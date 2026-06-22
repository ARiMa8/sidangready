from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session_factory
from app.models.analysis import Analysis
from app.models.document import Document
from app.models.project import Project


def run_full_analysis_task(analysis_id: str) -> dict[str, object]:
    """Run the Phase 5 placeholder analysis task.

    Phase 5 only proves the async queue path. Real Gemini analysis starts in
    Phase 6, so this task records document readiness metadata without creating
    academic claims, answers, or fake evidence.
    """

    parsed_analysis_id = UUID(analysis_id)
    session_factory = get_session_factory()

    with session_factory() as db:
        analysis = _get_analysis(db, parsed_analysis_id)
        project = db.get(Project, analysis.project_id)
        if project is None:
            _mark_failed(db, analysis, "Proyek analisis tidak ditemukan.")
            return {"status": "failed", "analysis_id": analysis_id}

        try:
            _set_progress(db, analysis, "running", 10, "Memeriksa dokumen proyek.")
            documents = _list_project_documents(db, analysis.project_id)
            if not documents:
                raise ValueError("Belum ada dokumen yang dikonfirmasi untuk proyek ini.")

            _set_progress(db, analysis, "running", 35, "Membaca status ekstraksi dokumen.")
            document_summary = _summarize_documents(documents)

            _set_progress(db, analysis, "running", 60, "Menyiapkan konteks analisis.")
            extracted_documents = [
                item for item in document_summary if item["extraction_status"] == "success"
            ]

            _set_progress(
                db,
                analysis,
                "running",
                85,
                "Menunggu integrasi Gemini pada Phase 6.",
            )
            result = {
                "phase": "phase_5_queue_placeholder",
                "message": (
                    "Queue dan worker berhasil menjalankan placeholder analisis. "
                    "Analisis AI Gemini belum diaktifkan pada Phase 5."
                ),
                "document_count": len(document_summary),
                "extracted_document_count": len(extracted_documents),
                "documents": document_summary,
                "disclaimer": (
                    "Hasil ini hanya status teknis antrean dan parsing dokumen, "
                    "bukan analisis kesiapan sidang."
                ),
            }

            analysis.status = "success"
            analysis.progress = 100
            analysis.current_step = "Placeholder analisis selesai."
            analysis.result_json = result
            analysis.error_message = None
            project.status = "analysis_complete"
            db.commit()
            return {"status": "success", "analysis_id": analysis_id}
        except Exception as exc:
            _mark_failed(db, analysis, str(exc))
            return {"status": "failed", "analysis_id": analysis_id}


def _get_analysis(db: Session, analysis_id: UUID) -> Analysis:
    analysis = db.get(Analysis, analysis_id)
    if analysis is None:
        raise ValueError("Analisis tidak ditemukan.")
    return analysis


def _list_project_documents(db: Session, project_id: UUID) -> list[Document]:
    statement = (
        select(Document)
        .where(Document.project_id == project_id)
        .order_by(Document.created_at.asc())
    )
    return list(db.execute(statement).scalars().all())


def _summarize_documents(documents: list[Document]) -> list[dict[str, object]]:
    summary = []
    for document in documents:
        summary.append(
            {
                "document_id": str(document.id),
                "document_type": document.document_type,
                "file_name": document.file_name,
                "extraction_status": document.extraction_status,
                "extracted_text_length": len(document.extracted_text or ""),
                "page_count": document.page_count,
                "slide_count": document.slide_count,
                "warning": document.extraction_warning,
            }
        )
    return summary


def _set_progress(
    db: Session,
    analysis: Analysis,
    status: str,
    progress: int,
    current_step: str,
) -> None:
    analysis.status = status
    analysis.progress = progress
    analysis.current_step = current_step
    db.commit()
    db.refresh(analysis)


def _mark_failed(db: Session, analysis: Analysis, error_message: str) -> None:
    project = db.get(Project, analysis.project_id)
    analysis.status = "failed"
    analysis.current_step = "Analisis gagal diproses."
    analysis.error_message = error_message
    if project is not None:
        project.status = "needs_revision"
    db.commit()
