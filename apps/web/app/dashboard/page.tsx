import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockProjects } from "@/lib/mock-data";

const filters = ["Semua", "Aktif", "Selesai", "Arsip"];

export default function DashboardPage() {
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
          <Input className="pl-9" placeholder="Cari proyek..." />
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
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatusBadge tone="indigo">1 sedang dianalisis</StatusBadge>
        <StatusBadge tone="amber">1 perlu revisi</StatusBadge>
        <StatusBadge tone="emerald">0 siap sidang</StatusBadge>
        <StatusBadge tone="slate">Kuota beta: 1 proyek/user</StatusBadge>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AppShell>
  );
}
