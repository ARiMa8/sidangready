from __future__ import annotations

from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.services.analysis_service import get_latest_analysis_for_project
from app.services.auth_service import get_current_user
from app.services.project_service import get_project_for_user

router = APIRouter(prefix="/projects/{project_id}/results", tags=["results"])

ChecklistStatus = Literal["todo", "in_progress", "done", "ignored"]


class ChecklistStatusUpdate(BaseModel):
    status: ChecklistStatus


def _latest_result(db: Session, project_id: UUID, user_id: UUID) -> tuple[Analysis, dict[str, Any]]:
    get_project_for_user(db, project_id=project_id, user_id=user_id)
    analysis = get_latest_analysis_for_project(db, project_id)
    if not analysis.result_json:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Hasil analisis belum tersedia.",
        )
    return analysis, dict(analysis.result_json)


def _with_item_ids(items: list[dict[str, Any]], prefix: str) -> list[dict[str, Any]]:
    return [
        {
            **item,
            "id": item.get("id") or f"{prefix}-{index + 1}",
        }
        for index, item in enumerate(items)
    ]


@router.get("/overview")
def get_overview_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    _, result = _latest_result(db, project_id, current_user.id)
    return dict(result.get("overview") or {})


@router.get("/checklist")
def get_finding_checklist_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    _, result = _latest_result(db, project_id, current_user.id)
    return _with_item_ids(list(result.get("revision_items") or []), "fix")


@router.get("/revision-checklist")
def get_official_revision_checklist_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    _, result = _latest_result(db, project_id, current_user.id)
    return _with_item_ids(list(result.get("official_revision_items") or []), "official-rev")


@router.patch("/checklist/{item_id}")
def update_revision_checklist_status(
    project_id: UUID,
    item_id: str,
    payload: ChecklistStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return _update_checklist_item_status(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        item_id=item_id,
        payload=payload,
        result_key="revision_items",
        id_prefix="fix",
    )


@router.patch("/revision-checklist/{item_id}")
def update_official_revision_checklist_status(
    project_id: UUID,
    item_id: str,
    payload: ChecklistStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return _update_checklist_item_status(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        item_id=item_id,
        payload=payload,
        result_key="official_revision_items",
        id_prefix="official-rev",
    )


def _update_checklist_item_status(
    *,
    db: Session,
    project_id: UUID,
    user_id: UUID,
    item_id: str,
    payload: ChecklistStatusUpdate,
    result_key: str,
    id_prefix: str,
) -> dict[str, Any]:
    analysis, result = _latest_result(db, project_id, user_id)
    items = list(result.get(result_key) or [])

    matched_index: int | None = None
    for index, item in enumerate(items):
        generated_id = str(item.get("id") or f"{id_prefix}-{index + 1}")
        if generated_id == item_id:
            matched_index = index
            break

    if matched_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item checklist tidak ditemukan.",
        )

    items[matched_index]["status"] = payload.status
    result[result_key] = items
    analysis.result_json = result
    flag_modified(analysis, "result_json")
    db.commit()
    db.refresh(analysis)

    updated = dict(items[matched_index])
    updated["id"] = updated.get("id") or item_id
    return updated


@router.get("/slide-consistency")
def get_slide_consistency_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    _, result = _latest_result(db, project_id, current_user.id)
    return _with_item_ids(list(result.get("slide_checks") or []), "slide")


@router.get("/problematic-claims")
def get_problematic_claims_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    _, result = _latest_result(db, project_id, current_user.id)
    return _with_item_ids(list(result.get("problematic_claims") or []), "claim")


@router.get("/defense-questions")
def get_defense_questions_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    _, result = _latest_result(db, project_id, current_user.id)
    return _with_item_ids(list(result.get("defense_questions") or []), "q")


@router.get("/presentation-script")
def get_presentation_script_result(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    _, result = _latest_result(db, project_id, current_user.id)
    return _with_item_ids(list(result.get("presentation_scripts") or []), "script")
