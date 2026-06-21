import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResultNav } from "@/components/results/result-nav";
import { SlideConsistencyTable } from "@/components/results/slide-consistency-table";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { slideChecks } from "@/lib/mock-data";

export default function ConsistencyPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Hasil Analisis"
        title="Konsistensi Slide vs Laporan"
        description="Setiap klaim pada slide dibandingkan dengan bagian laporan yang relevan. Jika bukti tidak ditemukan, UI menyatakannya secara eksplisit."
        actions={
          <>
            <StatusBadge tone="emerald">Didukung 22</StatusBadge>
            <StatusBadge tone="amber">Sebagian 7</StatusBadge>
            <StatusBadge tone="rose">Tidak Didukung 5</StatusBadge>
          </>
        }
      />
      <ResultNav />
      <Card className="mb-5 border-indigo-500/30 bg-indigo-500/5">
        <CardContent className="p-5 text-sm leading-6 text-indigo-100/80">
          Tidak ditemukan dukungan eksplisit pada laporan yang diunggah akan digunakan ketika bukti tidak tersedia.
          Sistem tidak boleh mengarang evidence.
        </CardContent>
      </Card>
      <SlideConsistencyTable checks={slideChecks} />
    </AppShell>
  );
}
