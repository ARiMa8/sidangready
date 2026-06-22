"""add analysis queue fields

Revision ID: 202606220002
Revises: 202606220001
Create Date: 2026-06-22
"""
from alembic import op
import sqlalchemy as sa

revision = "202606220002"
down_revision = "202606220001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("analyses", sa.Column("queue_job_id", sa.String(length=160), nullable=True))
    op.add_column(
        "analyses",
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "analyses",
        sa.Column("max_retries", sa.Integer(), nullable=False, server_default="1"),
    )
    op.alter_column("analyses", "retry_count", server_default=None)
    op.alter_column("analyses", "max_retries", server_default=None)


def downgrade() -> None:
    op.drop_column("analyses", "max_retries")
    op.drop_column("analyses", "retry_count")
    op.drop_column("analyses", "queue_job_id")
