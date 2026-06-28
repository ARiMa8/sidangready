import { ChangeEvent } from "react";
import { CheckCircle2, FileUp, Lock, UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatFileSize } from "@/lib/format";
import type { UploadSpec } from "@/types";

interface UploadDropzoneProps {
  spec: UploadSpec;
  file?: File | null;
  status?: "idle" | "uploading" | "success" | "failed";
  message?: string;
  disabled?: boolean;
  onFileChange?: (file: File | null) => void;
}

function statusBadge(status: UploadDropzoneProps["status"]) {
  if (status === "uploading") return <StatusBadge tone="indigo">Mengunggah</StatusBadge>;
  if (status === "success") return <StatusBadge tone="emerald">Selesai</StatusBadge>;
  if (status === "failed") return <StatusBadge tone="rose">Gagal</StatusBadge>;
  return null;
}

export function UploadDropzone({
  spec,
  file,
  status = "idle",
  message,
  disabled = false,
  onFileChange,
}: UploadDropzoneProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange?.(event.target.files?.[0] ?? null);
  }

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
            {statusBadge(status)}
          </div>

          <label className="block rounded-lg border border-border bg-card/60 p-5 text-center hover:border-indigo-500/40">
            <input
              className="sr-only"
              type="file"
              disabled={disabled}
              onChange={handleFileChange}
            />
            <UploadCloud className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-3 text-sm font-medium text-slate-100">
              {file ? file.name : "Klik untuk memilih file"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {file
                ? `${formatFileSize(file.size)} dipilih`
                : `Format ${spec.formats}. Maksimal ${spec.maxSize}.`}
            </p>
          </label>

          <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            {status === "success" ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
            ) : (
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            {message ??
              "File diunggah langsung ke Cloudflare R2 melalui presigned URL dari backend."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
