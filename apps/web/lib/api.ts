export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export const API_ROUTES = {
  health: "/api/health",
  projects: "/api/projects",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
  },
} as const;

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: ApiUser;
}

export interface ApiProject {
  id: string;
  user_id: string;
  title: string;
  thesis_title: string;
  student_name: string;
  university: string;
  major: string;
  description: string | null;
  target_presentation_minutes: number;
  status:
    | "draft"
    | "uploaded"
    | "analyzing"
    | "analysis_complete"
    | "needs_revision"
    | "ready_for_defense"
    | "archived";
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiProjectCreate {
  title: string;
  thesis_title: string;
  student_name: string;
  university: string;
  major: string;
  description?: string | null;
  target_presentation_minutes: number;
}

export type ApiDocumentType = "thesis" | "slides" | "revision_notes" | "other";
export type ApiExtractionStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "low_quality";

export interface ApiDocument {
  id: string;
  project_id: string;
  document_type: ApiDocumentType;
  file_name: string;
  file_mime_type: string;
  file_size: number;
  r2_object_key: string | null;
  extraction_status: ApiExtractionStatus;
  extraction_warning: string | null;
  extraction_error_message: string | null;
  page_count: number | null;
  slide_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiDocumentExtraction extends ApiDocument {
  extracted_text_length: number;
}

export interface ApiPresignResponse {
  document_id: string;
  object_key: string;
  upload_url: string;
  method: "PUT";
  expires_in: number;
  headers: Record<string, string>;
}

export interface ApiAnalysis {
  id: string;
  project_id: string;
  analysis_type: string;
  status: "pending" | "queued" | "running" | "success" | "failed";
  progress: number;
  current_step: string | null;
  queue_job_id: string | null;
  retry_count: number;
  max_retries: number;
  model_provider: string | null;
  model_name: string | null;
  result_json: ApiFullReadinessResult | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiQueueResponse {
  message: string;
  analysis: ApiAnalysis;
}

export interface ApiOverview {
  readiness_score?: number;
  readiness_category?: string;
  critical_issues_count?: number;
  important_issues_count?: number;
  minor_issues_count?: number;
  total_slides_checked?: number;
  total_revision_items?: number;
  total_examiner_questions?: number;
  score_explanation?: string[];
  recommended_next_actions?: string[];
  disclaimer?: string;
}

export interface ApiRevisionItem {
  id?: string;
  title: string;
  description: string;
  priority: "critical" | "important" | "minor";
  related_chapter: string | null;
  related_slide: number | null;
  reason: string;
  suggested_action: string;
  status: "todo" | "in_progress" | "done" | "ignored";
}

export interface ApiSlideCheck {
  id?: string;
  slide_number: number;
  slide_title: string;
  detected_claim: string;
  matched_thesis_section: string | null;
  status:
    | "supported"
    | "partially_supported"
    | "unsupported"
    | "contradictory"
    | "needs_clarification";
  issue_summary: string;
  suggested_fix: string;
  evidence_excerpt: string | null;
}

export interface ApiProblematicClaim {
  id?: string;
  slide_number: number;
  claim_text: string;
  problem_type: "unsupported" | "contradictory" | "too_broad" | "unclear" | "not_found";
  risk_level: "low" | "medium" | "high" | "critical";
  evidence_excerpt: string | null;
  suggested_revision: string;
}

export interface ApiDefenseQuestion {
  id?: string;
  category: string;
  question: string;
  why_asked: string;
  answer_guidance: string;
  related_section: string | null;
  difficulty: "easy" | "medium" | "hard";
}

export interface ApiPresentationScript {
  id?: string;
  slide_number: number;
  slide_title: string;
  estimated_duration_seconds: number;
  script_text: string;
  key_points: string[];
  delivery_tips: string[];
}

export interface ApiFullReadinessResult {
  phase: string;
  provider: string;
  extraction_model: string;
  analysis_model: string;
  overview: ApiOverview;
  official_revision_items?: ApiRevisionItem[];
  revision_items: ApiRevisionItem[];
  slide_checks: ApiSlideCheck[];
  problematic_claims: ApiProblematicClaim[];
  defense_questions: ApiDefenseQuestion[];
  presentation_scripts: ApiPresentationScript[];
  overall_summary: string;
  raw_disclaimer: string;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: BodyInit | object | null;
};

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function formatApiError(status: number, detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg ?? item).join(", ");
  if (detail && typeof detail === "object" && "detail" in detail) {
    return formatApiError(status, (detail as { detail: unknown }).detail);
  }
  return `Request gagal dengan status ${status}.`;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const body = options.body;
  const isJsonBody =
    body !== null &&
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    typeof body !== "string";

  if (isJsonBody) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | null | undefined),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(formatApiError(response.status, data), response.status, data);
  }

  return data as T;
}

export const api = {
  register(payload: { name: string; email: string; password: string }) {
    return apiFetch<ApiUser>(API_ROUTES.auth.register, {
      method: "POST",
      body: payload,
    });
  },

  login(payload: { email: string; password: string }) {
    return apiFetch<TokenResponse>(API_ROUTES.auth.login, {
      method: "POST",
      body: payload,
    });
  },

  me(token: string) {
    return apiFetch<ApiUser>(API_ROUTES.auth.me, { token });
  },

  listProjects(token: string) {
    return apiFetch<ApiProject[]>(API_ROUTES.projects, { token });
  },

  createProject(token: string, payload: ApiProjectCreate) {
    return apiFetch<ApiProject>(API_ROUTES.projects, {
      method: "POST",
      token,
      body: payload,
    });
  },

  getProject(token: string, projectId: string) {
    return apiFetch<ApiProject>(`/api/projects/${projectId}`, { token });
  },

  listDocuments(token: string, projectId: string) {
    return apiFetch<ApiDocument[]>(`/api/projects/${projectId}/documents`, { token });
  },

  presignDocument(
    token: string,
    projectId: string,
    payload: {
      document_type: ApiDocumentType;
      file_name: string;
      file_mime_type: string;
      file_size: number;
    },
  ) {
    return apiFetch<ApiPresignResponse>(`/api/projects/${projectId}/documents/presign`, {
      method: "POST",
      token,
      body: payload,
    });
  },

  async uploadToPresignedUrl(file: File, presign: ApiPresignResponse) {
    const response = await fetch(presign.upload_url, {
      method: presign.method,
      headers: presign.headers,
      body: file,
    });
    if (!response.ok) {
      throw new ApiError(
        `Upload ke storage gagal dengan status ${response.status}.`,
        response.status,
      );
    }
  },

  confirmDocument(
    token: string,
    projectId: string,
    payload: {
      document_id: string;
      document_type: ApiDocumentType;
      file_name: string;
      file_mime_type: string;
      file_size: number;
      r2_object_key: string;
    },
  ) {
    return apiFetch<ApiDocument>(`/api/projects/${projectId}/documents/confirm`, {
      method: "POST",
      token,
      body: payload,
    });
  },

  extractDocument(token: string, projectId: string, documentId: string) {
    return apiFetch<ApiDocumentExtraction>(
      `/api/projects/${projectId}/documents/${documentId}/extract`,
      {
        method: "POST",
        token,
      },
    );
  },

  queueFullAnalysis(token: string, projectId: string) {
    return apiFetch<ApiQueueResponse>(`/api/projects/${projectId}/analyses/full`, {
      method: "POST",
      token,
    });
  },

  getLatestAnalysis(token: string, projectId: string) {
    return apiFetch<ApiAnalysis>(`/api/projects/${projectId}/analyses/latest`, {
      token,
    });
  },

  retryAnalysis(token: string, projectId: string, analysisId: string) {
    return apiFetch<ApiQueueResponse>(
      `/api/projects/${projectId}/analyses/${analysisId}/retry`,
      {
        method: "POST",
        token,
      },
    );
  },

  getOverview(token: string, projectId: string) {
    return apiFetch<ApiOverview>(`/api/projects/${projectId}/results/overview`, {
      token,
    });
  },

  getChecklist(token: string, projectId: string) {
    return apiFetch<ApiRevisionItem[]>(`/api/projects/${projectId}/results/checklist`, {
      token,
    });
  },

  getOfficialRevisionChecklist(token: string, projectId: string) {
    return apiFetch<ApiRevisionItem[]>(
      `/api/projects/${projectId}/results/revision-checklist`,
      {
        token,
      },
    );
  },

  updateChecklistStatus(
    token: string,
    projectId: string,
    itemId: string,
    statusValue: ApiRevisionItem["status"],
  ) {
    return apiFetch<ApiRevisionItem>(
      `/api/projects/${projectId}/results/checklist/${itemId}`,
      {
        method: "PATCH",
        token,
        body: { status: statusValue },
      },
    );
  },

  updateOfficialRevisionChecklistStatus(
    token: string,
    projectId: string,
    itemId: string,
    statusValue: ApiRevisionItem["status"],
  ) {
    return apiFetch<ApiRevisionItem>(
      `/api/projects/${projectId}/results/revision-checklist/${itemId}`,
      {
        method: "PATCH",
        token,
        body: { status: statusValue },
      },
    );
  },

  getSlideConsistency(token: string, projectId: string) {
    return apiFetch<ApiSlideCheck[]>(
      `/api/projects/${projectId}/results/slide-consistency`,
      { token },
    );
  },

  getProblematicClaims(token: string, projectId: string) {
    return apiFetch<ApiProblematicClaim[]>(
      `/api/projects/${projectId}/results/problematic-claims`,
      { token },
    );
  },

  getDefenseQuestions(token: string, projectId: string) {
    return apiFetch<ApiDefenseQuestion[]>(
      `/api/projects/${projectId}/results/defense-questions`,
      { token },
    );
  },

  getPresentationScript(token: string, projectId: string) {
    return apiFetch<ApiPresentationScript[]>(
      `/api/projects/${projectId}/results/presentation-script`,
      { token },
    );
  },
};
