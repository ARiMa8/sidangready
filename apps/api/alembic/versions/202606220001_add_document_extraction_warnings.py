"""add document extraction warnings

Revision ID: 202606220001
Revises: 202606210001
Create Date: 2026-06-22
"""
from alembic import op
import sqlalchemy as sa

revision = "202606220001"
down_revision = "202606210001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("documents", sa.Column("extraction_warning", sa.Text(), nullable=True))
    op.add_column(
        "documents",
        sa.Column("extraction_error_message", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("documents", "extraction_error_message")
    op.drop_column("documents", "extraction_warning")
