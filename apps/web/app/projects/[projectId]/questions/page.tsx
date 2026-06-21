import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResultNav } from "@/components/results/result-nav";
import { DefenseQuestionCard } from "@/components/results/defense-question-card";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { defenseQuestions } from "@/lib/mock-data";

const categories = [
  "Semua",
  "Metodologi",
  "Implementasi",
  "Evaluasi",
  "Kontribusi",
  "Batasan Penelitian",
  "Dataset/Data",
];

export default function QuestionsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Hasil Analisis"
        title="Pertanyaan Penguji"
        description="Pertanyaan disusun sebagai panduan latihan, bukan jawaban final yang dijamin benar."
        actions={<StatusBadge tone="emerald">28 pertanyaan</StatusBadge>}
      />
      <ResultNav />
      <Card className="mb-5">
        <CardContent className="flex flex-wrap gap-2 p-4">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`h-8 rounded-md border px-3 text-xs ${
                index === 0
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
                  : "border-border bg-slate-950/45 text-slate-400"
              }`}
            >
              {category}
            </button>
          ))}
        </CardContent>
      </Card>
      <div className="space-y-4">
        {defenseQuestions.map((question) => (
          <DefenseQuestionCard key={question.id} question={question} />
        ))}
      </div>
      <Card className="mt-5 border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-5 text-sm leading-6 text-amber-100/80">
          Panduan jawaban ini perlu disesuaikan kembali dengan isi penelitian Anda dan arahan dosen pembimbing.
        </CardContent>
      </Card>
    </AppShell>
  );
}
