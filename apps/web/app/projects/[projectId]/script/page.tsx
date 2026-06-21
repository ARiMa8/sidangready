import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResultNav } from "@/components/results/result-nav";
import { PresentationScriptPanel } from "@/components/results/presentation-script-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { presentationScript } from "@/lib/mock-data";

export default function ScriptPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Hasil Analisis"
        title="Script Presentasi"
        description="Naskah presentasi per slide untuk mode Standar 10 Menit. Pengguna tetap perlu menyesuaikan gaya bicara sendiri."
        actions={<StatusBadge tone="indigo">Standar 10 Menit</StatusBadge>}
      />
      <ResultNav />
      <PresentationScriptPanel slides={presentationScript} />
    </AppShell>
  );
}
