import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Logo } from "@/components/layout/logo";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_520px]">
      <section className="hidden border-r border-border bg-slate-950/80 p-10 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-indigo-300">Masuk Akun</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Lanjutkan persiapan sidang dengan alur yang lebih terstruktur.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Login masih berupa tampilan statis pada Phase 1. Integrasi JWT dan backend akan dibuat setelah fondasi UI selesai.
          </p>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-100">
          Kembali ke landing page
        </Link>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <AuthCard mode="login" />
      </section>
    </main>
  );
}
