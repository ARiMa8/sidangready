"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const resultLinks = [
  { href: "/projects/demo/overview", label: "Overview" },
  { href: "/projects/demo/checklist", label: "Checklist" },
  { href: "/projects/demo/consistency", label: "Konsistensi" },
  { href: "/projects/demo/claims", label: "Klaim" },
  { href: "/projects/demo/questions", label: "Pertanyaan" },
  { href: "/projects/demo/script", label: "Script" },
  { href: "/projects/demo/export", label: "Export" },
];

export function ResultNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 overflow-x-auto rounded-lg border border-border bg-card/70 p-1">
      <nav className="flex min-w-max gap-1">
        {resultLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/70 hover:text-slate-100",
              pathname === link.href && "bg-indigo-500/15 text-indigo-200",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
