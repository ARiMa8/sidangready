"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError, type ApiAnalysis } from "@/lib/api";
import { mapProject } from "@/lib/mappers";
import type { Project } from "@/types";

const filters = ["Semua", "Aktif", "Selesai", "Arsip"];

export function DashboardClient() {
  const { token, isLoading: isAuthLoading } = useAuth({ redirectToLogin: true });
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const activeToken = token;

    let active = true;
    async function loadProjects() {
      setIsLoading(true);
      setError(null);
      try {
        const apiProjects = await api.listProjects(activeToken);
        const mappedProjects = await Promise.all(
          apiProjects.map(async (project) => {
            const [documents, latestAnalysis] = await Promise.all([
              api.listDocuments(activeToken, project.id).catch(() => []),
              api
                .getLatestAnalysis(activeToken, project.id)
                .catch((err): ApiAnalysis | null => {
                  if (err instanceof ApiError && err.status === 404) return null;
                  throw err;
                }),
            ]);
            return mapProject(project, documents, latestAnalysis);
          }),
        );
        if (active) setProjects(mappedProjects);
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Dashboard belum dapat mengambil data dari backend.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProjects();
    return () => {
      active = false;
    };
  }, [token]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) =>
      [project.title, project.thesisTitle, project.studentName, project.university]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [projects, search]);

  const analyzingCount = projects.filter(
    (project) => project.status === "analyzing" || project.analysisStatus === "running",
  ).length;
  const needsRevisionCount = projects.filter(
    (project) => project.status === "needs_revision",
  ).length;
  const readyCount = projects.filter(
    (project) => project.status === "ready_for_defense",
  ).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Dashboard Proyek"
        title="Proyek Saya"
        description="Kelola proyek skripsi, cek status analisis, dan lanjutkan revisi dari satu tempat."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              Buat Proyek Baru
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-card/70 p-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari proyek..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          {filters.map((filter, index) => (
            <button
              key={filter}
              className={`h-9 rounded-md border px-3 text-sm ${
                index === 0
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
                  : "border-border bg-slate-950/45 text-slate-400"
              }`}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatusBadge tone="indigo">{analyzingCount} sedang dianalisis</StatusBadge>
        <StatusBadge tone="amber">{needsRevisionCount} perlu revisi</StatusBadge>
        <StatusBadge tone="emerald">{readyCount} siap sidang</StatusBadge>
        <StatusBadge tone="slate">Kuota beta: 1 proyek/user</StatusBadge>
      </div>

      {isAuthLoading || isLoading ? (
        <LoadingState
          title="Memuat proyek"
          description="Mengambil data proyek dan status analisis dari backend."
        />
      ) : error ? (
        <ErrorState title="Dashboard belum dapat dimuat" description={error} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={projects.length === 0 ? "Belum ada proyek" : "Proyek tidak ditemukan"}
          description={
            projects.length === 0
              ? "Buat proyek pertama untuk mulai mengunggah dokumen dan menjalankan analisis."
              : "Coba gunakan kata kunci lain atau bersihkan pencarian."
          }
          actionLabel={projects.length === 0 ? "Buat Proyek Baru" : undefined}
          actionHref={projects.length === 0 ? "/projects/new" : undefined}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
