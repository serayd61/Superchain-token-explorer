"""DefiLlama API integration for real TVL and yield data.

This module fetches real-time TVL and yield data from DefiLlama,
which is the industry standard for DeFi analytics.
"""
import httpx
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import time


# DefiLlama chain name mapping
DEFILLAMA_CHAINS = {
    "base": "Base",
    "optimism": "Optimism",
    "mode": "Mode",
    "zora": "Zora",
    "lisk": "Lisk",
    "bob": "BOB",
    "mint": "Mint",
    "worldchain": "World Chain",
    "unichain": "Unichain",
    "ink": "Ink",
    "soneium": "Soneium",
    "swell": "Swell",
    "shape": "Shape",
    "metal": "Metal",
    "polynomial": "Polynomial",
    "superseed": "Superseed",
    "race": "Race",
    "arena_z": "Arena-Z",
    "epic": "Ethernity",
}


class DefiLlamaFetcher:
    """Fetcher for DefiLlama TVL and yield data."""
    
    def __init__(self):
        self.base_url = "https://api.llama.fi"
        self.yields_url = "https://yields.llama.fi"
        self.client = httpx.AsyncClient(timeout=30.0)
        self._cache: Dict[str, Any] = {}
        self._cache_time: Dict[str, float] = {}
        self._cache_duration = 300  # 5 minutes
    
    def _is_cache_valid(self, key: str) -> bool:
        """Check if cache is still valid."""
        if key not in self._cache_time:
            return False
        return time.time() - self._cache_time[key] < self._cache_duration
    
    async def get_chain_tvl(self, chain: str) -> Optional[Dict[str, Any]]:
        """Get TVL for a specific chain.
        
        Returns:
            Dict with tvl, tvlPrevDay, tvlPrevWeek, tvlPrevMonth
        """
        cache_key = f"chain_tvl_{chain}"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        try:
            defillama_chain = DEFILLAMA_CHAINS.get(chain)
            if not defillama_chain:
                return None
            
            response = await self.client.get(f"{self.base_url}/v2/chains")
            if response.status_code != 200:
                return None
            
            data = response.json()
            
            for chain_data in data:
                if chain_data.get("name") == defillama_chain:
                    result = {
                        "chain": chain,
                        "name": defillama_chain,
                        "tvl": chain_data.get("tvl", 0),
                        "tvl_prev_day": chain_data.get("tvlPrevDay", 0),
                        "tvl_prev_week": chain_data.get("tvlPrevWeek", 0),
                        "tvl_prev_month": chain_data.get("tvlPrevMonth", 0),
                        "change_1d": self._calc_change(chain_data.get("tvl", 0), chain_data.get("tvlPrevDay", 0)),
                        "change_7d": self._calc_change(chain_data.get("tvl", 0), chain_data.get("tvlPrevWeek", 0)),
                        "change_30d": self._calc_change(chain_data.get("tvl", 0), chain_data.get("tvlPrevMonth", 0)),
                    }
                    self._cache[cache_key] = result
                    self._cache_time[cache_key] = time.time()
                    return result
            
            return None
        except Exception as e:
            print(f"DefiLlama chain TVL error: {e}")
            return None
    
    async def get_all_chains_tvl(self) -> List[Dict[str, Any]]:
        """Get TVL for all Superchain networks."""
        cache_key = "all_chains_tvl"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        try:
            response = await self.client.get(f"{self.base_url}/v2/chains")
            if response.status_code != 200:
                return []
            
            data = response.json()
            results = []
            
            # Create reverse mapping
            reverse_map = {v: k for k, v in DEFILLAMA_CHAINS.items()}
            
            for chain_data in data:
                chain_name = chain_data.get("name")
                if chain_name in reverse_map:
                    slug = reverse_map[chain_name]
                    results.append({
                        "chain": slug,
                        "name": chain_name,
                        "tvl": chain_data.get("tvl", 0),
                        "tvl_prev_day": chain_data.get("tvlPrevDay", 0),
                        "tvl_prev_week": chain_data.get("tvlPrevWeek", 0),
                        "change_1d": self._calc_change(chain_data.get("tvl", 0), chain_data.get("tvlPrevDay", 0)),
                        "change_7d": self._calc_change(chain_data.get("tvl", 0), chain_data.get("tvlPrevWeek", 0)),
                    })
            
            # Sort by TVL
            results.sort(key=lambda x: x["tvl"], reverse=True)
            
            self._cache[cache_key] = results
            self._cache_time[cache_key] = time.time()
            return results
        except Exception as e:
            print(f"DefiLlama all chains TVL error: {e}")
            return []
    
    async def get_protocols_on_chain(self, chain: str) -> List[Dict[str, Any]]:
        """Get all protocols and their TVL on a specific chain."""
        cache_key = f"protocols_{chain}"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        try:
            defillama_chain = DEFILLAMA_CHAINS.get(chain)
            if not defillama_chain:
                return []
            
            response = await self.client.get(f"{self.base_url}/protocols")
            if response.status_code != 200:
                return []
            
            data = response.json()
            results = []
            
            for protocol in data:
                chains = protocol.get("chains", [])
                if defillama_chain in chains:
                    chain_tvls = protocol.get("chainTvls", {})
                    chain_tvl = chain_tvls.get(defillama_chain, 0)
                    
                    if chain_tvl > 0:
                        results.append({
                            "name": protocol.get("name"),
                            "slug": protocol.get("slug"),
                            "tvl": chain_tvl,
                            "category": protocol.get("category"),
                            "logo": protocol.get("logo"),
                            "url": protocol.get("url"),
                        })
            
            # Sort by TVL
            results.sort(key=lambda x: x["tvl"], reverse=True)
            
            self._cache[cache_key] = results
            self._cache_time[cache_key] = time.time()
            return results
        except Exception as e:
            print(f"DefiLlama protocols error: {e}")
            return []
    
    async def get_yields(self, chain: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get yield/APY data for pools.
        
        Args:
            chain: Optional chain filter
            
        Returns:
            List of pools with APY data
        """
        cache_key = f"yields_{chain or 'all'}"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        try:
            response = await self.client.get(f"{self.yields_url}/pools")
            if response.status_code != 200:
                return []
            
            data = response.json()
            pools = data.get("data", [])
            
            results = []
            defillama_chain = DEFILLAMA_CHAINS.get(chain) if chain else None
            
            for pool in pools:
                pool_chain = pool.get("chain")
                
                # Filter by chain if specified
                if defillama_chain and pool_chain != defillama_chain:
                    continue
                
                # Only include Superchain pools
                if pool_chain not in DEFILLAMA_CHAINS.values():
                    continue
                
                # Get our chain slug
                chain_slug = None
                for slug, name in DEFILLAMA_CHAINS.items():
                    if name == pool_chain:
                        chain_slug = slug
                        break
                
                if not chain_slug:
                    continue
                
                results.append({
                    "pool_id": pool.get("pool"),
                    "chain": chain_slug,
                    "chain_name": pool_chain,
                    "project": pool.get("project"),
                    "symbol": pool.get("symbol"),
                    "tvl_usd": pool.get("tvlUsd", 0),
                    "apy": pool.get("apy", 0),
                    "apy_base": pool.get("apyBase", 0),
                    "apy_reward": pool.get("apyReward", 0),
                    "stable_coin": pool.get("stablecoin", False),
                    "il_risk": pool.get("ilRisk", "unknown"),
                    "exposure": pool.get("exposure", "unknown"),
                })
            
            # Sort by APY
            results.sort(key=lambda x: x["apy"] or 0, reverse=True)
            
            # Limit results
            results = results[:100]
            
            self._cache[cache_key] = results
            self._cache_time[cache_key] = time.time()
            return results
        except Exception as e:
            print(f"DefiLlama yields error: {e}")
            return []
    
    async def get_stablecoins_on_chain(self, chain: str) -> List[Dict[str, Any]]:
        """Get stablecoin data for a chain."""
        cache_key = f"stables_{chain}"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        try:
            defillama_chain = DEFILLAMA_CHAINS.get(chain)
            if not defillama_chain:
                return []
            
            response = await self.client.get(f"{self.base_url}/stablecoins")
            if response.status_code != 200:
                return []
            
            data = response.json()
            stables = data.get("peggedAssets", [])
            
            results = []
            for stable in stables:
                chain_circulating = stable.get("chainCirculating", {})
                if defillama_chain in chain_circulating:
                    chain_data = chain_circulating[defillama_chain]
                    results.append({
                        "name": stable.get("name"),
                        "symbol": stable.get("symbol"),
                        "circulating": chain_data.get("current", {}).get("peggedUSD", 0),
                        "peg_type": stable.get("pegType"),
                        "peg_mechanism": stable.get("pegMechanism"),
                    })
            
            # Sort by circulating
            results.sort(key=lambda x: x["circulating"], reverse=True)
            
            self._cache[cache_key] = results
            self._cache_time[cache_key] = time.time()
            return results
        except Exception as e:
            print(f"DefiLlama stablecoins error: {e}")
            return []
    
    def _calc_change(self, current: float, previous: float) -> Optional[float]:
        """Calculate percentage change."""
        if not previous or previous == 0:
            return None
        return ((current - previous) / previous) * 100
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Singleton instance
_fetcher: Optional[DefiLlamaFetcher] = None


def get_defillama_fetcher() -> DefiLlamaFetcher:
    """Get or create DefiLlama fetcher instance."""
    global _fetcher
    if _fetcher is None:
        _fetcher = DefiLlamaFetcher()
    return _fetcher


async def get_superchain_tvl_summary() -> Dict[str, Any]:
    """Get summary of TVL across all Superchain networks.
    
    This is the main function to call for Growth Grants metrics.
    """
    fetcher = get_defillama_fetcher()
    chains_data = await fetcher.get_all_chains_tvl()
    
    total_tvl = sum(c["tvl"] for c in chains_data)
    total_tvl_prev_day = sum(c.get("tvl_prev_day", 0) for c in chains_data)
    
    return {
        "total_tvl_usd": total_tvl,
        "total_tvl_prev_day": total_tvl_prev_day,
        "change_24h": ((total_tvl - total_tvl_prev_day) / total_tvl_prev_day * 100) if total_tvl_prev_day else 0,
        "chains_count": len(chains_data),
        "chains": chains_data,
        "last_updated": datetime.utcnow().isoformat(),
        "source": "DefiLlama",
    }
