from __future__ import annotations

import json
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.analysis import Analysis
from app.models.document import Document
from app.models.project import Project
from app.schemas.ai_analysis import (
    ExtractionBundle,
    FullReadinessResult,
    GeminiAnalysisOutput,
)
from app.services.gemini_service import GeminiService, get_gemini_service
from app.utils.prompts import build_analysis_prompt, build_extraction_prompt
from app.utils.readiness_score import calculate_readiness_overview
from app.utils.text_chunking import compact_text


@dataclass(frozen=True)
class DocumentContext:
    thesis_text: str
    slides_text: str
    revision_notes: str


def run_full_readiness_analysis(
    db: Session,
    *,
    analysis: Analysis,
    project: Project,
    documents: list[Document],
    gemini_service: GeminiService | None = None,
) -> FullReadinessResult:
    settings = get_settings()
    service = gemini_service or get_gemini_service()
    context = build_document_context(documents)
    project_context = build_project_context(project)

    _set_progress(db, analysis, "running", 20, "Menyiapkan konteks dokumen.")
    extraction_prompt = build_extraction_prompt(
        project_context=project_context,
        thesis_text=context.thesis_text,
        slides_text=context.slides_text,
        revision_notes=context.revision_notes,
    )
    extraction = service.generate_structured(
        model_name=settings.gemini_cheap_model,
        prompt=extraction_prompt,
        response_model=ExtractionBundle,
    )

    _set_progress(db, analysis, "running", 45, "Menganalisis konsistensi dan revisi.")
    analysis_prompt = build_analysis_prompt(
        project_context=project_context,
        extraction_json=extraction.model_dump_json(),
        thesis_text=context.thesis_text,
        slides_text=context.slides_text,
        revision_notes=context.revision_notes,
    )
    gemini_analysis = service.generate_structured(
        model_name=settings.gemini_analysis_model,
        prompt=analysis_prompt,
        response_model=GeminiAnalysisOutput,
    )

    _set_progress(db, analysis, "running", 75, "Menghitung readiness score deterministik.")
    overview = calculate_readiness_overview(gemini_analysis)
    result = FullReadinessResult(
        extraction_model=settings.gemini_cheap_model,
        analysis_model=settings.gemini_analysis_model,
        thesis_structure=extraction.thesis_structure,
        slide_claims=extraction.slide_claims,
        overview=overview,
        revision_items=gemini_analysis.revision_items,
        slide_checks=gemini_analysis.slide_checks,
        problematic_claims=gemini_analysis.problematic_claims,
        defense_questions=gemini_analysis.defense_questions,
        presentation_scripts=gemini_analysis.presentation_scripts,
        overall_summary=gemini_analysis.overall_summary,
        raw_disclaimer=gemini_analysis.disclaimer,
    )

    analysis.status = "success"
    analysis.progress = 100
    analysis.current_step = "Analisis Gemini selesai."
    analysis.model_provider = "google_gemini"
    analysis.model_name = settings.gemini_analysis_model
    analysis.result_json = result.model_dump(mode="json")
    analysis.error_message = None
    project.status = "analysis_complete"
    project.readiness_score = result.overview.readiness_score
    db.commit()
    return result


def build_document_context(documents: list[Document]) -> DocumentContext:
    settings = get_settings()
    thesis_parts = []
    slide_parts = []
    revision_parts = []

    for document in documents:
        if document.extraction_status != "success" or not document.extracted_text:
            continue
        if document.document_type == "thesis":
            thesis_parts.append(document.extracted_text)
        elif document.document_type == "slides":
            slide_parts.append(document.extracted_text)
        elif document.document_type == "revision_notes":
            revision_parts.append(document.extracted_text)

    if not thesis_parts:
        raise ValueError("Teks laporan skripsi belum berhasil diekstrak.")
    if not slide_parts:
        raise ValueError("Teks slide sidang belum berhasil diekstrak.")

    return DocumentContext(
        thesis_text=compact_text(
            "\n\n".join(thesis_parts),
            settings.gemini_max_thesis_chars,
        ),
        slides_text=compact_text(
            "\n\n".join(slide_parts),
            settings.gemini_max_slide_chars,
        ),
        revision_notes=compact_text(
            "\n\n".join(revision_parts),
            settings.gemini_max_revision_chars,
        ),
    )


def build_project_context(project: Project) -> str:
    data = {
        "nama_proyek": project.title,
        "judul_skripsi": project.thesis_title,
        "nama_mahasiswa": project.student_name,
        "universitas": project.university,
        "program_studi": project.major,
        "deskripsi": project.description,
        "target_durasi_presentasi_menit": project.target_presentation_minutes,
    }
    return json.dumps(data, ensure_ascii=False)


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
