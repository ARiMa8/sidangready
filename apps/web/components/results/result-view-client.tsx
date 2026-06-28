"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DefenseQuestionCard } from "@/components/results/defense-question-card";
import { ExportOptionsCard } from "@/components/results/export-options-card";
import { IssueSummaryCard } from "@/components/results/issue-summary-card";
import { PresentationScriptPanel } from "@/components/results/presentation-script-panel";
import { ProblematicClaimCard } from "@/components/results/problematic-claim-card";
import { ReadinessScoreCard } from "@/components/results/readiness-score-card";
import { ResultNav } from "@/components/results/result-nav";
import { RevisionChecklist } from "@/components/results/revision-checklist";
import { SlideConsistencyTable } from "@/components/results/slide-consistency-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import {
  api,
  ApiError,
  type ApiDefenseQuestion,
  type ApiOverview,
  type ApiPresentationScript,
  type ApiProblematicClaim,
  type ApiProject,
  type ApiRevisionItem,
  type ApiSlideCheck,
} from "@/lib/api";
import {
  mapDefenseQuestion,
  mapOverviewMetrics,
  mapPresentationScript,
  mapProblematicClaim,
  mapRevisionItem,
  mapSlideCheck,
} from "@/lib/mappers";
import { exportOptions } from "@/lib/mock-data";
import type { ChecklistStatus } from "@/types";

type ResultView =
  | "overview"
  | "checklist"
  | "consistency"
  | "claims"
  | "questions"
  | "script"
  | "export";

type ResultData =
  | ApiOverview
  | ApiRevisionItem[]
  | ChecklistResultData
  | ApiSlideCheck[]
  | ApiProblematicClaim[]
  | ApiDefenseQuestion[]
  | ApiPresentationScript[];

interface ChecklistResultData {
  officialRevisionItems: ApiRevisionItem[];
  findingItems: ApiRevisionItem[];
}

const viewCopy: Record<ResultView, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description: "Ringkasan readiness score, isu utama, dan langkah berikutnya.",
  },
  checklist: {
    title: "Checklist Temuan & Perbaikan",
    description: "Pisahkan revisi resmi skripsi dari temuan perbaikan hasil analisis.",
  },
  consistency: {
    title: "Konsistensi Slide vs Laporan",
    description: "Klaim pada slide dibandingkan dengan bagian laporan yang relevan.",
  },
  claims: {
    title: "Klaim Bermasalah",
    description: "Klaim yang tidak didukung, kontradiktif, terlalu luas, atau berisiko.",
  },
  questions: {
    title: "Pertanyaan Penguji",
    description: "Pertanyaan sebagai panduan latihan, bukan jawaban final yang dijamin benar.",
  },
  script: {
    title: "Script Presentasi",
    description: "Naskah presentasi per slide sesuai target durasi proyek.",
  },
  export: {
    title: "Export Laporan Final",
    description: "Ringkasan export berbasis hasil analisis terbaru.",
  },
};

export function ResultViewClient({
  projectId,
  view,
}: {
  projectId: string;
  view: ResultView;
}) {
  const { token, isLoading: isAuthLoading } = useAuth({ redirectToLogin: true });
  const [project, setProject] = useState<ApiProject | null>(null);
  const [overview, setOverview] = useState<ApiOverview | null>(null);
  const [data, setData] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    const activeToken = token;
    setIsLoading(true);
    setError(null);
    try {
      const projectData = await api.getProject(activeToken, projectId);
      setProject(projectData);

      const overviewData = await api.getOverview(activeToken, projectId);
      setOverview(overviewData);

      if (view === "overview" || view === "export") {
        setData(overviewData);
      } else if (view === "checklist") {
        const [officialRevisionItems, findingItems] = await Promise.all([
          api.getOfficialRevisionChecklist(activeToken, projectId),
          api.getChecklist(activeToken, projectId),
        ]);
        setData({ officialRevisionItems, findingItems });
      } else if (view === "consistency") {
        setData(await api.getSlideConsistency(activeToken, projectId));
      } else if (view === "claims") {
        setData(await api.getProblematicClaims(activeToken, projectId));
      } else if (view === "questions") {
        setData(await api.getDefenseQuestions(activeToken, projectId));
      } else if (view === "script") {
        setData(await api.getPresentationScript(activeToken, projectId));
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Hasil analisis belum dapat diambil dari backend.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token, view]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [loadData, token]);

  async function updateChecklistStatus(
    itemId: string,
    status: ChecklistStatus,
    checklistType: "official" | "finding" = "finding",
  ) {
    if (!token) return;
    const activeToken = token;
    try {
      const updated =
        checklistType === "official"
          ? await api.updateOfficialRevisionChecklistStatus(
              activeToken,
              projectId,
              itemId,
              status,
            )
          : await api.updateChecklistStatus(activeToken, projectId, itemId, status);
      setData((current) => {
        if (!current || Array.isArray(current)) return current;
        const checklistData = current as ChecklistResultData;
        const key =
          checklistType === "official" ? "officialRevisionItems" : "findingItems";
        const prefix = checklistType === "official" ? "official-rev" : "fix";
        return {
          ...checklistData,
          [key]: checklistData[key].map((item, index) => {
            const generatedId = item.id ?? `${prefix}-${index + 1}`;
            return generatedId === itemId ? updated : item;
          }),
        };
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Status checklist belum dapat diperbarui.",
      );
    }
  }

  const copy = viewCopy[view];
  const description =
    view === "script" && project
      ? `Naskah presentasi per slide untuk mode ${presentationModeLabel(project)}.`
      : copy.description;

  return (
    <AppShell>
      <PageHeader
        eyebrow={view === "export" ? "Export / Laporan Final" : "Hasil Analisis"}
        title={copy.title}
        description={
          project
            ? `Proyek: ${project.title}. ${description}`
            : description
        }
        actions={
          <HeaderActions
            view={view}
            projectId={projectId}
            overview={overview}
            project={project}
          />
        }
      />
      <ResultNav />

      {isAuthLoading || isLoading ? (
        <LoadingState
          title="Memuat hasil analisis"
          description="Mengambil data hasil dari backend."
        />
      ) : error ? (
        <div className="space-y-4">
          <ErrorState title="Hasil belum tersedia" description={error} />
          <Button asChild variant="secondary">
            <Link href={`/projects/${projectId}/progress`}>
              Buka Progress Analisis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        renderView({
          view,
          data,
          overview,
          project,
          projectId,
          onChecklistStatusChange: updateChecklistStatus,
        })
      )}
    </AppShell>
  );
}

function HeaderActions({
  view,
  projectId,
  overview,
  project,
}: {
  view: ResultView;
  projectId: string;
  overview: ApiOverview | null;
  project: ApiProject | null;
}) {
  if (view === "overview") {
    return (
      <Button asChild variant="secondary">
        <Link href={`/projects/${projectId}/export`}>
          <Download className="h-4 w-4" />
          Buka Export
        </Link>
      </Button>
    );
  }
  if (view === "checklist") {
    return (
      <>
        <StatusBadge tone="rose">Kritis {overview?.critical_issues_count ?? 0}</StatusBadge>
        <StatusBadge tone="amber">
          Penting {overview?.important_issues_count ?? 0}
        </StatusBadge>
        <StatusBadge tone="emerald">Minor {overview?.minor_issues_count ?? 0}</StatusBadge>
      </>
    );
  }
  if (view === "consistency") {
    return (
      <StatusBadge tone="indigo">
        {overview?.total_slides_checked ?? 0} slide dicek
      </StatusBadge>
    );
  }
  if (view === "questions") {
    return (
      <StatusBadge tone="emerald">
        {overview?.total_examiner_questions ?? 0} pertanyaan
      </StatusBadge>
    );
  }
  if (view === "script") {
    return <StatusBadge tone="indigo">{presentationModeLabel(project)}</StatusBadge>;
  }
  if (view === "export") {
    return <StatusBadge tone="amber">Export generation Phase 8</StatusBadge>;
  }
  return null;
}

function presentationModeLabel(project: ApiProject | null): string {
  return `Standar ${project?.target_presentation_minutes ?? 10} Menit`;
}

function renderView({
  view,
  data,
  overview,
  project,
  projectId,
  onChecklistStatusChange,
}: {
  view: ResultView;
  data: ResultData | null;
  overview: ApiOverview | null;
  project: ApiProject | null;
  projectId: string;
  onChecklistStatusChange: (
    itemId: string,
    status: ChecklistStatus,
    checklistType?: "official" | "finding",
  ) => void;
}) {
  if (view === "overview") {
    const overviewData = (data as ApiOverview | null) ?? {};
    const actions = overviewData.recommended_next_actions ?? [];
    return (
      <>
        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <ReadinessScoreCard score={overviewData.readiness_score ?? 0} />
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Rekomendasi Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {actions.length > 0 ? (
                actions.map((action) => (
                  <div
                    key={action}
                    className="rounded-md border border-border bg-slate-950/45 p-3"
                  >
                    <p className="text-sm leading-6 text-slate-300">{action}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Belum ada rekomendasi"
                  description="Rekomendasi akan muncul setelah analisis selesai."
                />
              )}
              <Button asChild className="w-full">
                <Link href={`/projects/${projectId}/checklist`}>
                  Lihat Checklist Perbaikan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mapOverviewMetrics(overviewData).map((metric) => (
            <IssueSummaryCard key={metric.label} metric={metric} />
          ))}
        </div>

        <Card className="mt-5 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 text-sm leading-6 text-amber-100/80">
            {overviewData.disclaimer ??
              "Skor ini adalah estimasi kesiapan berdasarkan dokumen yang diunggah, bukan jaminan hasil sidang. Semua rekomendasi perlu diperiksa ulang bersama dosen pembimbing."}
          </CardContent>
        </Card>
      </>
    );
  }

  if (view === "checklist") {
    const checklistData = data as ChecklistResultData | null;
    const officialItems = (checklistData?.officialRevisionItems ?? []).map(
      mapRevisionItem,
    );
    const findingItems = (checklistData?.findingItems ?? []).map(mapRevisionItem);
    return (
      <div className="space-y-5">
        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-5 text-sm leading-6 text-indigo-100/80">
            Checklist Revisi Skripsi berisi catatan revisi resmi yang Anda
            upload atau paste. Checklist Temuan & Perbaikan berisi saran AI
            dari pengecekan laporan, slide, klaim, dan kesiapan sidang.
          </CardContent>
        </Card>

        <RevisionChecklist
          title="Checklist Revisi Skripsi"
          description="Muncul hanya jika ada catatan revisi resmi yang diberikan user."
          emptyTitle="Belum ada catatan revisi skripsi"
          emptyDescription="Upload atau paste catatan revisi resmi untuk mengisi bagian ini pada analisis berikutnya."
          items={officialItems}
          onStatusChange={(itemId, status) =>
            onChecklistStatusChange(itemId, status, "official")
          }
        />

        <RevisionChecklist
          title="Checklist Temuan & Perbaikan"
          description="Temuan AI dari konsistensi slide, klaim, bukti, dan kelengkapan laporan."
          emptyTitle="Belum ada temuan perbaikan"
          emptyDescription="Temuan akan muncul setelah analisis selesai."
          items={findingItems}
          onStatusChange={(itemId, status) =>
            onChecklistStatusChange(itemId, status, "finding")
          }
        />
      </div>
    );
  }

  if (view === "consistency") {
    const checks = ((data as ApiSlideCheck[] | null) ?? []).map(mapSlideCheck);
    return (
      <>
        <Card className="mb-5 border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-5 text-sm leading-6 text-indigo-100/80">
            Tidak ditemukan dukungan eksplisit pada laporan yang diunggah akan
            digunakan ketika bukti tidak tersedia. Sistem tidak boleh mengarang evidence.
          </CardContent>
        </Card>
        {checks.length > 0 ? (
          <SlideConsistencyTable checks={checks} />
        ) : (
          <EmptyState
            title="Belum ada konsistensi slide"
            description="Data konsistensi akan muncul setelah analisis selesai."
          />
        )}
      </>
    );
  }

  if (view === "claims") {
    const claims = ((data as ApiProblematicClaim[] | null) ?? []).map(
      mapProblematicClaim,
    );
    return claims.length > 0 ? (
      <div className="space-y-4">
        {claims.map((claim) => (
          <ProblematicClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    ) : (
      <EmptyState
        title="Tidak ada klaim bermasalah"
        description="Tidak ada klaim berisiko yang tersimpan pada hasil terbaru."
      />
    );
  }

  if (view === "questions") {
    const questions = ((data as ApiDefenseQuestion[] | null) ?? []).map(
      mapDefenseQuestion,
    );
    return (
      <>
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <DefenseQuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada pertanyaan"
            description="Pertanyaan penguji akan muncul setelah analisis selesai."
          />
        )}
        <Card className="mt-5 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 text-sm leading-6 text-amber-100/80">
            Panduan jawaban ini perlu disesuaikan kembali dengan isi penelitian Anda
            dan arahan dosen pembimbing.
          </CardContent>
        </Card>
      </>
    );
  }

  if (view === "script") {
    const slides = ((data as ApiPresentationScript[] | null) ?? []).map(
      mapPresentationScript,
    );
    return slides.length > 0 ? (
      <PresentationScriptPanel
        slides={slides}
        targetMinutes={project?.target_presentation_minutes ?? 10}
      />
    ) : (
      <EmptyState
        title="Belum ada script"
        description="Script presentasi akan muncul setelah analisis selesai."
      />
    );
  }

  const overviewData = overview ?? {};
  return (
    <>
      <Card className="mb-5">
        <CardHeader className="border-b border-border">
          <CardTitle>Ringkasan Laporan Final</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Proyek</p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              {project?.title ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Readiness Score</p>
            <p className="mt-1 text-sm font-medium text-emerald-300">
              {overviewData.readiness_score ?? 0}/100
            </p>
          </div>
          {mapOverviewMetrics(overviewData)
            .slice(0, 2)
            .map((metric) => (
              <div key={metric.label}>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {metric.value}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>

      <ExportOptionsCard options={exportOptions} />

      <Card className="mt-5 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="flex gap-3 p-5 text-sm leading-6 text-emerald-100/80">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <p>
            Export generation akan dibuat pada Phase 8. Halaman ini sudah memakai
            ringkasan hasil analisis terbaru dari backend.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
