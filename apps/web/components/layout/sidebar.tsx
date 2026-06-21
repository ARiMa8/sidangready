"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import {
  CheckSquare,
  FileOutput,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  PlusCircle,
  Presentation,
  SearchCheck,
  Settings,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects/new", label: "Buat Proyek Baru", icon: PlusCircle },
  { href: "/projects/demo/progress", label: "Progress Analisis", icon: UploadCloud },
];

const resultNav = [
  { href: "/projects/demo/overview", label: "Overview", icon: Gauge },
  { href: "/projects/demo/checklist", label: "Checklist Revisi", icon: CheckSquare },
  {
    href: "/projects/demo/consistency",
    label: "Konsistensi Slide",
    icon: SearchCheck,
  },
  { href: "/projects/demo/claims", label: "Klaim Bermasalah", icon: ShieldAlert },
  { href: "/projects/demo/questions", label: "Pertanyaan Penguji", icon: HelpCircle },
  { href: "/projects/demo/script", label: "Script Presentasi", icon: Presentation },
  { href: "/projects/demo/export", label: "Export Laporan", icon: FileOutput },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ElementType;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-slate-400 hover:bg-slate-800/70 hover:text-slate-100",
        active && "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/30",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-slate-950/95 px-4 py-5 lg:flex lg:flex-col">
      <Logo />
      <div className="mt-6 rounded-lg border border-border bg-slate-900/50 p-3">
        <p className="text-xs font-medium uppercase text-slate-500">Beta MVP</p>
        <p className="mt-1 text-sm text-slate-300">
          Analisis statis dengan mock data. API dan AI asli belum aktif.
        </p>
      </div>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase text-slate-500">
            Aplikasi
          </p>
          <div className="space-y-1">
            {primaryNav.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase text-slate-500">
            Hasil Analisis
          </p>
          <div className="space-y-1">
            {resultNav.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase text-slate-500">
            Lainnya
          </p>
          <SidebarLink href="/dashboard" label="Pengaturan" icon={Settings} />
        </div>
      </nav>

      <div className="mt-5 space-y-3 rounded-lg border border-border bg-card/70 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Status mock</span>
          <StatusBadge tone="emerald">Selesai</StatusBadge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="rounded-md bg-slate-950/50 p-2">
            <p className="text-slate-500">Skor</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">78/100</p>
          </div>
          <div className="rounded-md bg-slate-950/50 p-2">
            <p className="text-slate-500">Isu kritis</p>
            <p className="mt-1 text-sm font-semibold text-rose-300">5</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
