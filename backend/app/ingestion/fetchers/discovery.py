"""Token discovery mechanisms."""
import asyncio
from typing import List, Dict, Any, Optional
from web3 import Web3
from app.ingestion.config import get_chain_config, get_active_chains, get_dex_factory

# Uniswap V2 Factory ABI (PairCreated event)
UNISWAP_V2_FACTORY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "token0", "type": "address"},
            {"indexed": True, "name": "token1", "type": "address"},
            {"indexed": False, "name": "pair", "type": "address"},
            {"indexed": False, "name": "allPairsLength", "type": "uint256"}
        ],
        "name": "PairCreated",
        "type": "event"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "allPairsLength",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "", "type": "uint256"}],
        "name": "allPairs",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    }
]

# Uniswap V3 Factory ABI (PoolCreated event)
UNISWAP_V3_FACTORY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "token0", "type": "address"},
            {"indexed": True, "name": "token1", "type": "address"},
            {"indexed": True, "name": "fee", "type": "uint24"},
            {"indexed": False, "name": "tickSpacing", "type": "int24"},
            {"indexed": False, "name": "pool", "type": "address"}
        ],
        "name": "PoolCreated",
        "type": "event"
    }
]


class TokenDiscovery:
    """Token discovery service for finding new tokens on DEXs."""
    
    def __init__(self, chain_slug: str):
        """Initialize token discovery for a chain."""
        self.chain_slug = chain_slug
        self.config = get_chain_config(chain_slug)
        if not self.config:
            raise ValueError(f"Unknown chain: {chain_slug}")
        
        rpc_url = self.config.get("rpc_url")
        if not rpc_url:
            raise ValueError(f"No RPC URL configured for {chain_slug}")
        
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.weth_address = self.config.get("weth_address", "").lower()
    
    def get_v2_factory_contract(self) -> Optional[Any]:
        """Get Uniswap V2 factory contract."""
        factory_address = get_dex_factory(self.chain_slug, "uniswap_v2_factory")
        if not factory_address:
            return None
        return self.w3.eth.contract(
            address=Web3.to_checksum_address(factory_address),
            abi=UNISWAP_V2_FACTORY_ABI
        )
    
    def get_v3_factory_contract(self) -> Optional[Any]:
        """Get Uniswap V3 factory contract."""
        factory_address = get_dex_factory(self.chain_slug, "uniswap_v3_factory")
        if not factory_address:
            return None
        return self.w3.eth.contract(
            address=Web3.to_checksum_address(factory_address),
            abi=UNISWAP_V3_FACTORY_ABI
        )
    
    def discover_tokens_from_v2_pairs(self, limit: int = 100) -> List[str]:
        """Discover tokens from Uniswap V2 pairs."""
        tokens = set()
        factory = self.get_v2_factory_contract()
        if not factory:
            return []
        
        try:
            total_pairs = factory.functions.allPairsLength().call()
            start_index = max(0, total_pairs - limit)
            
            for i in range(start_index, total_pairs):
                try:
                    pair_address = factory.functions.allPairs(i).call()
                    # Get tokens from pair (would need pair ABI)
                    # For now, we'll use events instead
                except Exception as e:
                    print(f"Error getting pair {i}: {e}")
                    continue
        except Exception as e:
            print(f"Error getting V2 pairs: {e}")
        
        return list(tokens)
    
    def discover_tokens_from_recent_events(
        self,
        from_block: int,
        to_block: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Discover tokens from recent PairCreated/PoolCreated events."""
        tokens = []
        
        if to_block is None:
            to_block = self.w3.eth.block_number
        
        # V2 Factory events
        v2_factory = self.get_v2_factory_contract()
        if v2_factory:
            try:
                events = v2_factory.events.PairCreated.get_logs(
                    fromBlock=from_block,
                    toBlock=to_block
                )
                for event in events:
                    token0 = event["args"]["token0"].lower()
                    token1 = event["args"]["token1"].lower()
                    pair = event["args"]["pair"]
                    
                    # Add non-WETH tokens
                    if token0 != self.weth_address:
                        tokens.append({
                            "address": token0,
                            "pair_address": pair,
                            "dex_type": "uniswap_v2",
                            "block_number": event["blockNumber"]
                        })
                    if token1 != self.weth_address:
                        tokens.append({
                            "address": token1,
                            "pair_address": pair,
                            "dex_type": "uniswap_v2",
                            "block_number": event["blockNumber"]
                        })
            except Exception as e:
                print(f"Error getting V2 events: {e}")
        
        # V3 Factory events
        v3_factory = self.get_v3_factory_contract()
        if v3_factory:
            try:
                events = v3_factory.events.PoolCreated.get_logs(
                    fromBlock=from_block,
                    toBlock=to_block
                )
                for event in events:
                    token0 = event["args"]["token0"].lower()
                    token1 = event["args"]["token1"].lower()
                    pool = event["args"]["pool"]
                    
                    if token0 != self.weth_address:
                        tokens.append({
                            "address": token0,
                            "pool_address": pool,
                            "dex_type": "uniswap_v3",
                            "block_number": event["blockNumber"]
                        })
                    if token1 != self.weth_address:
                        tokens.append({
                            "address": token1,
                            "pool_address": pool,
                            "dex_type": "uniswap_v3",
                            "block_number": event["blockNumber"]
                        })
            except Exception as e:
                print(f"Error getting V3 events: {e}")
        
        # Deduplicate by address
        seen = set()
        unique_tokens = []
        for token in tokens:
            if token["address"] not in seen:
                seen.add(token["address"])
                unique_tokens.append(token)
        
        return unique_tokens
    
    def get_current_block(self) -> int:
        """Get current block number."""
        return self.w3.eth.block_number


async def discover_all_chains(blocks_back: int = 10000) -> Dict[str, List[Dict[str, Any]]]:
    """Discover tokens across all active chains."""
    results = {}
    
    for chain_slug, config in get_active_chains().items():
        try:
            discovery = TokenDiscovery(chain_slug)
            current_block = discovery.get_current_block()
            from_block = max(0, current_block - blocks_back)
            
            tokens = discovery.discover_tokens_from_recent_events(from_block, current_block)
            results[chain_slug] = tokens
            print(f"Discovered {len(tokens)} tokens on {chain_slug}")
        except Exception as e:
            print(f"Error discovering tokens on {chain_slug}: {e}")
            results[chain_slug] = []
    
    return results
