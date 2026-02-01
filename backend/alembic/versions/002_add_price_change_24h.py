"""Add price_change_24h column to tokens table

Revision ID: 002_add_price_change
Revises: 001_initial_schema
Create Date: 2026-01-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_add_price_change'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add price_change_24h column to tokens table."""
    op.add_column('tokens', sa.Column('price_change_24h', sa.Float(), nullable=True))


def downgrade() -> None:
    """Remove price_change_24h column from tokens table."""
    op.drop_column('tokens', 'price_change_24h')
