import type {
  ChecklistStatus,
  ConsistencyStatus,
  Priority,
  ProjectStatus,
  RiskLevel,
  StepStatus,
} from "@/types";

export const APP_NAME = "SidangReady AI";
export const APP_SUBTITLE = "Skripsi Defense & Revision Agent";
export const TAGLINE =
  "Persiapan sidang lebih terstruktur. Revisi lebih cepat. Hasil lebih siap.";

export const PRIVACY_COPY =
  "File yang diunggah digunakan untuk proses analisis dan dapat dihapus otomatis setelah periode tertentu. Jangan unggah dokumen yang tidak boleh Anda bagikan atau dokumen yang bukan milik Anda.";

export const ETHICAL_DISCLAIMER =
  "SidangReady AI bukan alat untuk membuat skripsi dari nol. Aplikasi ini membantu mahasiswa mengecek, merevisi, dan mempersiapkan sidang berdasarkan dokumen yang sudah dimiliki.";

export const SCORE_CATEGORY = [
  { min: 90, label: "Sangat Siap" },
  { min: 75, label: "Siap dengan Catatan" },
  { min: 60, label: "Cukup Siap" },
  { min: 40, label: "Perlu Banyak Revisi" },
  { min: 0, label: "Belum Siap" },
];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  uploaded: "Uploaded",
  analyzing: "Analyzing",
  analysis_complete: "Analysis Complete",
  needs_revision: "Needs Revision",
  ready_for_defense: "Ready for Defense",
  archived: "Archived",
};

export const PROJECT_STATUS_TONE: Record<ProjectStatus, string> = {
  draft: "slate",
  uploaded: "indigo",
  analyzing: "indigo",
  analysis_complete: "emerald",
  needs_revision: "amber",
  ready_for_defense: "emerald",
  archived: "slate",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Kritis",
  important: "Penting",
  minor: "Minor",
};

export const CHECKLIST_STATUS_LABEL: Record<ChecklistStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  ignored: "Ignored",
};

export const CONSISTENCY_LABEL: Record<ConsistencyStatus, string> = {
  supported: "Didukung",
  partially_supported: "Sebagian",
  unsupported: "Tidak Didukung",
  contradictory: "Kontradiktif",
  needs_clarification: "Perlu Klarifikasi",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  critical: "Kritis",
};

export const STEP_STATUS_LABEL: Record<StepStatus, string> = {
  pending: "Menunggu",
  running: "Berjalan",
  success: "Selesai",
  failed: "Gagal",
  skipped: "Dilewati",
};
