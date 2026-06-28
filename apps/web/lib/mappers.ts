import type {
  ApiAnalysis,
  ApiDefenseQuestion,
  ApiDocument,
  ApiOverview,
  ApiPresentationScript,
  ApiProblematicClaim,
  ApiProject,
  ApiRevisionItem,
  ApiSlideCheck,
} from "@/lib/api";
import type {
  AnalysisStatus,
  DefenseQuestion,
  OverviewMetric,
  PresentationScriptSlide,
  ProblematicClaim,
  Project,
  RevisionItem,
  SlideCheck,
} from "@/types";

const EMPTY_EVIDENCE = "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah.";

export function mapProject(
  project: ApiProject,
  documents: ApiDocument[] = [],
  latestAnalysis: ApiAnalysis | null = null,
): Project {
  const result = latestAnalysis?.result_json;
  const criticalIssueCount = result?.overview?.critical_issues_count ?? 0;

  return {
    id: project.id,
    title: project.title,
    thesisTitle: project.thesis_title,
    studentName: project.student_name,
    university: project.university,
    major: project.major,
    description: project.description ?? "",
    status: project.status,
    readinessScore: project.readiness_score,
    lastUpdated: project.updated_at,
    documentCount: documents.length,
    documentSummary: formatDocumentSummary(documents),
    analysisStatus: mapAnalysisStatus(latestAnalysis?.status),
    criticalIssueCount,
  };
}

function formatDocumentSummary(documents: ApiDocument[]): string {
  const hasThesis = documents.some((document) => document.document_type === "thesis");
  const slideDocument = documents.find((document) => document.document_type === "slides");
  const hasRevisionNotes = documents.some(
    (document) => document.document_type === "revision_notes",
  );
  const parts = [];
  if (hasThesis) parts.push("laporan");
  if (slideDocument) {
    parts.push(
      slideDocument.slide_count
        ? `slide (${slideDocument.slide_count})`
        : "slide",
    );
  }
  if (hasRevisionNotes) parts.push("catatan revisi");
  return parts.length > 0 ? parts.join(", ") : "Belum ada dokumen";
}

export function mapAnalysisStatus(status: ApiAnalysis["status"] | undefined): AnalysisStatus {
  if (status === "success") return "complete";
  if (status === "running") return "running";
  if (status === "failed") return "failed";
  return "queued";
}

export function mapOverviewMetrics(overview: ApiOverview): OverviewMetric[] {
  return [
    {
      label: "Isu Kritis",
      value: String(overview.critical_issues_count ?? 0),
      tone: "danger",
    },
    {
      label: "Isu Penting",
      value: String(overview.important_issues_count ?? 0),
      tone: "warning",
    },
    {
      label: "Isu Minor",
      value: String(overview.minor_issues_count ?? 0),
      tone: "success",
    },
    {
      label: "Slide Dicek",
      value: String(overview.total_slides_checked ?? 0),
      tone: "primary",
    },
    {
      label: "Checklist Perbaikan",
      value: String(overview.total_revision_items ?? 0),
      tone: "default",
    },
    {
      label: "Pertanyaan Penguji",
      value: String(overview.total_examiner_questions ?? 0),
      tone: "success",
    },
  ];
}

export function mapRevisionItem(item: ApiRevisionItem, index: number): RevisionItem {
  return {
    id: item.id ?? `rev-${index + 1}`,
    title: item.title,
    description: item.description,
    priority: item.priority,
    relatedChapter: item.related_chapter ?? "Tidak disebutkan",
    relatedSlide: item.related_slide ? `Slide ${item.related_slide}` : undefined,
    reason: item.reason,
    suggestedAction: item.suggested_action,
    status: item.status,
  };
}

export function mapSlideCheck(item: ApiSlideCheck, index: number): SlideCheck {
  return {
    id: item.id ?? `slide-${index + 1}`,
    slideNumber: item.slide_number,
    slideTitle: item.slide_title,
    detectedClaim: item.detected_claim,
    matchedThesisSection: item.matched_thesis_section ?? "Tidak ditemukan",
    status: item.status,
    issueSummary: item.issue_summary,
    suggestedFix: item.suggested_fix,
    evidenceExcerpt: item.evidence_excerpt ?? EMPTY_EVIDENCE,
  };
}

export function mapProblematicClaim(
  item: ApiProblematicClaim,
  index: number,
): ProblematicClaim {
  return {
    id: item.id ?? `claim-${index + 1}`,
    slideNumber: item.slide_number,
    claimText: item.claim_text,
    problemType: item.problem_type,
    riskLevel: item.risk_level,
    evidenceExcerpt: item.evidence_excerpt ?? EMPTY_EVIDENCE,
    suggestedRevision: item.suggested_revision,
  };
}

export function mapDefenseQuestion(
  item: ApiDefenseQuestion,
  index: number,
): DefenseQuestion {
  return {
    id: item.id ?? `q-${index + 1}`,
    category: item.category,
    question: item.question,
    whyAsked: item.why_asked,
    answerGuidance: item.answer_guidance,
    relatedSection: item.related_section ?? "Tidak disebutkan",
    difficulty: item.difficulty,
  };
}

export function mapPresentationScript(
  item: ApiPresentationScript,
  index: number,
): PresentationScriptSlide {
  return {
    id: item.id ?? `script-${index + 1}`,
    slideNumber: item.slide_number,
    slideTitle: item.slide_title,
    estimatedDurationSeconds: item.estimated_duration_seconds,
    scriptText: item.script_text,
    keyPoints: item.key_points,
    deliveryTips: item.delivery_tips,
  };
}
