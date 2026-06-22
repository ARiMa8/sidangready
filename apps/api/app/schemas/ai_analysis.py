from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

Priority = Literal["critical", "important", "minor"]
RevisionStatus = Literal["todo", "in_progress", "done", "ignored"]
SlideConsistencyStatus = Literal[
    "supported",
    "partially_supported",
    "unsupported",
    "contradictory",
    "needs_clarification",
]
ProblemType = Literal["unsupported", "contradictory", "too_broad", "unclear", "not_found"]
RiskLevel = Literal["low", "medium", "high", "critical"]
QuestionDifficulty = Literal["easy", "medium", "hard"]


class ThesisStructure(BaseModel):
    title: str
    problem_statements: list[str] = Field(default_factory=list)
    objectives: list[str] = Field(default_factory=list)
    methodology: str
    dataset_or_data: str
    implementation: str
    evaluation_metrics: list[str] = Field(default_factory=list)
    results: list[str] = Field(default_factory=list)
    conclusion: str
    limitations: list[str] = Field(default_factory=list)


class SlideClaim(BaseModel):
    slide_number: int = Field(ge=1)
    slide_title: str
    claims: list[str] = Field(default_factory=list)


class ExtractionBundle(BaseModel):
    thesis_structure: ThesisStructure
    slide_claims: list[SlideClaim] = Field(default_factory=list)


class RevisionItemOutput(BaseModel):
    title: str
    description: str
    priority: Priority
    related_chapter: str | None = None
    related_slide: int | None = Field(default=None, ge=1)
    reason: str
    suggested_action: str
    status: RevisionStatus = "todo"

    @field_validator("priority", mode="before")
    @classmethod
    def normalize_priority(cls, value: object) -> str:
        return _normalize_priority(value)

    @field_validator(
        "title",
        "description",
        "reason",
        "suggested_action",
        mode="before",
    )
    @classmethod
    def normalize_required_text(cls, value: object) -> str:
        return _required_text(value)


class SlideConsistencyOutput(BaseModel):
    slide_number: int = Field(ge=1)
    slide_title: str
    detected_claim: str
    matched_thesis_section: str | None = None
    status: SlideConsistencyStatus
    issue_summary: str
    suggested_fix: str
    evidence_excerpt: str | None = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, value: object) -> str:
        return _normalize_slide_status(value)

    @field_validator(
        "slide_title",
        "detected_claim",
        "issue_summary",
        "suggested_fix",
        mode="before",
    )
    @classmethod
    def normalize_required_text(cls, value: object) -> str:
        return _required_text(value)


class ProblematicClaimOutput(BaseModel):
    slide_number: int = Field(ge=1)
    claim_text: str
    problem_type: ProblemType
    risk_level: RiskLevel
    evidence_excerpt: str | None = None
    suggested_revision: str

    @field_validator("problem_type", mode="before")
    @classmethod
    def normalize_problem_type(cls, value: object) -> str:
        return _normalize_problem_type(value)

    @field_validator("risk_level", mode="before")
    @classmethod
    def normalize_risk_level(cls, value: object) -> str:
        return _normalize_risk_level(value)

    @field_validator("claim_text", "suggested_revision", mode="before")
    @classmethod
    def normalize_required_text(cls, value: object) -> str:
        return _required_text(value)


class DefenseQuestionOutput(BaseModel):
    category: str
    question: str
    why_asked: str
    answer_guidance: str
    related_section: str | None = None
    difficulty: QuestionDifficulty

    @field_validator("difficulty", mode="before")
    @classmethod
    def normalize_difficulty(cls, value: object) -> str:
        raw = _value_to_lower_text(value)
        if raw in {"easy", "mudah", "low"}:
            return "easy"
        if raw in {"hard", "sulit", "tinggi", "high"}:
            return "hard"
        return "medium"

    @field_validator("category", "question", "why_asked", "answer_guidance", mode="before")
    @classmethod
    def normalize_required_text(cls, value: object) -> str:
        return _required_text(value)


class PresentationScriptOutput(BaseModel):
    slide_number: int = Field(ge=1)
    slide_title: str
    estimated_duration_seconds: int = Field(ge=15, le=240)
    script_text: str
    key_points: list[str] = Field(default_factory=list)
    delivery_tips: list[str] = Field(default_factory=list)

    @field_validator("slide_title", "script_text", mode="before")
    @classmethod
    def normalize_required_text(cls, value: object) -> str:
        return _required_text(value)


class GeminiAnalysisOutput(BaseModel):
    overall_summary: str
    revision_items: list[RevisionItemOutput] = Field(default_factory=list)
    slide_checks: list[SlideConsistencyOutput] = Field(default_factory=list)
    problematic_claims: list[ProblematicClaimOutput] = Field(default_factory=list)
    defense_questions: list[DefenseQuestionOutput] = Field(default_factory=list)
    presentation_scripts: list[PresentationScriptOutput] = Field(default_factory=list)
    recommended_next_actions: list[str] = Field(default_factory=list)
    disclaimer: str

    @field_validator("overall_summary", "disclaimer", mode="before")
    @classmethod
    def normalize_required_text(cls, value: object) -> str:
        return _required_text(value)


class ReadinessOverview(BaseModel):
    readiness_score: int = Field(ge=0, le=100)
    readiness_category: str
    critical_issues_count: int = Field(ge=0)
    important_issues_count: int = Field(ge=0)
    minor_issues_count: int = Field(ge=0)
    total_slides_checked: int = Field(ge=0)
    total_revision_items: int = Field(ge=0)
    total_examiner_questions: int = Field(ge=0)
    score_explanation: list[str] = Field(default_factory=list)
    recommended_next_actions: list[str] = Field(default_factory=list)
    disclaimer: str


class FullReadinessResult(BaseModel):
    phase: str = "phase_6_gemini_analysis"
    provider: str = "google_gemini"
    extraction_model: str
    analysis_model: str
    thesis_structure: ThesisStructure
    slide_claims: list[SlideClaim]
    overview: ReadinessOverview
    revision_items: list[RevisionItemOutput]
    slide_checks: list[SlideConsistencyOutput]
    problematic_claims: list[ProblematicClaimOutput]
    defense_questions: list[DefenseQuestionOutput]
    presentation_scripts: list[PresentationScriptOutput]
    overall_summary: str
    raw_disclaimer: str


def _required_text(value: object) -> str:
    if value is None:
        return "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah."
    text = str(value).strip()
    return text or "Tidak ditemukan dukungan eksplisit pada laporan yang diunggah."


def _value_to_lower_text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip().lower().replace("_", " ").replace("-", " ")


def _normalize_priority(value: object) -> str:
    raw = _value_to_lower_text(value)
    if raw in {"critical", "kritis", "kritikal", "high", "tinggi"}:
        return "critical"
    if raw in {"minor", "rendah", "low", "kecil"}:
        return "minor"
    return "important"


def _normalize_slide_status(value: object) -> str:
    raw = _value_to_lower_text(value)
    if raw in {"supported", "didukung"}:
        return "supported"
    if raw in {"partially supported", "sebagian didukung", "partial"}:
        return "partially_supported"
    if raw in {"unsupported", "tidak didukung"}:
        return "unsupported"
    if raw in {"contradictory", "contradiction", "kontradiktif", "kontradiksi"}:
        return "contradictory"
    return "needs_clarification"


def _normalize_problem_type(value: object) -> str:
    raw = _value_to_lower_text(value)
    if raw in {"unsupported", "tidak didukung"}:
        return "unsupported"
    if raw in {"contradictory", "kontradiktif", "kontradiksi"}:
        return "contradictory"
    if raw in {"too broad", "terlalu luas"}:
        return "too_broad"
    if raw in {"not found", "tidak ditemukan"}:
        return "not_found"
    return "unclear"


def _normalize_risk_level(value: object) -> str:
    raw = _value_to_lower_text(value)
    if raw in {"critical", "kritis", "kritikal"}:
        return "critical"
    if raw in {"high", "tinggi"}:
        return "high"
    if raw in {"low", "rendah"}:
        return "low"
    return "medium"
