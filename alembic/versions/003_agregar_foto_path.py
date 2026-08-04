"""add foto_path column to empleados

Revision ID: 003
Revises: 002
Create Date: 2026-08-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("empleados", sa.Column("foto_path", sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column("empleados", "foto_path")
