"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Loader2, Play, RotateCcw } from "lucide-react";
import { AnalysisStepper } from "@/components/analysis/analysis-stepper";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError, type ApiAnalysis, type ApiProject } from "@/lib/api";
import { analysisSteps } from "@/lib/mock-data";
import type { AnalysisStep, StepStatus } from "@/types";

function deriveStepStatus(
  analysis: ApiAnalysis | null,
  threshold: number,
  previousThreshold: number,
): StepStatus {
  if (!analysis) return "pending";
  if (analysis.status === "success") return "success";
  if (analysis.status === "failed") {
    if (analysis.progress >= threshold) return "success";
    if (analysis.progress >= previousThreshold) return "failed";
    return "pending";
  }
  if (analysis.progress >= threshold) return "success";
  if (analysis.progress >= previousThreshold) return "running";
  return "pending";
}

function buildSteps(analysis: ApiAnalysis | null): AnalysisStep[] {
  const thresholds = [10, 20, 35, 45, 55, 65, 75, 85, 95, 100];
  return analysisSteps.map((step, index) => ({
    ...step,
    status: deriveStepStatus(analysis, thresholds[index], thresholds[index - 1] ?? 0),
  }));
}

export function ProgressClient({ projectId }: { projectId: string }) {
  const { token, isLoading: isAuthLoading } = useAuth({ redirectToLogin: true });
  const [project, setProject] = useState<ApiProject | null>(null);
  const [analysis, setAnalysis] = useState<ApiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    if (!token) return;
    const activeToken = token;
    try {
      const [projectData, analysisData] = await Promise.all([
        api.getProject(activeToken, projectId),
        api.getLatestAnalysis(activeToken, projectId).catch((err): ApiAnalysis | null => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
      ]);
      setProject(projectData);
      setAnalysis(analysisData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Progress analisis belum dapat diambil dari backend.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (!token) return;
    loadProgress();
  }, [loadProgress, token]);

  useEffect(() => {
    if (!token || !analysis || !["pending", "queued", "running"].includes(analysis.status)) {
      return;
    }
    const timer = window.setInterval(loadProgress, 4000);
    return () => window.clearInterval(timer);
  }, [analysis, loadProgress, token]);

  async function queueAnalysis() {
    if (!token) return;
    const activeToken = token;
    setIsActionLoading(true);
    setError(null);
    try {
      const response = await api.queueFullAnalysis(activeToken, projectId);
      setAnalysis(response.analysis);
      await loadProgress();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Analisis belum dapat dimasukkan ke antrean.",
      );
    } finally {
      setIsActionLoading(false);
    }
  }

  async function retryAnalysis() {
    if (!token || !analysis) return;
    const activeToken = token;
    setIsActionLoading(true);
    setError(null);
    try {
      const response = await api.retryAnalysis(activeToken, projectId, analysis.id);
      setAnalysis(response.analysis);
      await loadProgress();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Retry analisis belum dapat diproses.",
      );
    } finally {
      setIsActionLoading(false);
    }
  }

  const isActive =
    analysis !== null && ["pending", "queued", "running"].includes(analysis.status);
  const canRetry =
    analysis?.status === "failed" && analysis.retry_count < analysis.max_retries;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Progress Analisis"
        title="AI sedang menyiapkan laporan kesiapan"
        description={
          project
            ? `Proyek: ${project.title}. Progress dipantau langsung dari backend worker.`
            : "Progress dipantau langsung dari backend worker."
        }
        actions={
          analysis?.status === "success" ? (
            <Button asChild variant="secondary">
              <Link href={`/projects/${projectId}/overview`}>
                Lihat hasil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null
        }
      />

      {isAuthLoading || isLoading ? (
        <LoadingState
          title="Memuat progress"
          description="Mengambil status analisis terbaru dari backend."
        />
      ) : error ? (
        <div className="mb-5">
          <ErrorState title="Progress belum dapat dimuat" description={error} />
        </div>
      ) : null}

      {!isLoading && !analysis ? (
        <EmptyState
          title="Belum ada analisis"
          description="Mulai analisis setelah dokumen berhasil diunggah dan diekstrak."
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <AnalysisStepper steps={buildSteps(analysis)} progress={analysis?.progress ?? 0} />
        <div className="space-y-4">
          {isActive ? (
            <LoadingState
              title={analysis?.current_step ?? "Analisis sedang berjalan"}
              description="Halaman ini akan memperbarui progress secara otomatis."
            />
          ) : analysis?.status === "failed" ? (
            <ErrorState
              title="Analisis gagal diproses"
              description={
                analysis.error_message ??
                "Worker belum dapat menyelesaikan analisis. Periksa dokumen dan konfigurasi backend."
              }
            />
          ) : analysis?.status === "success" ? (
            <EmptyState
              title="Analisis selesai"
              description="Hasil analisis sudah tersedia dan dapat ditinjau pada halaman overview."
            />
          ) : (
            <EmptyState
              title="Menunggu analisis"
              description="Klik tombol mulai jika dokumen proyek sudah siap."
            />
          )}

          {!analysis ? (
            <Button className="w-full" onClick={queueAnalysis} disabled={isActionLoading}>
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Mulai Analisis
            </Button>
          ) : null}

          {canRetry ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={retryAnalysis}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Retry Aman
            </Button>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
