"""Initial token seeding for all 19 Superchain networks."""
from typing import List, Dict, Any

# ============================================
# BASE TOKENS
# ============================================
BASE_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "symbol": "USDC", "name": "USD Coin", "decimals": 6},
    {"address": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", "symbol": "USDT", "name": "Tether USD", "decimals": 6},
    {"address": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", "symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18},
    {"address": "0x940181a94A35A4569E4529A3CDfB74e38FD98631", "symbol": "AERO", "name": "Aerodrome Finance", "decimals": 18},
    {"address": "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", "symbol": "cbETH", "name": "Coinbase Wrapped Staked ETH", "decimals": 18},
    {"address": "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", "symbol": "wstETH", "name": "Wrapped liquid staked Ether 2.0", "decimals": 18},
    {"address": "0x532f27101965dd16442E59d40670FaF5eBB142E4", "symbol": "BRETT", "name": "Brett", "decimals": 18},
    {"address": "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", "symbol": "TOSHI", "name": "Toshi", "decimals": 18},
    {"address": "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", "symbol": "DEGEN", "name": "Degen", "decimals": 18},
    {"address": "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", "symbol": "cbBTC", "name": "Coinbase Wrapped BTC", "decimals": 8},
]

# ============================================
# OPTIMISM TOKENS
# ============================================
OPTIMISM_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0x4200000000000000000000000000000000000042", "symbol": "OP", "name": "Optimism", "decimals": 18},
    {"address": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", "symbol": "USDC", "name": "USD Coin", "decimals": 6},
    {"address": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", "symbol": "USDT", "name": "Tether USD", "decimals": 6},
    {"address": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", "symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18},
    {"address": "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db", "symbol": "VELO", "name": "Velodrome Finance", "decimals": 18},
    {"address": "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", "symbol": "wstETH", "name": "Wrapped liquid staked Ether 2.0", "decimals": 18},
    {"address": "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4", "symbol": "SNX", "name": "Synthetix Network Token", "decimals": 18},
    {"address": "0x68f180fcCe6836688e9084f035309E29Bf0A2095", "symbol": "WBTC", "name": "Wrapped BTC", "decimals": 8},
    {"address": "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", "symbol": "LINK", "name": "ChainLink Token", "decimals": 18},
]

# ============================================
# UNICHAIN TOKENS
# ============================================
UNICHAIN_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# WORLD CHAIN TOKENS
# ============================================
WORLD_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", "symbol": "WLD", "name": "Worldcoin", "decimals": 18},
]

# ============================================
# INK TOKENS
# ============================================
INK_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# SONEIUM TOKENS
# ============================================
SONEIUM_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# MODE TOKENS
# ============================================
MODE_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0xDfc7C877a950e49D2610114102175A06C2e3167a", "symbol": "MODE", "name": "Mode", "decimals": 18},
    {"address": "0xd988097fb8612cc24eeC14542bC03424c656005f", "symbol": "USDC", "name": "USD Coin", "decimals": 6},
]

# ============================================
# ZORA TOKENS
# ============================================
ZORA_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# LISK TOKENS
# ============================================
LISK_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0xac485391EB2d7D88253a7F1eF18C37f4f0D7E1c7", "symbol": "LSK", "name": "Lisk", "decimals": 18},
]

# ============================================
# BOB TOKENS
# ============================================
BOB_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0xe75D0fB2C24A55cA1e3F96781a2bCC7bdba058F0", "symbol": "USDC", "name": "USD Coin", "decimals": 6},
]

# ============================================
# SWELL TOKENS
# ============================================
SWELL_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
    {"address": "0x0a6E7Ba5042B38349e437ec6Db6214AEC7B35676", "symbol": "SWELL", "name": "Swell", "decimals": 18},
]

# ============================================
# MINT TOKENS
# ============================================
MINT_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# SHAPE TOKENS
# ============================================
SHAPE_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# OTHER CHAINS (Minimal seed)
# ============================================
METAL_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

POLYNOMIAL_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

SUPERSEED_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

RACE_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

ARENA_Z_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

EPIC_TOKENS: List[Dict[str, Any]] = [
    {"address": "0x4200000000000000000000000000000000000006", "symbol": "WETH", "name": "Wrapped Ether", "decimals": 18},
]

# ============================================
# ALL SEED TOKENS BY CHAIN
# ============================================
SEED_TOKENS: Dict[str, List[Dict[str, Any]]] = {
    "base": BASE_TOKENS,
    "optimism": OPTIMISM_TOKENS,
    "unichain": UNICHAIN_TOKENS,
    "world": WORLD_TOKENS,
    "ink": INK_TOKENS,
    "soneium": SONEIUM_TOKENS,
    "mode": MODE_TOKENS,
    "zora": ZORA_TOKENS,
    "lisk": LISK_TOKENS,
    "bob": BOB_TOKENS,
    "swell": SWELL_TOKENS,
    "mint": MINT_TOKENS,
    "shape": SHAPE_TOKENS,
    "metal": METAL_TOKENS,
    "polynomial": POLYNOMIAL_TOKENS,
    "superseed": SUPERSEED_TOKENS,
    "race": RACE_TOKENS,
    "arena_z": ARENA_Z_TOKENS,
    "epic": EPIC_TOKENS,
}


def get_seed_tokens(chain_slug: str) -> List[Dict[str, Any]]:
    """Get seed tokens for a specific chain."""
    return SEED_TOKENS.get(chain_slug.lower(), [])


def get_all_seed_tokens() -> Dict[str, List[Dict[str, Any]]]:
    """Get all seed tokens for all chains."""
    return SEED_TOKENS


def get_total_seed_token_count() -> int:
    """Get total number of seed tokens across all chains."""
    return sum(len(tokens) for tokens in SEED_TOKENS.values())


async def seed_database(db_session) -> Dict[str, int]:
    """Seed the database with initial tokens.
    
    Args:
        db_session: SQLAlchemy database session
        
    Returns:
        Dict with count of tokens added per chain
    """
    from app.models import Token, Chain
    from app.services.token_service import create_or_update_token
    
    results = {}
    
    for chain_slug, tokens in SEED_TOKENS.items():
        chain = db_session.query(Chain).filter(Chain.slug == chain_slug).first()
        if not chain:
            print(f"Chain {chain_slug} not found in database, skipping...")
            continue
        
        count = 0
        for token_data in tokens:
            try:
                token = create_or_update_token(db_session, {
                    "chain_id": chain.id,
                    "address": token_data["address"],
                    "symbol": token_data["symbol"],
                    "name": token_data["name"],
                    "decimals": token_data["decimals"],
                    "is_verified": True,
                })
                count += 1
            except Exception as e:
                print(f"Error seeding token {token_data['symbol']}: {e}")
        
        results[chain_slug] = count
        print(f"Seeded {count} tokens for {chain_slug}")
    
    return results
