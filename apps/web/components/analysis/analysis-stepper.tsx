import { CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { STEP_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AnalysisStep, StepStatus } from "@/types";

function statusIcon(status: StepStatus) {
  if (status === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-300" />;
  if (status === "running") return <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />;
  if (status === "failed") return <XCircle className="h-5 w-5 text-rose-300" />;
  return <CircleDashed className="h-5 w-5 text-slate-500" />;
}

function stepTone(status: StepStatus) {
  if (status === "success") return "emerald" as const;
  if (status === "running") return "indigo" as const;
  if (status === "failed") return "rose" as const;
  return "slate" as const;
}

export function AnalysisStepper({
  steps,
  progress,
}: {
  steps: AnalysisStep[];
  progress: number;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Progress Analisis</CardTitle>
            <p className="mt-1 text-sm text-slate-400">
              Analisis masuk antrean. Proses dapat memakan waktu beberapa menit tergantung ukuran dokumen.
            </p>
          </div>
          <StatusBadge tone="indigo">{progress}% selesai</StatusBadge>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y divide-border">
          {steps.map((step, index) => (
            <li key={step.id} className="flex gap-4 p-5">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-slate-950/60",
                  step.status === "running" && "border-indigo-500/50",
                  step.status === "success" && "border-emerald-500/40",
                  step.status === "failed" && "border-rose-500/40",
                )}
              >
                {statusIcon(step.status)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                  </div>
                  <StatusBadge tone={stepTone(step.status)}>
                    {STEP_STATUS_LABEL[step.status]}
                  </StatusBadge>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
