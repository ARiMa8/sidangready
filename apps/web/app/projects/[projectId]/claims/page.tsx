import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResultNav } from "@/components/results/result-nav";
import { ProblematicClaimCard } from "@/components/results/problematic-claim-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { problematicClaims } from "@/lib/mock-data";

export default function ClaimsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Hasil Analisis"
        title="Klaim Bermasalah"
        description="Klaim yang tidak didukung, kontradiktif, terlalu luas, atau berisiko saat sidang ditampilkan sebagai prioritas revisi."
        actions={
          <>
            <StatusBadge tone="rose">Kontradiktif 2</StatusBadge>
            <StatusBadge tone="amber">Terlalu luas 1</StatusBadge>
          </>
        }
      />
      <ResultNav />
      <div className="space-y-4">
        {problematicClaims.map((claim) => (
          <ProblematicClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </AppShell>
  );
}
