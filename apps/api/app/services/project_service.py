from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def list_projects_for_user(
    db: Session,
    user_id: UUID,
    skip: int,
    limit: int,
) -> list[Project]:
    statement = (
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(statement).scalars().all())


def get_project_for_user(db: Session, project_id: UUID, user_id: UUID) -> Project:
    statement = select(Project).where(
        Project.id == project_id,
        Project.user_id == user_id,
    )
    project = db.execute(statement).scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyek tidak ditemukan.",
        )
    return project


def create_project(db: Session, user_id: UUID, payload: ProjectCreate) -> Project:
    project = Project(user_id=user_id, **payload.model_dump())
    db.add(project)
    return project


def update_project(
    db: Session,
    project: Project,
    payload: ProjectUpdate,
) -> Project:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    db.add(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
