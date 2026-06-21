import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResultNav } from "@/components/results/result-nav";
import { RevisionChecklist } from "@/components/results/revision-checklist";
import { StatusBadge } from "@/components/ui/status-badge";
import { revisionItems } from "@/lib/mock-data";

export default function ChecklistPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Hasil Analisis"
        title="Checklist Revisi"
        description="Daftar revisi dikelompokkan berdasarkan prioritas agar langkah berikutnya lebih mudah diputuskan."
        actions={
          <>
            <StatusBadge tone="rose">Kritis 3</StatusBadge>
            <StatusBadge tone="amber">Penting 2</StatusBadge>
            <StatusBadge tone="emerald">Minor 1</StatusBadge>
          </>
        }
      />
      <ResultNav />
      <RevisionChecklist items={revisionItems} />
    </AppShell>
  );
}
