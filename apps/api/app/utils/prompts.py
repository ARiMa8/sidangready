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
  "official_revision_items": [
    {
      "title": "...",
      "description": "...",
      "priority": "critical|important|minor",
      "related_chapter": "BAB ... atau null",
      "related_slide": 1,
      "reason": "Diambil dari catatan revisi yang diberikan user.",
      "suggested_action": "...",
      "status": "todo"
    }
  ],
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
    target_presentation_minutes: int,
) -> str:
    return f"""
{BASE_ETHICAL_RULES}

Tugas:
Lakukan analisis kesiapan sidang berdasarkan struktur dan klaim yang sudah diekstrak.
Buat:
1. checklist revisi skripsi dari catatan revisi user bila tersedia,
2. checklist temuan dan perbaikan dari analisis AI,
3. konsistensi slide vs laporan,
4. klaim bermasalah,
5. pertanyaan penguji,
6. script presentasi standar {target_presentation_minutes} menit,
7. rekomendasi langkah berikutnya.

Batas output:
- official_revision_items: hanya dari catatan revisi user. Jika tidak ada catatan revisi eksplisit, isi array kosong.
- revision_items: 5 sampai 10 temuan/perbaikan paling penting dari analisis laporan dan slide.
- slide_checks: cek slide yang memiliki klaim, maksimal 30 slide.
- problematic_claims: maksimal 8 klaim paling berisiko.
- defense_questions: 8 sampai 12 pertanyaan.
- presentation_scripts: satu script per slide dengan total estimasi durasi mendekati {target_presentation_minutes} menit, maksimal 20 slide.

Aturan bukti:
- Gunakan hanya informasi dari laporan, slide, dan catatan revisi.
- Jika bukti tidak ditemukan, jangan mengarang. Pakai kalimat:
  "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah."
- Untuk evidence_excerpt, isi kutipan pendek atau null jika tidak ada bukti eksplisit.
- Jangan membuat jawaban final yang seolah pasti benar; berikan panduan jawaban.
- Status checklist default harus "todo".
- Jangan mencampur catatan revisi resmi user ke revision_items. Masukkan catatan revisi resmi user ke official_revision_items.
- Jangan memasukkan temuan AI ke official_revision_items.

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
