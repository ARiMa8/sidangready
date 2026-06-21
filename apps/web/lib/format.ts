export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) {
    return `${rest} detik`;
  }
  return rest === 0 ? `${minutes} menit` : `${minutes} menit ${rest} detik`;
}

export function getScoreCategory(score: number) {
  if (score >= 90) return "Sangat Siap";
  if (score >= 75) return "Siap dengan Catatan";
  if (score >= 60) return "Cukup Siap";
  if (score >= 40) return "Perlu Banyak Revisi";
  return "Belum Siap";
}
