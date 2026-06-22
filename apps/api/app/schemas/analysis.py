from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

AnalysisType = Literal[
    "full_readiness",
    "revision_checklist",
    "slide_consistency",
    "unsupported_claims",
    "defense_questions",
    "presentation_script",
    "final_report",
]
AnalysisStatus = Literal["pending", "queued", "running", "success", "failed"]


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    analysis_type: AnalysisType
    status: AnalysisStatus
    progress: int = Field(ge=0, le=100)
    current_step: str | None
    queue_job_id: str | None
    retry_count: int = Field(ge=0)
    max_retries: int = Field(ge=0)
    model_provider: str | None
    model_name: str | None
    result_json: dict[str, Any] | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class AnalysisQueueResponse(BaseModel):
    message: str
    analysis: AnalysisResponse
