import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "slate" | "indigo" | "emerald" | "amber" | "rose";

const toneClass: Record<BadgeTone, string> = {
  slate: "border-slate-700 bg-slate-800/60 text-slate-300",
  indigo: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

const dotClass: Record<BadgeTone, string> = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

interface StatusBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  children,
  tone = "slate",
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-2 rounded-md border px-2.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dotClass[tone])} /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
