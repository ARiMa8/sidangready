from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

ExportType = Literal["markdown", "pdf", "docx"]


class ExportCreateRequest(BaseModel):
    export_type: ExportType = "markdown"


class ExportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    export_type: ExportType
    file_name: str
    file_mime_type: str
    file_size: int
    r2_object_key: str
    created_at: datetime
    updated_at: datetime
    expires_at: datetime


class ExportDownloadResponse(BaseModel):
    export_id: UUID
    download_url: str
    expires_in: int
