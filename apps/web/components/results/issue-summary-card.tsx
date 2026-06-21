import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, CircleDot, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OverviewMetric } from "@/types";

const toneClass: Record<OverviewMetric["tone"], string> = {
  default: "text-slate-300 bg-slate-800/70",
  success: "text-emerald-300 bg-emerald-500/10",
  warning: "text-amber-300 bg-amber-500/10",
  danger: "text-rose-300 bg-rose-500/10",
  primary: "text-indigo-300 bg-indigo-500/10",
};

const iconMap: Record<OverviewMetric["tone"], LucideIcon> = {
  default: CircleDot,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
  primary: HelpCircle,
};

export function IssueSummaryCard({ metric }: { metric: OverviewMetric }) {
  const Icon = iconMap[metric.tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-xs text-slate-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClass[metric.tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
