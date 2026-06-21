export type ProjectStatus =
  | "draft"
  | "uploaded"
  | "analyzing"
  | "analysis_complete"
  | "needs_revision"
  | "ready_for_defense"
  | "archived";

export type AnalysisStatus = "queued" | "running" | "complete" | "failed";

export type Priority = "critical" | "important" | "minor";

export type ChecklistStatus = "todo" | "in_progress" | "done" | "ignored";

export type ConsistencyStatus =
  | "supported"
  | "partially_supported"
  | "unsupported"
  | "contradictory"
  | "needs_clarification";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface Project {
  id: string;
  title: string;
  thesisTitle: string;
  studentName: string;
  university: string;
  major: string;
  description: string;
  status: ProjectStatus;
  readinessScore: number | null;
  lastUpdated: string;
  documentCount: number;
  analysisStatus: AnalysisStatus;
  criticalIssueCount: number;
}

export interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
}

export interface OverviewMetric {
  label: string;
  value: string;
  tone: "default" | "success" | "warning" | "danger" | "primary";
}

export interface RevisionItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  relatedChapter: string;
  relatedSlide?: string;
  reason: string;
  suggestedAction: string;
  status: ChecklistStatus;
}

export interface SlideCheck {
  id: string;
  slideNumber: number;
  slideTitle: string;
  detectedClaim: string;
  matchedThesisSection: string;
  status: ConsistencyStatus;
  issueSummary: string;
  suggestedFix: string;
  evidenceExcerpt: string;
}

export interface ProblematicClaim {
  id: string;
  slideNumber: number;
  claimText: string;
  problemType: "unsupported" | "contradictory" | "too_broad" | "unclear" | "not_found";
  riskLevel: RiskLevel;
  evidenceExcerpt: string;
  suggestedRevision: string;
}

export interface DefenseQuestion {
  id: string;
  category: string;
  question: string;
  whyAsked: string;
  answerGuidance: string;
  relatedSection: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface PresentationScriptSlide {
  id: string;
  slideNumber: number;
  slideTitle: string;
  estimatedDurationSeconds: number;
  scriptText: string;
  keyPoints: string[];
  deliveryTips: string[];
}

export interface ExportOption {
  id: string;
  title: string;
  description: string;
  format: "markdown" | "pdf" | "docx";
  availability: "available" | "planned";
}

export interface UploadSpec {
  id: string;
  title: string;
  description: string;
  formats: string;
  maxSize: string;
  required: boolean;
}
