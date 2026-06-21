import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultNav } from "@/components/results/result-nav";
import { ReadinessScoreCard } from "@/components/results/readiness-score-card";
import { IssueSummaryCard } from "@/components/results/issue-summary-card";
import { mockProjects, overviewMetrics, recommendedActions } from "@/lib/mock-data";

export default function OverviewPage() {
  const project = mockProjects[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Hasil Analisis"
        title="Overview"
        description={`Proyek: ${project.title}. Ringkasan ini menggunakan mock data untuk menggambarkan hasil analisis MVP.`}
        actions={
          <Button asChild variant="secondary">
            <Link href="/projects/demo/export">
              <Download className="h-4 w-4" />
              Download Ringkasan
            </Link>
          </Button>
        }
      />
      <ResultNav />

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <ReadinessScoreCard score={project.readinessScore ?? 0} />
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>Rekomendasi Utama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {recommendedActions.map((action) => (
              <div key={action} className="rounded-md border border-border bg-slate-950/45 p-3">
                <p className="text-sm leading-6 text-slate-300">{action}</p>
              </div>
            ))}
            <Button asChild className="w-full">
              <Link href="/projects/demo/checklist">
                Lihat Checklist Revisi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewMetrics.map((metric) => (
          <IssueSummaryCard key={metric.label} metric={metric} />
        ))}
      </div>

      <Card className="mt-5 border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-5 text-sm leading-6 text-amber-100/80">
          Skor ini adalah estimasi kesiapan berdasarkan dokumen yang diunggah, bukan jaminan hasil sidang.
          Semua rekomendasi perlu diperiksa ulang bersama dosen pembimbing.
        </CardContent>
      </Card>
    </AppShell>
  );
}
