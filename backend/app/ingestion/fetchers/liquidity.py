"""Liquidity detection for DEX pools."""
from typing import Dict, Any, Optional, List, Tuple
from web3 import Web3
from decimal import Decimal
from app.ingestion.config import get_chain_config, get_dex_factory

# Uniswap V2 Pair ABI
UNISWAP_V2_PAIR_ABI = [
    {
        "constant": True,
        "inputs": [],
        "name": "token0",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "token1",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "getReserves",
        "outputs": [
            {"name": "_reserve0", "type": "uint112"},
            {"name": "_reserve1", "type": "uint112"},
            {"name": "_blockTimestampLast", "type": "uint32"}
        ],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]

# Uniswap V2 Factory ABI
UNISWAP_V2_FACTORY_ABI = [
    {
        "constant": True,
        "inputs": [
            {"name": "tokenA", "type": "address"},
            {"name": "tokenB", "type": "address"}
        ],
        "name": "getPair",
        "outputs": [{"name": "pair", "type": "address"}],
        "type": "function"
    }
]

# Uniswap V3 Pool ABI
UNISWAP_V3_POOL_ABI = [
    {
        "constant": True,
        "inputs": [],
        "name": "token0",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "token1",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "liquidity",
        "outputs": [{"name": "", "type": "uint128"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "slot0",
        "outputs": [
            {"name": "sqrtPriceX96", "type": "uint160"},
            {"name": "tick", "type": "int24"},
            {"name": "observationIndex", "type": "uint16"},
            {"name": "observationCardinality", "type": "uint16"},
            {"name": "observationCardinalityNext", "type": "uint16"},
            {"name": "feeProtocol", "type": "uint8"},
            {"name": "unlocked", "type": "bool"}
        ],
        "type": "function"
    }
]

# Uniswap V3 Factory ABI
UNISWAP_V3_FACTORY_ABI = [
    {
        "constant": True,
        "inputs": [
            {"name": "tokenA", "type": "address"},
            {"name": "tokenB", "type": "address"},
            {"name": "fee", "type": "uint24"}
        ],
        "name": "getPool",
        "outputs": [{"name": "pool", "type": "address"}],
        "type": "function"
    }
]

# Common fee tiers for V3
V3_FEE_TIERS = [100, 500, 3000, 10000]  # 0.01%, 0.05%, 0.3%, 1%

# Zero address
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


class LiquidityDetector:
    """Detect and analyze liquidity for tokens."""
    
    def __init__(self, chain_slug: str):
        """Initialize liquidity detector for a chain."""
        self.chain_slug = chain_slug
        self.config = get_chain_config(chain_slug)
        if not self.config:
            raise ValueError(f"Unknown chain: {chain_slug}")
        
        rpc_url = self.config.get("rpc_url")
        if not rpc_url:
            raise ValueError(f"No RPC URL configured for {chain_slug}")
        
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.weth_address = Web3.to_checksum_address(
            self.config.get("weth_address", ZERO_ADDRESS)
        )
    
    def check_v2_liquidity(
        self,
        token_address: str,
        quote_token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Check Uniswap V2 liquidity for a token."""
        factory_address = get_dex_factory(self.chain_slug, "uniswap_v2_factory")
        if not factory_address:
            return None
        
        if quote_token is None:
            quote_token = self.weth_address
        
        try:
            factory = self.w3.eth.contract(
                address=Web3.to_checksum_address(factory_address),
                abi=UNISWAP_V2_FACTORY_ABI
            )
            
            pair_address = factory.functions.getPair(
                Web3.to_checksum_address(token_address),
                Web3.to_checksum_address(quote_token)
            ).call()
            
            if pair_address == ZERO_ADDRESS:
                return None
            
            pair = self.w3.eth.contract(
                address=Web3.to_checksum_address(pair_address),
                abi=UNISWAP_V2_PAIR_ABI
            )
            
            reserves = pair.functions.getReserves().call()
            token0 = pair.functions.token0().call()
            
            # Determine which reserve is for our token
            if token0.lower() == token_address.lower():
                token_reserve = reserves[0]
                quote_reserve = reserves[1]
            else:
                token_reserve = reserves[1]
                quote_reserve = reserves[0]
            
            return {
                "pair_address": pair_address,
                "dex_type": "uniswap_v2",
                "token_reserve": token_reserve,
                "quote_reserve": quote_reserve,
                "has_liquidity": token_reserve > 0 and quote_reserve > 0
            }
        except Exception as e:
            print(f"Error checking V2 liquidity: {e}")
            return None
    
    def check_v3_liquidity(
        self,
        token_address: str,
        quote_token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Check Uniswap V3 liquidity for a token."""
        factory_address = get_dex_factory(self.chain_slug, "uniswap_v3_factory")
        if not factory_address:
            return None
        
        if quote_token is None:
            quote_token = self.weth_address
        
        try:
            factory = self.w3.eth.contract(
                address=Web3.to_checksum_address(factory_address),
                abi=UNISWAP_V3_FACTORY_ABI
            )
            
            # Check all fee tiers
            for fee in V3_FEE_TIERS:
                try:
                    pool_address = factory.functions.getPool(
                        Web3.to_checksum_address(token_address),
                        Web3.to_checksum_address(quote_token),
                        fee
                    ).call()
                    
                    if pool_address != ZERO_ADDRESS:
                        pool = self.w3.eth.contract(
                            address=Web3.to_checksum_address(pool_address),
                            abi=UNISWAP_V3_POOL_ABI
                        )
                        
                        liquidity = pool.functions.liquidity().call()
                        
                        if liquidity > 0:
                            return {
                                "pool_address": pool_address,
                                "dex_type": "uniswap_v3",
                                "fee_tier": fee,
                                "liquidity": liquidity,
                                "has_liquidity": True
                            }
                except Exception:
                    continue
            
            return None
        except Exception as e:
            print(f"Error checking V3 liquidity: {e}")
            return None
    
    def get_all_liquidity(
        self,
        token_address: str
    ) -> Dict[str, Any]:
        """Get all liquidity info for a token."""
        result = {
            "token_address": token_address,
            "chain": self.chain_slug,
            "v2_pools": [],
            "v3_pools": [],
            "has_liquidity": False,
            "total_liquidity_usd": None  # Would need price oracle
        }
        
        # Check V2
        v2_liquidity = self.check_v2_liquidity(token_address)
        if v2_liquidity and v2_liquidity.get("has_liquidity"):
            result["v2_pools"].append(v2_liquidity)
            result["has_liquidity"] = True
        
        # Check V3
        v3_liquidity = self.check_v3_liquidity(token_address)
        if v3_liquidity and v3_liquidity.get("has_liquidity"):
            result["v3_pools"].append(v3_liquidity)
            result["has_liquidity"] = True
        
        return result
    
    def calculate_price_from_v2(
        self,
        token_address: str,
        token_decimals: int = 18,
        quote_decimals: int = 18
    ) -> Optional[float]:
        """Calculate token price from V2 reserves."""
        v2_info = self.check_v2_liquidity(token_address)
        if not v2_info or not v2_info.get("has_liquidity"):
            return None
        
        try:
            token_reserve = Decimal(v2_info["token_reserve"]) / Decimal(10 ** token_decimals)
            quote_reserve = Decimal(v2_info["quote_reserve"]) / Decimal(10 ** quote_decimals)
            
            if token_reserve > 0:
                # Price in quote token (e.g., WETH)
                price = float(quote_reserve / token_reserve)
                return price
        except Exception as e:
            print(f"Error calculating price: {e}")
        
        return None


def check_token_liquidity(
    chain_slug: str,
    token_address: str
) -> Dict[str, Any]:
    """Convenience function to check token liquidity."""
    detector = LiquidityDetector(chain_slug)
    return detector.get_all_liquidity(token_address)
