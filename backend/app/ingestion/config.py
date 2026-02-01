"""Ingestion configuration for all 19 Superchain networks."""
from app.config import settings
from typing import Dict, Optional, Any


# WETH addresses for OP Stack chains (standard address)
OP_STACK_WETH = "0x4200000000000000000000000000000000000006"

# Standard Uniswap V3 Factory (deployed on most chains)
UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984"

# ============================================
# SUPERCHAIN CONFIGURATION (19 Eligible Chains)
# ============================================
# Source: https://atlas.optimism.io/
# All chains eligible for Optimism grants

CHAIN_CONFIGS: Dict[str, Dict[str, Any]] = {
    # ============================================
    # PRIMARY CHAINS (High Priority)
    # ============================================
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
        "priority": 1,
        "tvl_rank": 1,
        "dex": {
            "uniswap_v2_factory": "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
            "uniswap_v3_factory": "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
            "aerodrome_factory": "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
        },
    },
    "optimism": {
        "name": "OP Mainnet",
        "slug": "optimism",
        "chain_id": 10,
        "rpc_url": settings.chain_optimism_rpc_url,
        "coingecko_platform": "optimistic-ethereum",
        "explorer_url": "https://optimistic.etherscan.io",
        "explorer_api": "https://api-optimistic.etherscan.io/api",
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 1,
        "tvl_rank": 2,
        "dex": {
            "uniswap_v2_factory": "0x31F63A33141fFee63D4B26755430a390ACdD8a4d",
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
            "velodrome_factory": "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746",
        },
    },
    
    # ============================================
    # TIER 2 CHAINS (Growing Ecosystems)
    # ============================================
    "unichain": {
        "name": "Unichain",
        "slug": "unichain",
        "chain_id": 130,
        "rpc_url": settings.chain_unichain_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://uniscan.xyz",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 2,
        "tvl_rank": 3,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "world": {
        "name": "World Chain",
        "slug": "world",
        "chain_id": 480,
        "rpc_url": settings.chain_world_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://worldscan.org",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 2,
        "tvl_rank": 4,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "ink": {
        "name": "Ink",
        "slug": "ink",
        "chain_id": 57073,
        "rpc_url": settings.chain_ink_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.inkonchain.com",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 2,
        "tvl_rank": 5,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "soneium": {
        "name": "Soneium",
        "slug": "soneium",
        "chain_id": 1868,
        "rpc_url": settings.chain_soneium_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://soneium.blockscout.com",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 2,
        "tvl_rank": 6,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
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
        "is_active": True,
        "priority": 2,
        "tvl_rank": 7,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
            "kim_factory": "0xC33Ce0058004d44E7e1F366E5797A578fDF38584",
        },
    },
    
    # ============================================
    # TIER 3 CHAINS (Emerging)
    # ============================================
    "zora": {
        "name": "Zora",
        "slug": "zora",
        "chain_id": 7777777,
        "rpc_url": settings.chain_zora_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.zora.energy",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 3,
        "tvl_rank": 8,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "lisk": {
        "name": "Lisk",
        "slug": "lisk",
        "chain_id": 1135,
        "rpc_url": settings.chain_lisk_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://blockscout.lisk.com",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 3,
        "tvl_rank": 9,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "bob": {
        "name": "BOB",
        "slug": "bob",
        "chain_id": 60808,
        "rpc_url": settings.chain_bob_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.gobob.xyz",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 3,
        "tvl_rank": 10,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "swell": {
        "name": "Swell",
        "slug": "swell",
        "chain_id": 1923,
        "rpc_url": settings.chain_swell_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.swellnetwork.io",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 3,
        "tvl_rank": 11,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "mint": {
        "name": "Mint",
        "slug": "mint",
        "chain_id": 185,
        "rpc_url": settings.chain_mint_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.mintchain.io",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 3,
        "tvl_rank": 12,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    "shape": {
        "name": "Shape",
        "slug": "shape",
        "chain_id": 360,
        "rpc_url": settings.chain_shape_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://shapescan.xyz",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 3,
        "tvl_rank": 13,
        "dex": {
            "uniswap_v3_factory": UNISWAP_V3_FACTORY,
        },
    },
    
    # ============================================
    # TIER 4 CHAINS (New/Specialized)
    # ============================================
    "metal": {
        "name": "Metal L2",
        "slug": "metal",
        "chain_id": 1750,
        "rpc_url": settings.chain_metal_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.metall2.com",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 4,
        "tvl_rank": 14,
        "dex": {},
    },
    "polynomial": {
        "name": "Polynomial",
        "slug": "polynomial",
        "chain_id": 8008,
        "rpc_url": settings.chain_polynomial_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://polynomialscan.io",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 4,
        "tvl_rank": 15,
        "dex": {},
    },
    "superseed": {
        "name": "Superseed",
        "slug": "superseed",
        "chain_id": 5330,
        "rpc_url": settings.chain_superseed_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.superseed.xyz",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 4,
        "tvl_rank": 16,
        "dex": {},
    },
    "race": {
        "name": "RACE",
        "slug": "race",
        "chain_id": 6805,
        "rpc_url": settings.chain_race_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://racescan.io",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 4,
        "tvl_rank": 17,
        "dex": {},
    },
    "arena_z": {
        "name": "Arena-Z",
        "slug": "arena_z",
        "chain_id": 7897,
        "rpc_url": settings.chain_arena_z_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://explorer.arena-z.gg",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 4,
        "tvl_rank": 18,
        "dex": {},
    },
    "epic": {
        "name": "Epic (Ethernity)",
        "slug": "epic",
        "chain_id": 183,
        "rpc_url": settings.chain_epic_rpc_url,
        "coingecko_platform": None,
        "explorer_url": "https://ernscan.io",
        "explorer_api": None,
        "weth_address": OP_STACK_WETH,
        "is_active": True,
        "priority": 4,
        "tvl_rank": 19,
        "dex": {},
    },
}

# ============================================
# STABLECOIN ADDRESSES
# ============================================
STABLECOINS = {
    "USDC": {
        "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "optimism": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        "unichain": None,
        "world": None,
        "ink": None,
        "soneium": None,
        "mode": "0xd988097fb8612cc24eeC14542bC03424c656005f",
        "zora": None,
        "lisk": None,
        "bob": "0xe75D0fB2C24A55cA1e3F96781a2bCC7bdba058F0",
        "swell": None,
    },
    "USDT": {
        "base": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
        "optimism": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        "mode": "0xf0F161fDA2712DB8b566946122a5af183995e2eD",
    },
    "DAI": {
        "base": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        "optimism": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    },
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_chain_config(slug: str) -> Optional[Dict[str, Any]]:
    """Get chain configuration by slug."""
    return CHAIN_CONFIGS.get(slug.lower())


def get_active_chains() -> Dict[str, Dict[str, Any]]:
    """Get only active chains."""
    return {k: v for k, v in CHAIN_CONFIGS.items() if v.get("is_active", False)}


def get_chains_by_priority(priority: int) -> Dict[str, Dict[str, Any]]:
    """Get chains by priority level (1=highest)."""
    return {k: v for k, v in CHAIN_CONFIGS.items() 
            if v.get("is_active", False) and v.get("priority") == priority}


def get_dex_factory(chain_slug: str, dex_type: str) -> Optional[str]:
    """Get DEX factory address for a chain."""
    config = get_chain_config(chain_slug)
    if config and "dex" in config:
        return config["dex"].get(dex_type)
    return None


def get_all_chain_ids() -> Dict[str, int]:
    """Get mapping of chain slugs to chain IDs."""
    return {slug: config["chain_id"] for slug, config in CHAIN_CONFIGS.items()}


def get_chain_by_id(chain_id: int) -> Optional[Dict[str, Any]]:
    """Get chain configuration by chain ID."""
    for config in CHAIN_CONFIGS.values():
        if config["chain_id"] == chain_id:
            return config
    return None


def get_superchain_stats() -> Dict[str, Any]:
    """Get statistics about supported Superchain networks."""
    active = get_active_chains()
    return {
        "total_chains": len(CHAIN_CONFIGS),
        "active_chains": len(active),
        "tier_1_chains": len(get_chains_by_priority(1)),
        "tier_2_chains": len(get_chains_by_priority(2)),
        "tier_3_chains": len(get_chains_by_priority(3)),
        "tier_4_chains": len(get_chains_by_priority(4)),
    }
