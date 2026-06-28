import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Logo } from "@/components/layout/logo";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_520px]">
      <section className="hidden border-r border-border bg-slate-950/80 p-10 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-indigo-300">Beta Access</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Buat ruang kerja revisi yang rapi sebelum sidang.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Akun beta digunakan untuk menyimpan proyek, dokumen, dan hasil analisis Anda pada backend SidangReady AI.
          </p>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-100">
          Kembali ke landing page
        </Link>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <AuthCard mode="register" />
      </section>
    </main>
  );
}
