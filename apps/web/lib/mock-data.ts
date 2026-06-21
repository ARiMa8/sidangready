import type {
  AnalysisStep,
  DefenseQuestion,
  ExportOption,
  OverviewMetric,
  PresentationScriptSlide,
  ProblematicClaim,
  Project,
  RevisionItem,
  SlideCheck,
  UploadSpec,
} from "@/types";

export const mockProjects: Project[] = [
  {
    id: "demo",
    title: "Sistem Rekomendasi Skripsi Berbasis AI",
    thesisTitle:
      "Perancangan Sistem Rekomendasi Topik Skripsi Menggunakan Content-Based Filtering",
    studentName: "Andi Mahesa",
    university: "Universitas Nusantara",
    major: "Teknik Informatika",
    description:
      "Analisis kesiapan sidang untuk laporan dan slide final semester genap.",
    status: "needs_revision",
    readinessScore: 78,
    lastUpdated: "2026-06-14T10:21:00.000Z",
    documentCount: 3,
    analysisStatus: "complete",
    criticalIssueCount: 5,
  },
  {
    id: "social-sentiment",
    title: "Analisis Sentimen Media Sosial",
    thesisTitle:
      "Klasifikasi Sentimen Ulasan Produk Menggunakan Logistic Regression",
    studentName: "Nadia Prameswari",
    university: "Institut Teknologi Bandung",
    major: "Sistem Informasi",
    description: "Draft sidang dengan catatan revisi dari dosen pembimbing.",
    status: "analyzing",
    readinessScore: 64,
    lastUpdated: "2026-06-12T08:40:00.000Z",
    documentCount: 3,
    analysisStatus: "running",
    criticalIssueCount: 2,
  },
  {
    id: "crm-predict",
    title: "Prediksi Churn Pelanggan",
    thesisTitle:
      "Model Prediksi Churn Pelanggan pada Layanan Berlangganan Digital",
    studentName: "Raka Wiratama",
    university: "Universitas Gadjah Mada",
    major: "Ilmu Komputer",
    description: "Proyek masih menunggu upload PPT sidang.",
    status: "draft",
    readinessScore: null,
    lastUpdated: "2026-06-08T09:13:00.000Z",
    documentCount: 1,
    analysisStatus: "queued",
    criticalIssueCount: 0,
  },
];

export const uploadSpecs: UploadSpec[] = [
  {
    id: "thesis",
    title: "Laporan Skripsi",
    description: "PDF text-based atau DOCX",
    formats: "PDF, DOCX",
    maxSize: "30MB",
    required: true,
  },
  {
    id: "slides",
    title: "PPT Sidang",
    description: "PPTX atau PDF",
    formats: "PPTX, PDF",
    maxSize: "30MB",
    required: true,
  },
  {
    id: "revision",
    title: "Catatan Revisi",
    description: "Upload file atau paste catatan",
    formats: "TXT, DOCX",
    maxSize: "10MB",
    required: false,
  },
];

export const analysisSteps: AnalysisStep[] = [
  {
    id: "parse",
    title: "Parse dokumen",
    description: "Membaca laporan, slide, dan catatan revisi.",
    status: "success",
  },
  {
    id: "structure",
    title: "Ekstraksi struktur laporan",
    description: "Mengidentifikasi tujuan, metodologi, data, hasil, dan kesimpulan.",
    status: "success",
  },
  {
    id: "slides",
    title: "Ekstraksi slide",
    description: "Mengambil judul slide dan klaim utama.",
    status: "success",
  },
  {
    id: "mapping",
    title: "Pemetaan slide ke laporan",
    description: "Mencari bagian laporan yang mendukung isi slide.",
    status: "running",
  },
  {
    id: "consistency",
    title: "Cek konsistensi",
    description: "Menandai klaim yang didukung, sebagian, atau belum didukung.",
    status: "pending",
  },
  {
    id: "claims",
    title: "Deteksi klaim bermasalah",
    description: "Mengumpulkan klaim yang berisiko saat sidang.",
    status: "pending",
  },
  {
    id: "checklist",
    title: "Generate checklist revisi",
    description: "Membuat daftar tindakan revisi yang terstruktur.",
    status: "pending",
  },
  {
    id: "questions",
    title: "Generate pertanyaan penguji",
    description: "Menyusun pertanyaan yang mungkin muncul saat sidang.",
    status: "pending",
  },
  {
    id: "script",
    title: "Generate script presentasi",
    description: "Membuat naskah presentasi standar 10 menit.",
    status: "pending",
  },
  {
    id: "report",
    title: "Generate readiness report",
    description: "Merangkum skor, isu utama, dan rekomendasi berikutnya.",
    status: "pending",
  },
];

export const overviewMetrics: OverviewMetric[] = [
  { label: "Isu Kritis", value: "5", tone: "danger" },
  { label: "Isu Penting", value: "8", tone: "warning" },
  { label: "Isu Minor", value: "5", tone: "success" },
  { label: "Slide Dicek", value: "34", tone: "primary" },
  { label: "Checklist Revisi", value: "18", tone: "default" },
  { label: "Pertanyaan Penguji", value: "28", tone: "success" },
];

export const recommendedActions = [
  "Perbaiki 5 slide yang tidak konsisten dengan laporan.",
  "Tambahkan penjelasan parameter pada bagian metodologi.",
  "Perkuat justifikasi pemilihan algoritma sebelum latihan sidang.",
];

export const revisionItems: RevisionItem[] = [
  {
    id: "rev-1",
    title: "Data jumlah sampel tidak konsisten",
    description:
      "Slide menyebut 4.000 record, sementara laporan menjelaskan dataset final berisi 3.120 record.",
    priority: "critical",
    relatedChapter: "Bab 4 - Pengujian",
    relatedSlide: "Slide 7",
    reason:
      "Perbedaan angka dataset mudah dipertanyakan penguji dan dapat mengurangi kredibilitas hasil.",
    suggestedAction:
      "Samakan angka pada slide dengan laporan atau tambahkan penjelasan proses filtering data.",
    status: "todo",
  },
  {
    id: "rev-2",
    title: "Hasil akurasi tidak sesuai tabel evaluasi",
    description:
      "Slide hasil menampilkan akurasi 92%, sedangkan tabel evaluasi di laporan menunjukkan 87%.",
    priority: "critical",
    relatedChapter: "Bab 4 - Evaluasi",
    relatedSlide: "Slide 12",
    reason: "Metrik evaluasi adalah bagian yang sering ditanyakan saat sidang.",
    suggestedAction:
      "Gunakan angka yang sama dengan laporan atau jelaskan skenario pengujian yang berbeda.",
    status: "todo",
  },
  {
    id: "rev-3",
    title: "Kesimpulan belum menjawab semua rumusan masalah",
    description:
      "Rumusan masalah ke-3 belum terlihat dijawab secara eksplisit pada bagian kesimpulan.",
    priority: "critical",
    relatedChapter: "Bab 5 - Kesimpulan",
    relatedSlide: "Slide 15",
    reason:
      "Kesimpulan perlu menunjukkan hubungan langsung dengan rumusan masalah dan tujuan penelitian.",
    suggestedAction:
      "Tambahkan poin kesimpulan yang menjawab rumusan masalah ke-3 berdasarkan hasil evaluasi.",
    status: "in_progress",
  },
  {
    id: "rev-4",
    title: "Parameter algoritma belum dijelaskan",
    description:
      "Beberapa parameter model disebutkan di slide namun belum dijelaskan pada metodologi.",
    priority: "important",
    relatedChapter: "Bab 3 - Metodologi",
    relatedSlide: "Slide 9",
    reason: "Penguji dapat meminta alasan pemilihan parameter.",
    suggestedAction:
      "Tambahkan tabel parameter dan alasan pemilihannya pada laporan atau lampiran.",
    status: "todo",
  },
  {
    id: "rev-5",
    title: "Alur preprocessing data perlu dirapikan",
    description:
      "Urutan preprocessing pada slide berbeda dengan narasi di Bab 3.",
    priority: "important",
    relatedChapter: "Bab 3 - Metodologi",
    relatedSlide: "Slide 8",
    reason: "Alur yang tidak sama dapat membuat presentasi terasa kurang runtut.",
    suggestedAction:
      "Sesuaikan diagram slide dengan urutan pada laporan dan gunakan istilah yang sama.",
    status: "todo",
  },
  {
    id: "rev-6",
    title: "Format penulisan istilah perlu diseragamkan",
    description: "Istilah content-based filtering ditulis dalam beberapa variasi.",
    priority: "minor",
    relatedChapter: "Seluruh dokumen",
    reason: "Konsistensi istilah membantu laporan terlihat lebih rapi.",
    suggestedAction:
      "Gunakan satu format istilah dan periksa kembali daftar istilah pada laporan.",
    status: "done",
  },
];

export const slideChecks: SlideCheck[] = [
  {
    id: "slide-6",
    slideNumber: 6,
    slideTitle: "Rumusan Masalah",
    detectedClaim:
      "Penelitian menjawab tiga rumusan masalah terkait rekomendasi topik.",
    matchedThesisSection: "Bab 1.2 Rumusan Masalah",
    status: "supported",
    issueSummary: "Sesuai dengan Bab 1.2.",
    suggestedFix: "Pertahankan, cukup ringkas kalimat agar mudah dipresentasikan.",
    evidenceExcerpt:
      "Laporan memuat tiga rumusan masalah yang sejajar dengan poin pada slide.",
  },
  {
    id: "slide-7",
    slideNumber: 7,
    slideTitle: "Data dan Sampel",
    detectedClaim: "Dataset yang digunakan berjumlah 4.000 record.",
    matchedThesisSection: "Bab 4.1 Deskripsi Data",
    status: "unsupported",
    issueSummary: "Jumlah sampel berbeda dengan laporan.",
    suggestedFix:
      "Sesuaikan angka pada slide atau jelaskan perbedaan sebelum dan sesudah pembersihan data.",
    evidenceExcerpt:
      "Bab 4.1 menyebut dataset final berisi 3.120 record setelah proses filtering.",
  },
  {
    id: "slide-8",
    slideNumber: 8,
    slideTitle: "Metodologi",
    detectedClaim:
      "Preprocessing dilakukan melalui cleaning, tokenisasi, dan normalisasi.",
    matchedThesisSection: "Bab 3.2 Tahapan Penelitian",
    status: "partially_supported",
    issueSummary: "Urutan tahapan belum sama dengan laporan.",
    suggestedFix:
      "Samakan urutan tahapan pada slide dengan Bab 3 agar alurnya tidak membingungkan.",
    evidenceExcerpt:
      "Laporan menjelaskan cleaning, normalisasi, tokenisasi, lalu pembobotan fitur.",
  },
  {
    id: "slide-12",
    slideNumber: 12,
    slideTitle: "Hasil Akurasi",
    detectedClaim: "Model mencapai akurasi 92%.",
    matchedThesisSection: "Bab 4.2 Evaluasi Model",
    status: "contradictory",
    issueSummary: "Nilai tidak sesuai Tabel 4.2.",
    suggestedFix:
      "Gunakan nilai dari tabel evaluasi atau jelaskan skenario evaluasi berbeda.",
    evidenceExcerpt:
      "Tabel 4.2 menampilkan akurasi tertinggi 87% untuk skenario validasi utama.",
  },
  {
    id: "slide-14",
    slideNumber: 14,
    slideTitle: "Perbandingan Model",
    detectedClaim: "Model yang dipilih selalu lebih unggul dari baseline.",
    matchedThesisSection: "Bab 4.3 Pembahasan",
    status: "needs_clarification",
    issueSummary: "Klaim terlalu luas dan perlu batasan.",
    suggestedFix:
      "Gunakan kalimat yang lebih spesifik, misalnya unggul pada metrik tertentu saja.",
    evidenceExcerpt:
      "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah.",
  },
];

export const problematicClaims: ProblematicClaim[] = [
  {
    id: "claim-1",
    slideNumber: 7,
    claimText: "Dataset yang digunakan berjumlah 4.000 record.",
    problemType: "contradictory",
    riskLevel: "high",
    evidenceExcerpt:
      "Bab 4.1 menyebut dataset final berisi 3.120 record setelah proses filtering.",
    suggestedRevision:
      "Ubah angka di slide menjadi 3.120 record atau jelaskan jumlah awal dan jumlah final.",
  },
  {
    id: "claim-2",
    slideNumber: 12,
    claimText: "Model mencapai akurasi 92%.",
    problemType: "contradictory",
    riskLevel: "critical",
    evidenceExcerpt:
      "Tabel 4.2 menampilkan akurasi tertinggi 87% untuk skenario validasi utama.",
    suggestedRevision:
      "Gunakan angka evaluasi yang sama dengan laporan dan siapkan penjelasan metode validasi.",
  },
  {
    id: "claim-3",
    slideNumber: 14,
    claimText: "Model selalu lebih unggul dari baseline.",
    problemType: "too_broad",
    riskLevel: "medium",
    evidenceExcerpt:
      "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah.",
    suggestedRevision:
      "Batasi klaim pada metrik dan skenario pengujian yang memang ditampilkan di laporan.",
  },
];

export const defenseQuestions: DefenseQuestion[] = [
  {
    id: "q-1",
    category: "Metodologi",
    question:
      "Mengapa memilih metode content-based filtering dibandingkan metode rekomendasi lain?",
    whyAsked:
      "Penguji biasanya ingin melihat alasan metodologis, bukan hanya mengikuti contoh penelitian.",
    answerGuidance:
      "Jelaskan kesesuaian metode dengan karakteristik data, tujuan rekomendasi, dan keterbatasan data pengguna.",
    relatedSection: "Bab 2.4 dan Bab 3.1",
    difficulty: "medium",
  },
  {
    id: "q-2",
    category: "Dataset/Data",
    question:
      "Bagaimana Anda memastikan data yang digunakan sudah bersih dan representatif?",
    whyAsked:
      "Validitas data mempengaruhi kualitas rekomendasi dan hasil evaluasi.",
    answerGuidance:
      "Rujuk tahapan preprocessing, kriteria penghapusan data, dan batasan dataset yang tertulis di laporan.",
    relatedSection: "Bab 3.2 dan Bab 4.1",
    difficulty: "hard",
  },
  {
    id: "q-3",
    category: "Evaluasi",
    question:
      "Apakah metrik evaluasi yang digunakan sudah tepat? Jelaskan alasan pemilihannya.",
    whyAsked:
      "Penguji dapat menilai apakah hasil penelitian benar-benar mengukur tujuan sistem.",
    answerGuidance:
      "Hubungkan metrik evaluasi dengan tujuan rekomendasi, lalu sebutkan keterbatasan metrik tersebut.",
    relatedSection: "Bab 4.2",
    difficulty: "medium",
  },
  {
    id: "q-4",
    category: "Batasan Penelitian",
    question:
      "Apa batasan utama penelitian ini dan bagaimana pengaruhnya terhadap hasil?",
    whyAsked:
      "Bagian batasan menunjukkan kedewasaan akademik dan kejujuran interpretasi hasil.",
    answerGuidance:
      "Sampaikan batasan data, metode, dan cakupan sistem tanpa membuat klaim yang tidak ada di laporan.",
    relatedSection: "Bab 5.2",
    difficulty: "easy",
  },
];

export const presentationScript: PresentationScriptSlide[] = [
  {
    id: "script-1",
    slideNumber: 1,
    slideTitle: "Judul",
    estimatedDurationSeconds: 35,
    scriptText:
      "Selamat pagi Bapak dan Ibu penguji. Saya akan mempresentasikan penelitian berjudul Perancangan Sistem Rekomendasi Topik Skripsi Menggunakan Content-Based Filtering. Presentasi ini akan mencakup latar belakang, rumusan masalah, metodologi, hasil, dan kesimpulan.",
    keyPoints: ["Judul penelitian", "Nama dan program studi", "Arah presentasi"],
    deliveryTips: ["Buka dengan tenang", "Jangan membaca seluruh judul terlalu cepat"],
  },
  {
    id: "script-2",
    slideNumber: 2,
    slideTitle: "Latar Belakang",
    estimatedDurationSeconds: 70,
    scriptText:
      "Pada tahap akhir studi, mahasiswa sering mengalami kesulitan memilih topik skripsi yang sesuai dengan minat dan kompetensi. Penelitian ini mencoba membantu proses tersebut dengan sistem rekomendasi yang memanfaatkan kemiripan antara minat mahasiswa dan deskripsi topik yang tersedia.",
    keyPoints: [
      "Masalah pemilihan topik",
      "Kebutuhan rekomendasi yang terarah",
      "Konteks mahasiswa tingkat akhir",
    ],
    deliveryTips: ["Gunakan contoh singkat", "Hubungkan masalah dengan pengalaman kampus"],
  },
  {
    id: "script-3",
    slideNumber: 8,
    slideTitle: "Metodologi",
    estimatedDurationSeconds: 85,
    scriptText:
      "Tahapan penelitian dimulai dari pengumpulan data topik, preprocessing teks, pembobotan fitur, perhitungan kemiripan, dan evaluasi rekomendasi. Pada revisi berikutnya, urutan tahapan di slide ini perlu disamakan dengan narasi Bab 3 agar presentasi lebih konsisten.",
    keyPoints: ["Pengumpulan data", "Preprocessing", "Pembobotan dan similarity"],
    deliveryTips: ["Jelaskan alur dari kiri ke kanan", "Siapkan alasan pemilihan parameter"],
  },
  {
    id: "script-4",
    slideNumber: 15,
    slideTitle: "Kesimpulan",
    estimatedDurationSeconds: 60,
    scriptText:
      "Berdasarkan hasil penelitian, sistem dapat memberikan rekomendasi topik berdasarkan kemiripan teks antara minat mahasiswa dan deskripsi topik. Kesimpulan akhir perlu memastikan semua rumusan masalah dijawab secara eksplisit sesuai arahan pembimbing.",
    keyPoints: ["Jawaban rumusan masalah", "Ringkasan hasil", "Batasan penelitian"],
    deliveryTips: ["Tutup dengan kalimat ringkas", "Hindari klaim yang tidak tertulis di laporan"],
  },
];

export const exportOptions: ExportOption[] = [
  {
    id: "markdown",
    title: "Markdown",
    description: "Laporan ringkas dan mudah diedit untuk dokumentasi revisi.",
    format: "markdown",
    availability: "available",
  },
  {
    id: "pdf",
    title: "PDF",
    description: "Format siap cetak untuk arsip atau diskusi dengan pembimbing.",
    format: "pdf",
    availability: "planned",
  },
  {
    id: "docx",
    title: "DOCX",
    description: "Format dokumen untuk penyuntingan lanjutan.",
    format: "docx",
    availability: "planned",
  },
];
