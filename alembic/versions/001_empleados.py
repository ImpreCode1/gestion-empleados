"""initial migration: empleados table

Revision ID: 001
Revises:
Create Date: 2026-08-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "empleados",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nombre_completo", sa.String(255), nullable=False),
        sa.Column("departamento", sa.String(150), nullable=False),
        sa.Column("cargo", sa.String(150), nullable=False),
        sa.Column("fecha_contratacion", sa.Date(), nullable=False),
        sa.Column("genero", sa.String(1), nullable=True),
        sa.Column("celular", sa.String(20), nullable=True),
        sa.Column("fecha_nacimiento", sa.Date(), nullable=False),
        sa.Column("correo", sa.String(255), nullable=False),
        sa.Column("hydra_user_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("correo"),
    )


def downgrade() -> None:
    op.drop_table("empleados")
