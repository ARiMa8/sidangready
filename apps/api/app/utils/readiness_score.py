from __future__ import annotations

from app.schemas.ai_analysis import GeminiAnalysisOutput, ReadinessOverview

READINESS_DISCLAIMER = (
    "Skor ini adalah estimasi kesiapan berdasarkan dokumen yang diunggah, "
    "bukan jaminan hasil sidang. Semua rekomendasi perlu ditinjau kembali "
    "oleh mahasiswa dan dosen pembimbing."
)


def calculate_readiness_overview(
    analysis: GeminiAnalysisOutput,
) -> ReadinessOverview:
    critical_contradictions = sum(
        1 for item in analysis.slide_checks if item.status == "contradictory"
    )
    unsupported_major_claims = sum(
        1
        for claim in analysis.problematic_claims
        if claim.problem_type in {"unsupported", "not_found"}
        and claim.risk_level in {"high", "critical"}
    )
    partially_supported_important_slides = sum(
        1 for item in analysis.slide_checks if item.status == "partially_supported"
    )
    critical_revision_todo = sum(
        1
        for item in analysis.revision_items
        if item.priority == "critical" and item.status == "todo"
    )
    important_revision_todo = sum(
        1
        for item in analysis.revision_items
        if item.priority == "important" and item.status == "todo"
    )

    deductions = [
        ("Kontradiksi kritis pada slide", critical_contradictions, 8),
        ("Klaim penting tidak didukung", unsupported_major_claims, 5),
        ("Slide penting hanya didukung sebagian", partially_supported_important_slides, 3),
        ("Revisi critical masih todo", critical_revision_todo, 2),
        ("Revisi important masih todo", important_revision_todo, 1),
    ]
    score = 100 - sum(count * weight for _, count, weight in deductions)
    score = max(0, min(100, score))

    critical_issues = (
        critical_contradictions
        + sum(1 for claim in analysis.problematic_claims if claim.risk_level == "critical")
        + critical_revision_todo
    )
    important_issues = (
        unsupported_major_claims
        + partially_supported_important_slides
        + important_revision_todo
        + sum(1 for claim in analysis.problematic_claims if claim.risk_level == "high")
    )
    minor_issues = (
        sum(1 for item in analysis.revision_items if item.priority == "minor")
        + sum(1 for claim in analysis.problematic_claims if claim.risk_level in {"low", "medium"})
    )

    explanation = [
        f"Base score: 100.",
        *[
            f"-{count * weight} dari {label} ({count} x {weight})."
            for label, count, weight in deductions
            if count > 0
        ],
    ]
    if len(explanation) == 1:
        explanation.append("Tidak ada pengurang deterministik yang terdeteksi.")

    return ReadinessOverview(
        readiness_score=score,
        readiness_category=readiness_category(score),
        critical_issues_count=critical_issues,
        important_issues_count=important_issues,
        minor_issues_count=minor_issues,
        total_slides_checked=len(analysis.slide_checks),
        total_revision_items=len(analysis.revision_items),
        total_examiner_questions=len(analysis.defense_questions),
        score_explanation=explanation,
        recommended_next_actions=analysis.recommended_next_actions,
        disclaimer=READINESS_DISCLAIMER,
    )


def readiness_category(score: int) -> str:
    if score <= 39:
        return "Belum Siap"
    if score <= 59:
        return "Perlu Banyak Revisi"
    if score <= 74:
        return "Cukup Siap"
    if score <= 89:
        return "Siap dengan Catatan"
    return "Sangat Siap"
