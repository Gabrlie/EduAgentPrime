"""create users table

Revision ID: 0d3f7f1c9a01
Revises:
Create Date: 2026-02-15 14:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "0d3f7f1c9a01"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    table_names = set(inspector.get_table_names())

    if "users" not in table_names:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("username", sa.String(length=50), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
        op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
        return

    existing_columns = {col["name"] for col in inspector.get_columns("users")}
    if "id" not in existing_columns:
        op.add_column("users", sa.Column("id", sa.Integer(), nullable=False))
    if "username" not in existing_columns:
        op.add_column("users", sa.Column("username", sa.String(length=50), nullable=False))
    if "hashed_password" not in existing_columns:
        op.add_column("users", sa.Column("hashed_password", sa.String(length=255), nullable=False))
    if "created_at" not in existing_columns:
        op.add_column("users", sa.Column("created_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    table_names = set(inspector.get_table_names())

    if "users" in table_names:
        op.drop_index(op.f("ix_users_username"), table_name="users")
        op.drop_index(op.f("ix_users_id"), table_name="users")
        op.drop_table("users")
