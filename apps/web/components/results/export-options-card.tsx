import { Download, FileArchive, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ExportOption } from "@/types";

function FormatIcon({ format }: { format: ExportOption["format"] }) {
  if (format === "markdown") return <FileText className="h-5 w-5" />;
  return <FileArchive className="h-5 w-5" />;
}

export function ExportOptionsCard({ options }: { options: ExportOption[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => (
        <Card key={option.id}>
          <CardContent className="flex h-full flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-300">
                  <FormatIcon format={option.format} />
                </div>
                <div>
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{option.description}</p>
                </div>
              </div>
              <StatusBadge tone={option.availability === "available" ? "emerald" : "slate"}>
                {option.availability === "available" ? "Tersedia" : "Nanti"}
              </StatusBadge>
            </div>
            <Button
              className="mt-auto w-full"
              variant={option.availability === "available" ? "default" : "secondary"}
              disabled={option.availability !== "available"}
            >
              <Download className="h-4 w-4" />
              Export {option.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
