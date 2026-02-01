-- =============================================
-- SUPERCHAIN TOKEN EXPLORER - DATABASE SCHEMA
-- =============================================
-- Run this SQL in Supabase SQL Editor
-- https://supabase.com/dashboard/project/eooivtjowlmthckwujph/sql/new

-- 1. CHAINS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chains (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR NOT NULL,
    chain_id INTEGER NOT NULL,
    rpc_url VARCHAR,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_chains_name ON chains(name);
CREATE UNIQUE INDEX IF NOT EXISTS ix_chains_slug ON chains(slug);
CREATE UNIQUE INDEX IF NOT EXISTS ix_chains_chain_id ON chains(chain_id);

-- 2. TOKENS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL REFERENCES chains(id),
    address VARCHAR NOT NULL,
    symbol VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    decimals INTEGER NOT NULL DEFAULT 18,
    created_at_on_chain TIMESTAMPTZ,
    deployer VARCHAR,
    block_number INTEGER,
    transaction_hash VARCHAR,
    total_supply VARCHAR,
    has_liquidity BOOLEAN NOT NULL DEFAULT false,
    v2_pools TEXT[],
    v3_pools TEXT[],
    liquidity_usd FLOAT,
    price_usd FLOAT,
    price_change_24h FLOAT,
    volume_24h FLOAT,
    market_cap FLOAT,
    safety_score INTEGER,
    risk_level VARCHAR,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_trending BOOLEAN NOT NULL DEFAULT false,
    is_honeypot BOOLEAN NOT NULL DEFAULT false,
    has_blacklist BOOLEAN NOT NULL DEFAULT false,
    has_mint_function BOOLEAN NOT NULL DEFAULT false,
    max_tx_amount VARCHAR,
    buy_tax_percent FLOAT,
    sell_tax_percent FLOAT,
    holder_count INTEGER,
    top_holders_percent FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_token_chain_address UNIQUE (chain_id, address)
);

CREATE INDEX IF NOT EXISTS ix_tokens_chain_id ON tokens(chain_id);
CREATE INDEX IF NOT EXISTS ix_tokens_address ON tokens(address);
CREATE INDEX IF NOT EXISTS ix_tokens_symbol ON tokens(symbol);
CREATE INDEX IF NOT EXISTS ix_tokens_deployer ON tokens(deployer);
CREATE INDEX IF NOT EXISTS ix_tokens_has_liquidity ON tokens(has_liquidity);
CREATE INDEX IF NOT EXISTS ix_tokens_price_usd ON tokens(price_usd);
CREATE INDEX IF NOT EXISTS ix_tokens_volume_24h ON tokens(volume_24h);
CREATE INDEX IF NOT EXISTS ix_tokens_safety_score ON tokens(safety_score);
CREATE INDEX IF NOT EXISTS ix_tokens_risk_level ON tokens(risk_level);
CREATE INDEX IF NOT EXISTS ix_tokens_is_verified ON tokens(is_verified);
CREATE INDEX IF NOT EXISTS ix_tokens_is_trending ON tokens(is_trending);

-- 3. TOKEN PRICES TABLE (Price History)
-- =============================================
CREATE TABLE IF NOT EXISTS token_prices (
    id SERIAL PRIMARY KEY,
    token_id INTEGER NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    price_usd FLOAT NOT NULL,
    volume_24h FLOAT,
    tvl FLOAT,
    market_cap FLOAT
);

CREATE INDEX IF NOT EXISTS ix_token_prices_token_id ON token_prices(token_id);
CREATE INDEX IF NOT EXISTS ix_token_prices_timestamp ON token_prices(timestamp);
CREATE INDEX IF NOT EXISTS idx_token_price_timestamp ON token_prices(token_id, timestamp);

-- 4. TOKEN GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS token_groups (
    id SERIAL PRIMARY KEY,
    canonical_address VARCHAR,
    canonical_symbol VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_token_groups_canonical_address ON token_groups(canonical_address);
CREATE INDEX IF NOT EXISTS ix_token_groups_canonical_symbol ON token_groups(canonical_symbol);

-- 5. TOKEN GROUP MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS token_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES token_groups(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_group_token UNIQUE (group_id, token_id)
);

CREATE INDEX IF NOT EXISTS ix_token_group_members_group_id ON token_group_members(group_id);
CREATE INDEX IF NOT EXISTS ix_token_group_members_token_id ON token_group_members(token_id);

-- 6. ALEMBIC VERSION TABLE (for migrations)
-- =============================================
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Mark migrations as complete
INSERT INTO alembic_version (version_num) VALUES ('001_initial') ON CONFLICT DO NOTHING;
INSERT INTO alembic_version (version_num) VALUES ('002_add_price_change') ON CONFLICT DO NOTHING;

-- 7. INSERT INITIAL CHAINS
-- =============================================
INSERT INTO chains (name, slug, chain_id, rpc_url, is_active) VALUES
    ('Base', 'base', 8453, 'https://mainnet.base.org', true),
    ('Optimism', 'optimism', 10, 'https://mainnet.optimism.io', true),
    ('Ink', 'ink', 57073, 'https://rpc-gel.inkonchain.com', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! Your database is ready.
-- =============================================
