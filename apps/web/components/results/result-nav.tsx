"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const resultLinks = [
  { path: "overview", label: "Overview" },
  { path: "checklist", label: "Perbaikan" },
  { path: "consistency", label: "Konsistensi" },
  { path: "claims", label: "Klaim" },
  { path: "questions", label: "Pertanyaan" },
  { path: "script", label: "Script" },
  { path: "export", label: "Export" },
];

export function ResultNav() {
  const pathname = usePathname();
  const projectId = pathname.match(/^\/projects\/([^/]+)/)?.[1];

  return (
    <div className="mb-6 overflow-x-auto rounded-lg border border-border bg-card/70 p-1">
      <nav className="flex min-w-max gap-1">
        {resultLinks.map((link) => {
          const href = projectId ? `/projects/${projectId}/${link.path}` : "/dashboard";
          return (
          <Link
            key={link.path}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/70 hover:text-slate-100",
              pathname === href && "bg-indigo-500/15 text-indigo-200",
            )}
          >
            {link.label}
          </Link>
          );
        })}
      </nav>
    </div>
  );
}
