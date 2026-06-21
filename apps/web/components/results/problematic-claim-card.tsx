import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { RISK_LABEL } from "@/lib/constants";
import type { ProblematicClaim, RiskLevel } from "@/types";

function riskTone(risk: RiskLevel): BadgeTone {
  if (risk === "critical" || risk === "high") return "rose";
  if (risk === "medium") return "amber";
  return "emerald";
}

export function ProblematicClaimCard({ claim }: { claim: ProblematicClaim }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-100">
                  Slide {claim.slideNumber}
                </p>
                <StatusBadge tone="slate">{claim.problemType}</StatusBadge>
              </div>
              <p className="mt-3 text-base font-medium text-slate-50">
                &quot;{claim.claimText}&quot;
              </p>
            </div>
          </div>
          <StatusBadge tone={riskTone(claim.riskLevel)}>
            Risiko {RISK_LABEL[claim.riskLevel]}
          </StatusBadge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border bg-slate-950/45 p-3">
            <p className="text-xs text-slate-500">Evidence dari laporan</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{claim.evidenceExcerpt}</p>
          </div>
          <div className="rounded-md border border-border bg-slate-950/45 p-3">
            <p className="text-xs text-slate-500">Saran revisi</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {claim.suggestedRevision}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
