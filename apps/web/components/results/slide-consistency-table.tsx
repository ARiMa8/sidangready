import { CONSISTENCY_LABEL } from "@/lib/constants";
import type { BadgeTone } from "@/components/ui/status-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ConsistencyStatus, SlideCheck } from "@/types";

function consistencyTone(status: ConsistencyStatus): BadgeTone {
  if (status === "supported") return "emerald";
  if (status === "partially_supported") return "amber";
  if (status === "unsupported" || status === "contradictory") return "rose";
  return "indigo";
}

export function SlideConsistencyTable({ checks }: { checks: SlideCheck[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-border bg-slate-950/50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Slide</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Klaim Terdeteksi</th>
              <th className="px-4 py-3">Bagian Laporan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ringkasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {checks.map((check) => (
              <tr key={check.id} className="align-top">
                <td className="px-4 py-4 font-mono text-slate-300">{check.slideNumber}</td>
                <td className="px-4 py-4 font-medium text-slate-100">{check.slideTitle}</td>
                <td className="px-4 py-4 text-slate-400">{check.detectedClaim}</td>
                <td className="px-4 py-4 text-slate-400">{check.matchedThesisSection}</td>
                <td className="px-4 py-4">
                  <StatusBadge tone={consistencyTone(check.status)}>
                    {CONSISTENCY_LABEL[check.status]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-4 text-slate-400">
                  <p>{check.issueSummary}</p>
                  <p className="mt-2 text-xs text-slate-500">{check.evidenceExcerpt}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
