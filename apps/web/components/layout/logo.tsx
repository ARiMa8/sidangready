import { GraduationCap } from "lucide-react";
import { APP_SUBTITLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-950/40">
        <GraduationCap className="h-5 w-5" />
      </div>
      {compact ? null : (
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-normal">
            Sidang<span className="text-indigo-300">Ready AI</span>
          </p>
          <p className="truncate text-xs text-slate-400">{APP_SUBTITLE}</p>
        </div>
      )}
    </div>
  );
}
