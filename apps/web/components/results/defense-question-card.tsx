import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DefenseQuestion } from "@/types";

function difficultyTone(difficulty: DefenseQuestion["difficulty"]) {
  if (difficulty === "hard") return "rose" as const;
  if (difficulty === "medium") return "amber" as const;
  return "emerald" as const;
}

export function DefenseQuestionCard({ question }: { question: DefenseQuestion }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-300">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="indigo">{question.category}</StatusBadge>
                <StatusBadge tone={difficultyTone(question.difficulty)}>
                  {question.difficulty}
                </StatusBadge>
              </div>
              <h3 className="mt-3 text-base font-semibold leading-6 text-slate-50">
                {question.question}
              </h3>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-slate-950/45 p-3">
            <p className="text-xs text-slate-500">Mengapa mungkin ditanya</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{question.whyAsked}</p>
          </div>
          <div className="rounded-md bg-slate-950/45 p-3">
            <p className="text-xs text-slate-500">Panduan jawaban</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {question.answerGuidance}
            </p>
          </div>
          <div className="rounded-md bg-slate-950/45 p-3">
            <p className="text-xs text-slate-500">Bagian terkait</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {question.relatedSection}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
