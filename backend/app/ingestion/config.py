"""Ingestion configuration."""
from app.config import settings
from typing import Dict, Optional, Any


# WETH addresses for OP Stack chains (standard address)
OP_STACK_WETH = "0x4200000000000000000000000000000000000006"

# Chain configuration with DEX factory addresses
CHAIN_CONFIGS: Dict[str, Dict[str, Any]] = {
    "base": {
        "name": "Base",
        "slug": "base",
        "chain_id": 8453,
        "rpc_url": settings.chain_base_rpc_url,
        "coingecko_platform": "base",
        "explorer_url": "https://basescan.org",
        "explorer_api": "https://api.basescan.org/api",
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        # DEX Factory Addresses
        "dex": {
            "uniswap_v2_factory": "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
            "uniswap_v3_factory": "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
            "aerodrome_factory": "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
        },
    },
    "optimism": {
        "name": "Optimism",
        "slug": "optimism",
        "chain_id": 10,
        "rpc_url": settings.chain_optimism_rpc_url,
        "coingecko_platform": "optimistic-ethereum",
        "explorer_url": "https://optimistic.etherscan.io",
        "explorer_api": "https://api-optimistic.etherscan.io/api",
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        # DEX Factory Addresses
        "dex": {
            "uniswap_v2_factory": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "uniswap_v3_factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            "velodrome_factory": "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746",
        },
    },
    "ink": {
        "name": "Ink",
        "slug": "ink",
        "chain_id": 57073,
        "rpc_url": settings.chain_ink_rpc_url,
        "coingecko_platform": None,  # Not yet supported on CoinGecko
        "explorer_url": "https://explorer.inkonchain.com",
        "explorer_api": None,  # Uses Blockscout
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        # DEX Factory Addresses (Ink uses Uniswap V3 compatible DEXs)
        "dex": {
            "uniswap_v2_factory": None,  # Check if available
            "uniswap_v3_factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            "inkswap_factory": None,  # To be added when available
        },
    },
    "mode": {
        "name": "Mode",
        "slug": "mode",
        "chain_id": 34443,
        "rpc_url": settings.chain_mode_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.mode.network",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": False,  # Disabled for now
        "dex": {
            "uniswap_v2_factory": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "uniswap_v3_factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        },
    },
    "zora": {
        "name": "Zora",
        "slug": "zora",
        "chain_id": 7777777,
        "rpc_url": settings.chain_zora_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.zora.energy",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": False,  # Disabled for now
        "dex": {
            "uniswap_v2_factory": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "uniswap_v3_factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        },
    },
}

# Stablecoin addresses for price reference (common across chains)
STABLECOINS = {
    "USDC": {
        "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "optimism": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        "ink": None,  # To be added
    },
    "USDT": {
        "base": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
        "optimism": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        "ink": None,
    },
    "DAI": {
        "base": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        "optimism": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        "ink": None,
    },
}


def get_chain_config(slug: str) -> Optional[Dict[str, Any]]:
    """Get chain configuration by slug."""
    return CHAIN_CONFIGS.get(slug.lower())


def get_active_chains() -> Dict[str, Dict[str, Any]]:
    """Get only active chains."""
    return {k: v for k, v in CHAIN_CONFIGS.items() if v.get("is_active", False)}


def get_dex_factory(chain_slug: str, dex_type: str) -> Optional[str]:
    """Get DEX factory address for a chain."""
    config = get_chain_config(chain_slug)
    if config and "dex" in config:
        return config["dex"].get(dex_type)
    return None
