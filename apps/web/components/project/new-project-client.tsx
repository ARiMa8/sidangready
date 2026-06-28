"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { UploadDropzone } from "@/components/project/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError, type ApiDocumentType } from "@/lib/api";
import { PRIVACY_COPY } from "@/lib/constants";
import { uploadSpecs } from "@/lib/mock-data";

type UploadKey = "thesis" | "slides" | "revision";
type UploadStatus = "idle" | "uploading" | "success" | "failed";

const initialUploadStatus: Record<UploadKey, UploadStatus> = {
  thesis: "idle",
  slides: "idle",
  revision: "idle",
};

const documentTypeByKey: Record<UploadKey, ApiDocumentType> = {
  thesis: "thesis",
  slides: "slides",
  revision: "revision_notes",
};

function mimeFromFile(file: File): string {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (name.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (name.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function revisionTextToFile(text: string): File | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return new File([trimmed], "catatan-revisi.txt", { type: "text/plain" });
}

export function NewProjectClient() {
  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth({ redirectToLogin: true });
  const [title, setTitle] = useState("");
  const [studentName, setStudentName] = useState("");
  const [thesisTitle, setThesisTitle] = useState("");
  const [major, setMajor] = useState("");
  const [university, setUniversity] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("10");
  const [description, setDescription] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [files, setFiles] = useState<Record<UploadKey, File | null>>({
    thesis: null,
    slides: null,
    revision: null,
  });
  const [uploadStatus, setUploadStatus] =
    useState<Record<UploadKey, UploadStatus>>(initialUploadStatus);
  const [statusMessage, setStatusMessage] = useState<Record<UploadKey, string>>({
    thesis: "",
    slides: "",
    revision: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRevisionText = revisionNotes.trim().length > 0;
  const hasRevisionFile = files.revision !== null;

  function setFile(key: UploadKey, file: File | null) {
    setFiles((current) => ({ ...current, [key]: file }));
    setUploadStatus((current) => ({ ...current, [key]: "idle" }));
    setStatusMessage((current) => ({ ...current, [key]: "" }));
  }

  async function uploadAndExtract(
    activeToken: string,
    projectId: string,
    key: UploadKey,
    file: File,
  ) {
    setUploadStatus((current) => ({ ...current, [key]: "uploading" }));
    setStatusMessage((current) => ({
      ...current,
      [key]: "Meminta presigned URL dari backend.",
    }));

    const fileMimeType = mimeFromFile(file);
    const presign = await api.presignDocument(activeToken, projectId, {
      document_type: documentTypeByKey[key],
      file_name: file.name,
      file_mime_type: fileMimeType,
      file_size: file.size,
    });

    setStatusMessage((current) => ({
      ...current,
      [key]: "Mengunggah file langsung ke Cloudflare R2.",
    }));
    await api.uploadToPresignedUrl(file, presign);

    setStatusMessage((current) => ({
      ...current,
      [key]: "Mengonfirmasi metadata dokumen.",
    }));
    const confirmed = await api.confirmDocument(activeToken, projectId, {
      document_id: presign.document_id,
      document_type: documentTypeByKey[key],
      file_name: file.name,
      file_mime_type: fileMimeType,
      file_size: file.size,
      r2_object_key: presign.object_key,
    });

    setStatusMessage((current) => ({
      ...current,
      [key]: "Mengekstrak teks dokumen.",
    }));
    const extracted = await api.extractDocument(activeToken, projectId, confirmed.id);

    setUploadStatus((current) => ({ ...current, [key]: "success" }));
    setStatusMessage((current) => ({
      ...current,
      [key]:
        extracted.extraction_warning ??
        `Ekstraksi selesai. ${extracted.extracted_text_length} karakter terbaca.`,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const activeToken = token;
    setError(null);
    setIsSubmitting(true);
    setUploadStatus(initialUploadStatus);

    try {
      if (!files.thesis || !files.slides) {
        throw new Error("Laporan skripsi dan slide sidang wajib diunggah.");
      }

      const project = await api.createProject(activeToken, {
        title,
        thesis_title: thesisTitle,
        student_name: studentName,
        university,
        major,
        description,
        target_presentation_minutes: Number(targetMinutes),
      });

      const revisionFile = files.revision ?? revisionTextToFile(revisionNotes);
      await uploadAndExtract(activeToken, project.id, "thesis", files.thesis);
      await uploadAndExtract(activeToken, project.id, "slides", files.slides);
      if (revisionFile) {
        await uploadAndExtract(activeToken, project.id, "revision", revisionFile);
      }

      await api.queueFullAnalysis(activeToken, project.id);
      router.push(`/projects/${project.id}/progress`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Proyek belum dapat dibuat. Periksa kembali input dan koneksi API.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading) {
    return (
      <AppShell>
        <LoadingState title="Memeriksa sesi" description="Menyiapkan akses akun Anda." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Buat Proyek Baru"
        title="Upload dokumen untuk analisis kesiapan sidang"
        description="Isi metadata proyek dan unggah laporan skripsi, PPT sidang, serta catatan revisi resmi bila tersedia."
      />

      {error ? (
        <div className="mb-5">
          <ErrorState title="Proyek belum dapat dibuat" description={error} />
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>Informasi Proyek</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Nama proyek</span>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Sidang Skripsi Semester Genap"
                  required
                  minLength={3}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Nama mahasiswa</span>
                <Input
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Nama lengkap"
                  required
                  minLength={2}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">Judul skripsi</span>
                <Input
                  value={thesisTitle}
                  onChange={(event) => setThesisTitle(event.target.value)}
                  placeholder="Judul lengkap penelitian"
                  required
                  minLength={5}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Program studi</span>
                <Input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  placeholder="Teknik Informatika"
                  required
                  minLength={2}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Universitas/kampus</span>
                <Input
                  value={university}
                  onChange={(event) => setUniversity(event.target.value)}
                  placeholder="Nama kampus"
                  required
                  minLength={2}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Target durasi presentasi
                </span>
                <Input
                  type="number"
                  value={targetMinutes}
                  onChange={(event) => setTargetMinutes(event.target.value)}
                  min={5}
                  max={15}
                  required
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">Deskripsi singkat</span>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tuliskan konteks singkat proyek, status revisi, atau hal yang ingin dicek."
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">
                  Paste catatan revisi resmi opsional
                </span>
                <Textarea
                  value={revisionNotes}
                  onChange={(event) => setRevisionNotes(event.target.value)}
                  placeholder="Jika sudah ada catatan revisi dari dosen/penguji, tulis poinnya di sini."
                  disabled={isSubmitting || hasRevisionFile}
                />
                <p className="text-xs leading-5 text-slate-500">
                  Pilih salah satu: paste catatan di sini atau upload file Catatan
                  Revisi Resmi di bawah. Jika belum ada revisi resmi, kosongkan.
                </p>
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
                    Maksimal laporan 30MB, slide 30MB, catatan revisi 10MB, total
                    70MB. OCR untuk PDF scan belum tersedia.
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
          {uploadSpecs.map((spec) => {
            const key = spec.id as UploadKey;
            return (
              <UploadDropzone
                key={spec.id}
                spec={spec}
                file={files[key]}
                status={uploadStatus[key]}
                message={statusMessage[key]}
                disabled={
                  isSubmitting || (key === "revision" && hasRevisionText)
                }
                onFileChange={(file) => setFile(key, file)}
              />
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isSubmitting ? "Memproses dokumen" : "Upload dan Mulai Analisis"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
