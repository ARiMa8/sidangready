"use client";

import { Download, FileArchive, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatFileSize } from "@/lib/format";
import type { ApiExport } from "@/lib/api";
import type { ExportOption } from "@/types";

function FormatIcon({ format }: { format: ExportOption["format"] }) {
  if (format === "markdown") return <FileText className="h-5 w-5" />;
  return <FileArchive className="h-5 w-5" />;
}

export function ExportOptionsCard({
  options,
  exports,
  activeCreateType,
  activeDownloadId,
  sortOrder,
  filter,
  onSortChange,
  onFilterChange,
  onCreate,
  onDownload,
}: {
  options: ExportOption[];
  exports: ApiExport[];
  activeCreateType: ApiExport["export_type"] | null;
  activeDownloadId: string | null;
  sortOrder: "latest" | "oldest";
  filter: "all" | ApiExport["export_type"];
  onSortChange: (sort: "latest" | "oldest") => void;
  onFilterChange: (filter: "all" | ApiExport["export_type"]) => void;
  onCreate: (exportType: ApiExport["export_type"]) => void;
  onDownload: (exportId: string) => void;
}) {
  const filterOptions: Array<{ value: "all" | ApiExport["export_type"]; label: string }> = [
    { value: "all", label: "Semua" },
    { value: "markdown", label: "Markdown" },
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "DOCX" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option) => {
          const isAvailable = option.availability === "available";
          const isCreating = activeCreateType === option.format;
          return (
            <Card key={option.id}>
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-300">
                      <FormatIcon format={option.format} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <StatusBadge tone={isAvailable ? "emerald" : "slate"}>
                    {isAvailable ? "Tersedia" : "Nanti"}
                  </StatusBadge>
                </div>
                <Button
                  className="mt-auto w-full"
                  variant={isAvailable ? "default" : "secondary"}
                  disabled={!isAvailable || activeCreateType !== null}
                  onClick={() => onCreate(option.format)}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Generate {option.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-100">File Export</h3>
              <p className="mt-1 text-sm text-slate-400">
                File export disimpan sementara dan dapat diunduh ulang dari sini.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-md border border-border bg-slate-950/40 p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFilterChange(option.value)}
                    className={`rounded px-3 py-1 text-xs transition ${
                      filter === option.value
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md border border-border bg-slate-950/40 p-1">
                <button
                  type="button"
                  onClick={() => onSortChange("latest")}
                  className={`rounded px-3 py-1 text-xs transition ${
                    sortOrder === "latest"
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Terbaru
                </button>
                <button
                  type="button"
                  onClick={() => onSortChange("oldest")}
                  className={`rounded px-3 py-1 text-xs transition ${
                    sortOrder === "oldest"
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Terlama
                </button>
              </div>
              <StatusBadge tone={exports.length > 0 ? "emerald" : "slate"}>
                {exports.length} file
              </StatusBadge>
            </div>
          </div>

          {exports.length === 0 ? (
            <div className="mt-5 rounded-md border border-dashed border-border p-5 text-sm text-slate-400">
              Belum ada file export. Pilih format export untuk membuat laporan final.
            </div>
          ) : (
            <div className="mt-5 divide-y divide-border rounded-md border border-border">
              {exports.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-100">
                      {item.file_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.export_type.toUpperCase()} | Dibuat{" "}
                      {formatDateTime(item.created_at)} |{" "}
                      {formatFileSize(item.file_size)} | berlaku sampai{" "}
                      {formatDateTime(item.expires_at)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={activeDownloadId === item.id}
                    onClick={() => onDownload(item.id)}
                  >
                    {activeDownloadId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
