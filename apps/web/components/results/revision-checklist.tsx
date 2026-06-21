import { CheckSquare, Circle, Clock3, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { CHECKLIST_STATUS_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import type { ChecklistStatus, Priority, RevisionItem } from "@/types";

const priorities: Priority[] = ["critical", "important", "minor"];

function statusIcon(status: ChecklistStatus) {
  if (status === "done") return <CheckSquare className="h-4 w-4 text-emerald-300" />;
  if (status === "in_progress") return <Clock3 className="h-4 w-4 text-indigo-300" />;
  if (status === "ignored") return <MinusCircle className="h-4 w-4 text-slate-500" />;
  return <Circle className="h-4 w-4 text-slate-500" />;
}

export function RevisionChecklist({ items }: { items: RevisionItem[] }) {
  return (
    <div className="space-y-5">
      {priorities.map((priority) => {
        const group = items.filter((item) => item.priority === priority);
        return (
          <Card key={priority}>
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle>{PRIORITY_LABEL[priority]}</CardTitle>
                <PriorityBadge priority={priority} />
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {group.map((item) => (
                <article key={item.id} className="p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="mt-1">{statusIcon(item.status)}</div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-100">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone="slate">
                      {CHECKLIST_STATUS_LABEL[item.status]}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-md bg-slate-950/45 p-3">
                      <p className="text-xs text-slate-500">Terkait</p>
                      <p className="mt-1 text-slate-300">
                        {item.relatedChapter}
                        {item.relatedSlide ? `, ${item.relatedSlide}` : ""}
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-950/45 p-3">
                      <p className="text-xs text-slate-500">Alasan</p>
                      <p className="mt-1 text-slate-300">{item.reason}</p>
                    </div>
                    <div className="rounded-md bg-slate-950/45 p-3">
                      <p className="text-xs text-slate-500">Saran tindakan</p>
                      <p className="mt-1 text-slate-300">{item.suggestedAction}</p>
                    </div>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
