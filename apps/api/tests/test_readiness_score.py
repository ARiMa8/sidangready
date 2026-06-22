from __future__ import annotations

import unittest

from app.schemas.ai_analysis import (
    GeminiAnalysisOutput,
    ProblematicClaimOutput,
    RevisionItemOutput,
    SlideConsistencyOutput,
)
from app.utils.readiness_score import calculate_readiness_overview


class ReadinessScoreTestCase(unittest.TestCase):
    def test_calculates_deterministic_readiness_score(self) -> None:
        analysis = GeminiAnalysisOutput(
            overall_summary="Ringkasan test.",
            revision_items=[
                RevisionItemOutput(
                    title="Perbaiki kontradiksi",
                    description="Ada kontradiksi di slide.",
                    priority="critical",
                    related_chapter="BAB IV",
                    related_slide=2,
                    reason="Risiko tinggi saat sidang.",
                    suggested_action="Samakan klaim dengan laporan.",
                ),
                RevisionItemOutput(
                    title="Lengkapi batasan",
                    description="Batasan belum eksplisit.",
                    priority="important",
                    reason="Agar cakupan jelas.",
                    suggested_action="Tambahkan batasan sistem.",
                ),
            ],
            slide_checks=[
                SlideConsistencyOutput(
                    slide_number=2,
                    slide_title="Hasil",
                    detected_claim="Sistem real-time.",
                    matched_thesis_section="BAB IV",
                    status="contradictory",
                    issue_summary="Slide menyebut real-time, laporan tidak.",
                    suggested_fix="Gunakan istilah yang sesuai laporan.",
                    evidence_excerpt="Tidak ditemukan dukungan eksplisit pada laporan.",
                ),
                SlideConsistencyOutput(
                    slide_number=3,
                    slide_title="Evaluasi",
                    detected_claim="Semua skenario berhasil.",
                    matched_thesis_section="BAB IV",
                    status="partially_supported",
                    issue_summary="Sebagian skenario didukung.",
                    suggested_fix="Tulis skenario yang benar-benar diuji.",
                    evidence_excerpt="Sebagian skenario pengujian berhasil.",
                ),
            ],
            problematic_claims=[
                ProblematicClaimOutput(
                    slide_number=2,
                    claim_text="Sistem real-time.",
                    problem_type="unsupported",
                    risk_level="high",
                    evidence_excerpt=None,
                    suggested_revision="Ganti dengan klaim yang terukur.",
                )
            ],
            defense_questions=[],
            presentation_scripts=[],
            recommended_next_actions=["Revisi slide hasil."],
            disclaimer="Saran AI.",
        )

        overview = calculate_readiness_overview(analysis)

        self.assertEqual(overview.readiness_score, 81)
        self.assertEqual(overview.readiness_category, "Siap dengan Catatan")
        self.assertEqual(overview.total_slides_checked, 2)
