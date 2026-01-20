"""Ingestion configuration."""
from app.config import settings
from typing import Dict, Optional


# Chain configuration
CHAIN_CONFIGS: Dict[str, Dict[str, any]] = {
    "base": {
        "name": "Base",
        "slug": "base",
        "chain_id": 8453,
        "rpc_url": settings.chain_base_rpc_url,
        "coingecko_platform": "base",
    },
    "optimism": {
        "name": "Optimism",
        "slug": "optimism",
        "chain_id": 10,
        "rpc_url": settings.chain_optimism_rpc_url,
        "coingecko_platform": "optimistic-ethereum",
    },
    "mode": {
        "name": "Mode",
        "slug": "mode",
        "chain_id": 34443,
        "rpc_url": settings.chain_mode_rpc_url,
        "coingecko_platform": None,  # May not be supported
    },
    "zora": {
        "name": "Zora",
        "slug": "zora",
        "chain_id": 7777777,
        "rpc_url": settings.chain_zora_rpc_url,
        "coingecko_platform": None,  # May not be supported
    },
}


def get_chain_config(slug: str) -> Optional[Dict[str, any]]:
    """Get chain configuration by slug."""
    return CHAIN_CONFIGS.get(slug.lower())
