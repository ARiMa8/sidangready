import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResultNav } from "@/components/results/result-nav";
import { ExportOptionsCard } from "@/components/results/export-options-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { exportOptions, mockProjects, overviewMetrics } from "@/lib/mock-data";

export default function ExportPage() {
  const project = mockProjects[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Export / Laporan Final"
        title="Export Laporan Final"
        description="Untuk MVP, Markdown menjadi prioritas. PDF dan DOCX ditampilkan sebagai format terencana."
        actions={<StatusBadge tone="emerald">Markdown tersedia</StatusBadge>}
      />
      <ResultNav />

      <Card className="mb-5">
        <CardHeader className="border-b border-border">
          <CardTitle>Ringkasan Laporan Final</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Proyek</p>
            <p className="mt-1 text-sm font-medium text-slate-100">{project.title}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Readiness Score</p>
            <p className="mt-1 text-sm font-medium text-emerald-300">
              {project.readinessScore}/100
            </p>
          </div>
          {overviewMetrics.slice(0, 2).map((metric) => (
            <div key={metric.label}>
              <p className="text-xs text-slate-500">{metric.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-100">{metric.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <ExportOptionsCard options={exportOptions} />

      <Card className="mt-5 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="flex gap-3 p-5 text-sm leading-6 text-emerald-100/80">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <p>
            Laporan final memuat ringkasan proyek, readiness score, checklist revisi,
            konsistensi slide, klaim bermasalah, pertanyaan penguji, script presentasi,
            rekomendasi tindakan, dan disclaimer.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
