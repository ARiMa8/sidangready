import { FileUp, Lock, UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { UploadSpec } from "@/types";

export function UploadDropzone({ spec }: { spec: UploadSpec }) {
  return (
    <Card className="border-dashed bg-slate-950/35">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-300">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{spec.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{spec.description}</p>
              </div>
            </div>
            {spec.required ? (
              <StatusBadge tone="indigo">Wajib</StatusBadge>
            ) : (
              <StatusBadge tone="slate">Opsional</StatusBadge>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card/60 p-5 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-3 text-sm font-medium text-slate-100">
              Drag and drop file atau klik untuk memilih
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Format {spec.formats}. Maksimal {spec.maxSize}.
            </p>
          </div>

          <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            File belum benar-benar diunggah pada Phase 1. Integrasi R2 akan dibuat di fase berikutnya.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
