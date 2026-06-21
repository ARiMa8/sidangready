import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UploadDropzone } from "@/components/project/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRIVACY_COPY } from "@/lib/constants";
import { uploadSpecs } from "@/lib/mock-data";

export default function NewProjectPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Buat Proyek Baru"
        title="Upload dokumen untuk analisis kesiapan sidang"
        description="Isi metadata proyek dan siapkan laporan skripsi, PPT sidang, serta catatan revisi. Form ini masih statis pada Phase 1."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>Informasi Proyek</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">Nama proyek</span>
              <Input placeholder="Contoh: Sidang Skripsi Semester Genap" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">Nama mahasiswa</span>
              <Input placeholder="Nama lengkap" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-300">Judul skripsi</span>
              <Input placeholder="Judul lengkap penelitian" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">Program studi</span>
              <Input placeholder="Teknik Informatika" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">Universitas/kampus</span>
              <Input placeholder="Nama kampus" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">
                Target durasi presentasi
              </span>
              <Input placeholder="10 menit" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-300">Deskripsi singkat</span>
              <Textarea placeholder="Tuliskan konteks singkat proyek, status revisi, atau hal yang ingin dicek." />
            </label>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-indigo-500/30 bg-indigo-500/5">
            <CardContent className="flex gap-3 p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
              <div>
                <h3 className="font-semibold text-indigo-100">Batas upload MVP</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Maksimal laporan 30MB, slide 30MB, catatan revisi 10MB, total 70MB.
                  OCR untuk PDF scan belum tersedia.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-sm leading-6 text-slate-400">
              {PRIVACY_COPY}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {uploadSpecs.map((spec) => (
          <UploadDropzone key={spec.id} spec={spec} />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild size="lg">
          <Link href="/projects/demo/progress">
            Lanjut ke Analisis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
