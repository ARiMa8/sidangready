import type { Priority } from "@/types";
import { PRIORITY_LABEL } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/status-badge";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const tone =
    priority === "critical" ? "rose" : priority === "important" ? "amber" : "emerald";

  return <StatusBadge tone={tone}>{PRIORITY_LABEL[priority]}</StatusBadge>;
}
