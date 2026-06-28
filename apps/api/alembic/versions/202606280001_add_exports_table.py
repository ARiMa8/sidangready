"""add exports table

Revision ID: 202606280001
Revises: 202606220002
Create Date: 2026-06-28
"""
from alembic import op
import sqlalchemy as sa

revision = "202606280001"
down_revision = "202606220002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "exports",
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("export_type", sa.String(length=30), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_mime_type", sa.String(length=120), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("r2_object_key", sa.String(length=600), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_exports_project_id"), "exports", ["project_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_exports_project_id"), table_name="exports")
    op.drop_table("exports")
