from __future__ import annotations

EXTRACTION_JSON_SHAPE = """
{
  "thesis_structure": {
    "title": "...",
    "problem_statements": ["..."],
    "objectives": ["..."],
    "methodology": "...",
    "dataset_or_data": "...",
    "implementation": "...",
    "evaluation_metrics": ["..."],
    "results": ["..."],
    "conclusion": "...",
    "limitations": ["..."]
  },
  "slide_claims": [
    {"slide_number": 1, "slide_title": "...", "claims": ["..."]}
  ]
}
"""

ANALYSIS_JSON_SHAPE = """
{
  "overall_summary": "...",
  "revision_items": [
    {
      "title": "...",
      "description": "...",
      "priority": "critical|important|minor",
      "related_chapter": "BAB ... atau null",
      "related_slide": 1,
      "reason": "...",
      "suggested_action": "...",
      "status": "todo"
    }
  ],
  "slide_checks": [
    {
      "slide_number": 1,
      "slide_title": "...",
      "detected_claim": "...",
      "matched_thesis_section": "... atau null",
      "status": "supported|partially_supported|unsupported|contradictory|needs_clarification",
      "issue_summary": "...",
      "suggested_fix": "...",
      "evidence_excerpt": "... atau null"
    }
  ],
  "problematic_claims": [
    {
      "slide_number": 1,
      "claim_text": "...",
      "problem_type": "unsupported|contradictory|too_broad|unclear|not_found",
      "risk_level": "low|medium|high|critical",
      "evidence_excerpt": "... atau null",
      "suggested_revision": "..."
    }
  ],
  "defense_questions": [
    {
      "category": "Metodologi",
      "question": "...",
      "why_asked": "...",
      "answer_guidance": "...",
      "related_section": "... atau null",
      "difficulty": "easy|medium|hard"
    }
  ],
  "presentation_scripts": [
    {
      "slide_number": 1,
      "slide_title": "...",
      "estimated_duration_seconds": 60,
      "script_text": "...",
      "key_points": ["..."],
      "delivery_tips": ["..."]
    }
  ],
  "recommended_next_actions": ["..."],
  "disclaimer": "Hasil ini adalah saran AI dan perlu ditinjau kembali."
}
"""

BASE_ETHICAL_RULES = """
Anda adalah SidangReady AI, asisten review kesiapan sidang skripsi.
Gunakan Bahasa Indonesia formal-akademik yang jelas dan membantu.
Jangan menulis skripsi dari nol. Jangan membuat data, sitasi, hasil uji,
metodologi, atau bukti yang tidak ada pada dokumen. Jika bukti tidak ditemukan,
tulis dengan jelas: "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah."
Jangan membuat klaim dijamin lulus, pasti disetujui, atau pasti benar.
Semua output adalah saran yang perlu ditinjau mahasiswa dan dosen pembimbing.
"""


def build_extraction_prompt(
    *,
    project_context: str,
    thesis_text: str,
    slides_text: str,
    revision_notes: str,
) -> str:
    return f"""
{BASE_ETHICAL_RULES}

Tugas:
Ekstrak struktur utama laporan skripsi dan klaim per slide dari dokumen berikut.
Fokus pada isi yang eksplisit ada di dokumen.

Project:
{project_context}

Laporan skripsi terkompaksi:
{thesis_text}

Slide sidang terkompaksi:
{slides_text}

Catatan revisi:
{revision_notes or "Tidak ada catatan revisi eksplisit."}

Kembalikan hanya JSON valid dengan bentuk berikut:
{EXTRACTION_JSON_SHAPE}
"""


def build_analysis_prompt(
    *,
    project_context: str,
    extraction_json: str,
    thesis_text: str,
    slides_text: str,
    revision_notes: str,
) -> str:
    return f"""
{BASE_ETHICAL_RULES}

Tugas:
Lakukan analisis kesiapan sidang berdasarkan struktur dan klaim yang sudah diekstrak.
Buat:
1. checklist revisi,
2. konsistensi slide vs laporan,
3. klaim bermasalah,
4. pertanyaan penguji,
5. script presentasi standar 10 menit,
6. rekomendasi langkah berikutnya.

Batas output:
- revision_items: 5 sampai 10 item paling penting.
- slide_checks: cek slide yang memiliki klaim, maksimal 30 slide.
- problematic_claims: maksimal 8 klaim paling berisiko.
- defense_questions: 8 sampai 12 pertanyaan.
- presentation_scripts: satu script ringkas per slide, maksimal 20 slide.

Aturan bukti:
- Gunakan hanya informasi dari laporan, slide, dan catatan revisi.
- Jika bukti tidak ditemukan, jangan mengarang. Pakai kalimat:
  "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah."
- Untuk evidence_excerpt, isi kutipan pendek atau null jika tidak ada bukti eksplisit.
- Jangan membuat jawaban final yang seolah pasti benar; berikan panduan jawaban.
- Status checklist default harus "todo".

Project:
{project_context}

Hasil ekstraksi awal:
{extraction_json}

Laporan skripsi terkompaksi:
{thesis_text}

Slide sidang terkompaksi:
{slides_text}

Catatan revisi:
{revision_notes or "Tidak ada catatan revisi eksplisit."}

Kembalikan hanya JSON valid dengan bentuk berikut:
{ANALYSIS_JSON_SHAPE}
"""
