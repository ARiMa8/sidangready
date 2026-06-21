import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  ListChecks,
  Presentation,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { ETHICAL_DISCLAIMER, TAGLINE } from "@/lib/constants";

const problems = [
  "Slide tidak konsisten dengan laporan",
  "Revisi dosen tercecer dan tidak terstruktur",
  "Bingung menyiapkan jawaban penguji",
  "Takut klaim di PPT tidak ada di laporan",
  "Script presentasi terlalu panjang atau tidak runtut",
];

const features = [
  { title: "Cek Konsistensi Slide", icon: SearchCheck },
  { title: "Checklist Revisi Otomatis", icon: ListChecks },
  { title: "Deteksi Klaim Bermasalah", icon: ShieldAlert },
  { title: "Pertanyaan Penguji", icon: HelpCircle },
  { title: "Script Presentasi", icon: Presentation },
  { title: "Laporan Kesiapan", icon: FileCheck2 },
];

const steps = [
  "Unggah Dokumen",
  "AI Menganalisis",
  "Tinjau Rekomendasi",
  "Revisi dan Export",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section
        className="relative min-h-[720px] overflow-hidden border-b border-border bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.82) 46%, rgba(2,6,23,0.7) 100%), url('/hero.png')",
        }}
      >
        <nav className="section-shell flex h-20 items-center justify-between">
          <Logo />
          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#fitur" className="hover:text-slate-100">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-slate-100">
              Cara Kerja
            </a>
            <a href="#contoh" className="hover:text-slate-100">
              Contoh Output
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Coba Beta</Link>
            </Button>
          </div>
        </nav>

        <div className="section-shell flex min-h-[600px] items-center pb-16">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              Skripsi Defense & Revision Agent
            </p>
            <h1 className="text-5xl font-semibold tracking-normal text-slate-50 md:text-7xl">
              SidangReady AI
            </h1>
            <p className="mt-5 max-w-2xl text-2xl font-semibold leading-tight text-slate-100 md:text-3xl">
              Persiapan Sidang Lebih Terstruktur. Revisi Lebih Cepat. Hasil
              Lebih Siap.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              SidangReady AI membantu mahasiswa menganalisis laporan dan PPT
              sidang, menemukan ketidakkonsistenan, menyusun checklist revisi,
              menyiapkan pertanyaan penguji, dan membuat laporan kesiapan
              sidang.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Mulai Analisis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/projects/demo/overview">Lihat Demo</Link>
              </Button>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400">
              {ETHICAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-slate-950/70 py-14">
        <div className="section-shell">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-indigo-300">
              Masalah yang sering dihadapi
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">
              Bukan menulis skripsi dari nol, tetapi membantu mengecek kesiapan
              dokumen.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {problems.map((problem) => (
              <Card key={problem}>
                <CardContent className="p-4">
                  <CheckCircle2 className="mb-4 h-5 w-5 text-amber-300" />
                  <p className="text-sm leading-6 text-slate-300">{problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="border-b border-border py-14">
        <div className="section-shell">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-indigo-300">
                Fitur MVP
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                Satu alur untuk persiapan sidang dan revisi.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              {TAGLINE}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-5">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Rekomendasi berbasis dokumen yang diunggah dan tetap perlu
                      ditinjau ulang.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="border-b border-border bg-slate-950/55 py-14"
      >
        <div className="section-shell">
          <p className="text-sm font-semibold uppercase text-indigo-300">
            Cara Kerja
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-border bg-card/70 p-5"
              >
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-indigo-500 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="font-semibold">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Ikuti alur sederhana dari upload hingga laporan akhir berbasis
                  Markdown.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contoh" className="border-b border-border py-14">
        <div className="section-shell grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-indigo-300">
              Contoh Output
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">
              Dari dokumen menjadi daftar revisi yang bisa dikerjakan.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Output mock menampilkan skor kesiapan, isu kritis, konsistensi
              slide, pertanyaan penguji, dan script presentasi tanpa mengklaim
              hasil sidang.
            </p>
          </div>
          <Card>
            <CardContent className="space-y-3 p-5">
              {[
                "Readiness Score 78/100",
                "5 isu kritis",
                "18 checklist revisi",
                "28 pertanyaan penguji",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-md bg-slate-950/45 p-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-14">
        <div className="section-shell flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">
              Siap mencoba versi beta?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Mulai dari UI mock untuk portfolio demo. Backend, storage, queue,
              dan AI akan menyusul di fase berikutnya.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard">Buka Dashboard</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="section-shell flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>
            Semua hasil analisis perlu ditinjau kembali oleh mahasiswa dan
            pembimbing.
          </p>
        </div>
      </footer>
    </main>
  );
}
