"""Initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create chains table
    op.create_table(
        'chains',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('chain_id', sa.Integer(), nullable=False),
        sa.Column('rpc_url', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chains_id'), 'chains', ['id'], unique=False)
    op.create_index(op.f('ix_chains_name'), 'chains', ['name'], unique=True)
    op.create_index(op.f('ix_chains_slug'), 'chains', ['slug'], unique=True)
    op.create_index(op.f('ix_chains_chain_id'), 'chains', ['chain_id'], unique=True)
    
    # Create tokens table
    op.create_table(
        'tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chain_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('symbol', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('decimals', sa.Integer(), nullable=False, server_default='18'),
        sa.Column('created_at_on_chain', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deployer', sa.String(), nullable=True),
        sa.Column('block_number', sa.Integer(), nullable=True),
        sa.Column('transaction_hash', sa.String(), nullable=True),
        sa.Column('total_supply', sa.String(), nullable=True),
        sa.Column('has_liquidity', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('v2_pools', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('v3_pools', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('liquidity_usd', sa.Float(), nullable=True),
        sa.Column('price_usd', sa.Float(), nullable=True),
        sa.Column('volume_24h', sa.Float(), nullable=True),
        sa.Column('market_cap', sa.Float(), nullable=True),
        sa.Column('safety_score', sa.Integer(), nullable=True),
        sa.Column('risk_level', sa.String(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_trending', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_honeypot', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_blacklist', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('has_mint_function', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('max_tx_amount', sa.String(), nullable=True),
        sa.Column('buy_tax_percent', sa.Float(), nullable=True),
        sa.Column('sell_tax_percent', sa.Float(), nullable=True),
        sa.Column('holder_count', sa.Integer(), nullable=True),
        sa.Column('top_holders_percent', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['chain_id'], ['chains.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tokens_id'), 'tokens', ['id'], unique=False)
    op.create_index(op.f('ix_tokens_chain_id'), 'tokens', ['chain_id'], unique=False)
    op.create_index(op.f('ix_tokens_address'), 'tokens', ['address'], unique=False)
    op.create_index(op.f('ix_tokens_symbol'), 'tokens', ['symbol'], unique=False)
    op.create_index(op.f('ix_tokens_deployer'), 'tokens', ['deployer'], unique=False)
    op.create_index(op.f('ix_tokens_has_liquidity'), 'tokens', ['has_liquidity'], unique=False)
    op.create_index(op.f('ix_tokens_price_usd'), 'tokens', ['price_usd'], unique=False)
    op.create_index(op.f('ix_tokens_volume_24h'), 'tokens', ['volume_24h'], unique=False)
    op.create_index(op.f('ix_tokens_safety_score'), 'tokens', ['safety_score'], unique=False)
    op.create_index(op.f('ix_tokens_risk_level'), 'tokens', ['risk_level'], unique=False)
    op.create_index(op.f('ix_tokens_is_verified'), 'tokens', ['is_verified'], unique=False)
    op.create_index(op.f('ix_tokens_is_trending'), 'tokens', ['is_trending'], unique=False)
    
    # Create unique constraint: address must be unique per chain
    op.create_unique_constraint('uq_token_chain_address', 'tokens', ['chain_id', 'address'])
    
    # Create token_prices table
    op.create_table(
        'token_prices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('price_usd', sa.Float(), nullable=False),
        sa.Column('volume_24h', sa.Float(), nullable=True),
        sa.Column('tvl', sa.Float(), nullable=True),
        sa.Column('market_cap', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['token_id'], ['tokens.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_token_prices_id'), 'token_prices', ['id'], unique=False)
    op.create_index(op.f('ix_token_prices_token_id'), 'token_prices', ['token_id'], unique=False)
    op.create_index(op.f('ix_token_prices_timestamp'), 'token_prices', ['timestamp'], unique=False)
    op.create_index('idx_token_price_timestamp', 'token_prices', ['token_id', 'timestamp'], unique=False)
    
    # Create token_groups table
    op.create_table(
        'token_groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('canonical_address', sa.String(), nullable=True),
        sa.Column('canonical_symbol', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_token_groups_id'), 'token_groups', ['id'], unique=False)
    op.create_index(op.f('ix_token_groups_canonical_address'), 'token_groups', ['canonical_address'], unique=False)
    op.create_index(op.f('ix_token_groups_canonical_symbol'), 'token_groups', ['canonical_symbol'], unique=False)
    
    # Create token_group_members table
    op.create_table(
        'token_group_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('token_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['token_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['token_id'], ['tokens.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'token_id', name='uq_group_token')
    )
    op.create_index(op.f('ix_token_group_members_id'), 'token_group_members', ['id'], unique=False)
    op.create_index(op.f('ix_token_group_members_group_id'), 'token_group_members', ['group_id'], unique=False)
    op.create_index(op.f('ix_token_group_members_token_id'), 'token_group_members', ['token_id'], unique=False)


def downgrade() -> None:
    op.drop_table('token_group_members')
    op.drop_table('token_groups')
    op.drop_table('token_prices')
    op.drop_table('tokens')
    op.drop_table('chains')
