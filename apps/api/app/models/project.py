from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    thesis_title: Mapped[str] = mapped_column(String(300), nullable=False)
    student_name: Mapped[str] = mapped_column(String(120), nullable=False)
    university: Mapped[str] = mapped_column(String(180), nullable=False)
    major: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_presentation_minutes: Mapped[int] = mapped_column(
        Integer,
        default=10,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(40), default="draft", nullable=False)
    readiness_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user = relationship("User", back_populates="projects")
    documents = relationship(
        "Document",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    analyses = relationship(
        "Analysis",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    exports = relationship(
        "Export",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
