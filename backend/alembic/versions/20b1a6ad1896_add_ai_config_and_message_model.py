"""add ai config and message model

Revision ID: 20b1a6ad1896
Revises: 0d3f7f1c9a01
Create Date: 2026-01-29 14:35:19.325661

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '20b1a6ad1896'
down_revision: Union[str, Sequence[str], None] = '0d3f7f1c9a01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    table_names = set(inspector.get_table_names())

    if 'messages' not in table_names:
        op.create_table(
            'messages',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('role', sa.String(length=20), nullable=False),
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id']),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_messages_id'), 'messages', ['id'], unique=False)

    if 'users' in table_names:
        existing_columns = {col['name'] for col in inspector.get_columns('users')}
        if 'ai_api_key' not in existing_columns:
            op.add_column('users', sa.Column('ai_api_key', sa.String(length=255), nullable=True))
        if 'ai_base_url' not in existing_columns:
            op.add_column('users', sa.Column('ai_base_url', sa.String(length=255), nullable=True))
        if 'ai_model_name' not in existing_columns:
            op.add_column('users', sa.Column('ai_model_name', sa.String(length=100), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    table_names = set(inspector.get_table_names())

    if 'users' in table_names:
        existing_columns = {col['name'] for col in inspector.get_columns('users')}
        if 'ai_model_name' in existing_columns:
            op.drop_column('users', 'ai_model_name')
        if 'ai_base_url' in existing_columns:
            op.drop_column('users', 'ai_base_url')
        if 'ai_api_key' in existing_columns:
            op.drop_column('users', 'ai_api_key')

    if 'messages' in table_names:
        op.drop_index(op.f('ix_messages_id'), table_name='messages')
        op.drop_table('messages')
