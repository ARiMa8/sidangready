"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/hooks/use-auth";

export function Topbar() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() ?? "S";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Buka navigasi">
            <Menu className="h-5 w-5" />
          </Button>
          <Logo compact />
        </div>

        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input className="pl-9" placeholder="Cari proyek, slide, atau catatan..." />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifikasi">
            <Bell className="h-5 w-5" />
          </Button>
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              Proyek Baru
            </Link>
          </Button>
          <div className="hidden min-w-0 items-center gap-3 rounded-md border border-border bg-card/70 px-3 py-2 sm:flex">
            <div className="h-7 w-7 rounded-md bg-indigo-500/20 text-center text-sm font-semibold leading-7 text-indigo-200">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-100">
                {user?.name ?? "SidangReady"}
              </p>
              <p className="truncate text-[11px] text-slate-500">Mahasiswa</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Keluar" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
