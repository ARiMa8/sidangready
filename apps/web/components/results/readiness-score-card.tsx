import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getScoreCategory } from "@/lib/format";

export function ReadinessScoreCard({ score }: { score: number }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Readiness Score</CardTitle>
          <StatusBadge tone="amber">{getScoreCategory(score)}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-5 md:grid-cols-[220px_1fr] md:items-center">
        <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-slate-950 p-4">
          <div
            className="flex h-full w-full items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#6366F1 ${score * 3.6}deg, #1E293B 0deg)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card">
              <span className="text-4xl font-semibold">{score}</span>
              <span className="text-xs text-slate-500">dari 100</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-indigo-300">
            <Gauge className="h-5 w-5" />
            <p className="font-semibold">Estimasi kesiapan dokumen</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Skor ini adalah estimasi kesiapan berdasarkan dokumen yang diunggah, bukan jaminan hasil sidang.
            Nilai dihitung dari jumlah kontradiksi, klaim tidak didukung, dan item revisi prioritas.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-slate-950/40 p-3">
              Formula backend nanti bersifat deterministik.
            </div>
            <div className="rounded-md border border-border bg-slate-950/40 p-3">
              Hasil tetap perlu ditinjau bersama pembimbing.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
