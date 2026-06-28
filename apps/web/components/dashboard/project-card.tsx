import Link from "next/link";
import { AlertCircle, CalendarClock, FileText, Gauge, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { formatDate, getScoreCategory } from "@/lib/format";
import type { Project, ProjectStatus } from "@/types";

function statusTone(status: ProjectStatus): BadgeTone {
  if (status === "analysis_complete" || status === "ready_for_defense") return "emerald";
  if (status === "needs_revision") return "amber";
  if (status === "analyzing" || status === "uploaded") return "indigo";
  return "slate";
}

function actionHref(project: Project) {
  if (project.analysisStatus === "complete" || project.readinessScore !== null) {
    return `/projects/${project.id}/overview`;
  }
  return `/projects/${project.id}/progress`;
}

export function ProjectCard({ project }: { project: Project }) {
  const hasOpenCriticalIssues = project.openCriticalIssueCount > 0;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{project.title}</CardTitle>
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">
              {project.thesisTitle}
            </p>
          </div>
          <StatusBadge tone={statusTone(project.status)}>
            {PROJECT_STATUS_LABEL[project.status]}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Gauge className="h-3.5 w-3.5" />
              Readiness
            </div>
            <p className="mt-2 text-xl font-semibold">
              {project.readinessScore === null ? "-" : `${project.readinessScore}/100`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {project.readinessScore === null
                ? "Belum dianalisis"
                : getScoreCategory(project.readinessScore)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="h-3.5 w-3.5" />
              Kritis terbuka
            </div>
            <p
              className={`mt-2 text-xl font-semibold ${
                hasOpenCriticalIssues ? "text-rose-300" : "text-emerald-300"
              }`}
            >
              {project.openCriticalIssueCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {project.criticalIssueCount} total terdeteksi
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            Terakhir diupdate {formatDate(project.lastUpdated)}
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            {project.documentCount} dokumen: {project.documentSummary}
          </div>
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-slate-500" />
            Status analisis: {project.analysisStatus}
          </div>
        </div>

        <Button asChild className="mt-auto w-full">
          <Link href={actionHref(project)}>Buka Proyek</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
