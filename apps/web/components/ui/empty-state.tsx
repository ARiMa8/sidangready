import type { LucideIcon } from "lucide-react";
import { FileSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileSearch,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-slate-950/70 text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
