from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

DocumentType = Literal["thesis", "slides", "revision_notes", "other"]
ExtractionStatus = Literal["pending", "running", "success", "failed", "low_quality"]


class DocumentCreate(BaseModel):
    document_type: DocumentType
    file_name: str = Field(min_length=1, max_length=255)
    file_mime_type: str = Field(min_length=1, max_length=120)
    file_size: int = Field(gt=0)
    r2_object_key: str | None = Field(default=None, max_length=600)


class DocumentResponse(DocumentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    extraction_status: ExtractionStatus
    page_count: int | None
    slide_count: int | None
    created_at: datetime
    updated_at: datetime
