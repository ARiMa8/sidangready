from __future__ import annotations

import unittest

from app.schemas.ai_analysis import GeminiAnalysisOutput


class AiAnalysisSchemaTest(unittest.TestCase):
    def test_normalizes_common_gemini_schema_variants(self) -> None:
        output = GeminiAnalysisOutput.model_validate(
            {
                "overall_summary": "Ringkasan analisis.",
                "official_revision_items": [
                    {
                        "title": "Revisi penguji",
                        "description": "Tambahkan hasil uji.",
                        "priority": "tinggi",
                        "related_chapter": "BAB IV",
                        "related_slide": "Slide 3",
                        "reason": "Catatan revisi resmi.",
                        "suggested_action": "Lengkapi pengujian.",
                        "status": "selesai",
                    }
                ],
                "revision_items": [
                    {
                        "title": "Perjelas klaim stabilitas",
                        "description": "Klaim perlu metrik.",
                        "priority": "medium",
                        "related_chapter": "BAB IV",
                        "related_slide": "Slide 3",
                        "reason": "Belum ada metrik eksplisit.",
                        "suggested_action": "Tambahkan metrik stabilitas.",
                        "status": "in progress",
                    }
                ],
                "slide_checks": [
                    {
                        "slide_number": "Slide 3",
                        "slide_title": "Rumusan Masalah",
                        "detected_claim": "Arsitektur stabil.",
                        "matched_thesis_section": "BAB I",
                        "status": "sebagian didukung",
                        "issue_summary": "Perlu metrik.",
                        "suggested_fix": "Tambahkan hasil uji.",
                        "evidence_excerpt": None,
                    }
                ],
                "problematic_claims": [
                    {
                        "slide_number": "5",
                        "claim_text": "Sistem responsif.",
                        "problem_type": "terlalu luas",
                        "risk_level": "tinggi",
                        "evidence_excerpt": None,
                        "suggested_revision": "Tambahkan latensi.",
                    }
                ],
                "defense_questions": [
                    {
                        "category": "Evaluasi",
                        "question": "Bagaimana mengukur stabilitas?",
                        "why_asked": "Klaim perlu bukti.",
                        "answer_guidance": "Rujuk metrik dan hasil uji.",
                        "related_section": "BAB IV",
                        "difficulty": "sulit",
                    }
                ],
                "presentation_scripts": [
                    {
                        "slide_number": "Slide 2",
                        "slide_title": "Latar Belakang",
                        "estimated_duration_seconds": "1 menit",
                        "script_text": "Jelaskan latar belakang.",
                        "key_points": "- Masalah\n- Tujuan",
                        "delivery_tips": "Gunakan tempo tenang.",
                    }
                ],
                "recommended_next_actions": "Tambahkan metrik stabilitas.",
                "disclaimer": "Hasil perlu ditinjau.",
            }
        )

        self.assertEqual(output.official_revision_items[0].priority, "critical")
        self.assertEqual(output.official_revision_items[0].related_slide, 3)
        self.assertEqual(output.official_revision_items[0].status, "done")
        self.assertEqual(output.revision_items[0].status, "in_progress")
        self.assertEqual(output.slide_checks[0].slide_number, 3)
        self.assertEqual(output.slide_checks[0].status, "partially_supported")
        self.assertEqual(output.problematic_claims[0].problem_type, "too_broad")
        self.assertEqual(output.presentation_scripts[0].estimated_duration_seconds, 60)
        self.assertEqual(output.presentation_scripts[0].key_points, ["Masalah", "Tujuan"])
        self.assertEqual(output.recommended_next_actions, ["Tambahkan metrik stabilitas."])


if __name__ == "__main__":
    unittest.main()
