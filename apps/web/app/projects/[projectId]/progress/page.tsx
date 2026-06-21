import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { AnalysisStepper } from "@/components/analysis/analysis-stepper";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { analysisSteps } from "@/lib/mock-data";

export default function ProgressPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Progress Analisis"
        title="AI sedang menyiapkan laporan kesiapan"
        description="Worker asli belum aktif pada Phase 1, tetapi halaman ini menggambarkan status antrean dan tahapan analisis MVP."
        actions={
          <Button asChild variant="secondary">
            <Link href="/projects/demo/overview">Lihat hasil mock</Link>
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <AnalysisStepper steps={analysisSteps} progress={42} />
        <div className="space-y-4">
          <LoadingState
            title="Current step: Pemetaan slide"
            description="Mencari dukungan eksplisit dari laporan untuk klaim pada slide."
          />
          <ErrorState
            title="Contoh error state"
            description="Jika ekstraksi gagal atau file tidak valid, pengguna akan melihat pesan jelas dan opsi retry yang aman."
            actionLabel="Retry"
          />
          <Button variant="secondary" className="w-full">
            <RotateCcw className="h-4 w-4" />
            Retry Aman
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
