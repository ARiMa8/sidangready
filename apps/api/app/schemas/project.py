from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ProjectStatus = Literal[
    "draft",
    "uploaded",
    "analyzing",
    "analysis_complete",
    "needs_revision",
    "ready_for_defense",
    "archived",
]


class ProjectBase(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    thesis_title: str = Field(min_length=5, max_length=300)
    student_name: str = Field(min_length=2, max_length=120)
    university: str = Field(min_length=2, max_length=180)
    major: str = Field(min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=3000)
    target_presentation_minutes: int = Field(default=10, ge=5, le=15)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    thesis_title: str | None = Field(default=None, min_length=5, max_length=300)
    student_name: str | None = Field(default=None, min_length=2, max_length=120)
    university: str | None = Field(default=None, min_length=2, max_length=180)
    major: str | None = Field(default=None, min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=3000)
    target_presentation_minutes: int | None = Field(default=None, ge=5, le=15)
    status: ProjectStatus | None = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    status: ProjectStatus
    readiness_score: int | None
    created_at: datetime
    updated_at: datetime
