"""Market data fetcher using CoinGecko and DexScreener APIs."""
import httpx
import asyncio
from typing import Dict, Optional, Any
from app.config import settings
import time


# Chain ID to DexScreener chain mapping (19 Superchain networks)
DEXSCREENER_CHAINS = {
    # Primary Superchain
    8453: "base",
    10: "optimism",
    # Tier 2
    130: "unichain",
    480: "worldchain",
    57073: "ink",
    1868: "soneium",
    34443: "mode",
    # Tier 3
    7777777: "zora",
    1135: "lisk",
    60808: "bob",
    1923: "swell",
    185: "mint",
    360: "shape",
    # Tier 4
    1750: "metal",
    8008: "polynomial",
    5330: "superseed",
    6805: "race",
    7897: "arena-z",
    183: "epic",
    # Non-Superchain (for reference)
    1: "ethereum",
    42161: "arbitrum",
    137: "polygon",
}


class DexScreenerFetcher:
    """Fetcher for market data from DexScreener API."""
    
    def __init__(self):
        """Initialize DexScreener fetcher."""
        self.base_url = "https://api.dexscreener.com/latest"
        self.client = httpx.AsyncClient(timeout=30.0)
        self._last_request_time = 0
        self._min_request_interval = 0.5  # DexScreener allows more requests
    
    async def _rate_limit(self):
        """Apply rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self._last_request_time
        if time_since_last < self._min_request_interval:
            await asyncio.sleep(self._min_request_interval - time_since_last)
        self._last_request_time = time.time()
    
    async def fetch_token_data(
        self,
        address: str,
        chain_id: int
    ) -> Optional[Dict[str, Any]]:
        """Fetch token data from DexScreener."""
        chain = DEXSCREENER_CHAINS.get(chain_id)
        if not chain:
            return None
        
        try:
            await self._rate_limit()
            
            # DexScreener API endpoint for token pairs
            url = f"{self.base_url}/dex/tokens/{address}"
            
            response = await self.client.get(url)
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            pairs = data.get("pairs", [])
            
            if not pairs:
                return None
            
            # Filter pairs for the specific chain
            chain_pairs = [p for p in pairs if p.get("chainId") == chain]
            
            if not chain_pairs:
                # Try without chain filter if no exact match
                chain_pairs = pairs
            
            # Get the pair with highest liquidity
            best_pair = max(chain_pairs, key=lambda p: float(p.get("liquidity", {}).get("usd", 0) or 0))
            
            price_usd = float(best_pair.get("priceUsd", 0) or 0)
            
            return {
                "price_usd": price_usd if price_usd > 0 else None,
                "market_cap": float(best_pair.get("fdv", 0) or 0) or None,
                "volume_24h": float(best_pair.get("volume", {}).get("h24", 0) or 0) or None,
                "price_change_24h": float(best_pair.get("priceChange", {}).get("h24", 0) or 0) or None,
                "liquidity_usd": float(best_pair.get("liquidity", {}).get("usd", 0) or 0) or None,
                "dex_id": best_pair.get("dexId"),
                "pair_address": best_pair.get("pairAddress"),
            }
        except Exception as e:
            print(f"DexScreener error for {address}: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


class CoinGeckoFetcher:
    """Fetcher for market data from CoinGecko."""
    
    def __init__(self):
        """Initialize CoinGecko fetcher."""
        self.base_url = "https://api.coingecko.com/api/v3"
        self.api_key = settings.coingecko_api_key
        self.client = httpx.AsyncClient(timeout=30.0)
        self._last_request_time = 0
        self._min_request_interval = 1.5  # Rate limiting: be conservative with free tier
    
    async def _rate_limit(self):
        """Apply rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self._last_request_time
        if time_since_last < self._min_request_interval:
            await asyncio.sleep(self._min_request_interval - time_since_last)
        self._last_request_time = time.time()
    
    async def fetch_token_data(
        self,
        address: str,
        platform: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch market data for a token from CoinGecko."""
        if not platform:
            return None
        
        try:
            await self._rate_limit()
            
            url = f"{self.base_url}/coins/{platform}/contract/{address}"
            headers = {}
            if self.api_key:
                headers["x-cg-demo-api-key"] = self.api_key
            
            response = await self.client.get(url, headers=headers)
            
            if response.status_code == 404:
                return None
            
            if response.status_code == 429:
                print("CoinGecko rate limit hit, waiting...")
                await asyncio.sleep(60)
                return None
            
            response.raise_for_status()
            data = response.json()
            
            market_data = data.get("market_data", {})
            
            return {
                "price_usd": market_data.get("current_price", {}).get("usd"),
                "market_cap": market_data.get("market_cap", {}).get("usd"),
                "volume_24h": market_data.get("total_volume", {}).get("usd"),
                "price_change_24h": market_data.get("price_change_percentage_24h"),
            }
        except httpx.HTTPError as e:
            print(f"CoinGecko HTTP error for {address}: {e}")
            return None
        except Exception as e:
            print(f"CoinGecko error for {address}: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


class MarketDataFetcher:
    """Combined market data fetcher with fallback support."""
    
    def __init__(self):
        """Initialize market data fetcher with multiple sources."""
        self.dexscreener = DexScreenerFetcher()
        self.coingecko = CoinGeckoFetcher()
    
    async def fetch_token_market_data(
        self,
        address: str,
        platform: str,
        chain_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """Fetch market data with fallback.
        
        Priority:
        1. DexScreener (faster, better for new tokens)
        2. CoinGecko (more established tokens)
        """
        # Map platform to chain_id if not provided
        if chain_id is None:
            platform_to_chain = {
                "base": 8453,
                "optimistic-ethereum": 10,
                "ethereum": 1,
                "arbitrum-one": 42161,
                "polygon-pos": 137,
            }
            chain_id = platform_to_chain.get(platform)
        
        # Try DexScreener first (faster, no rate limit issues)
        if chain_id:
            dex_data = await self.dexscreener.fetch_token_data(address, chain_id)
            if dex_data and dex_data.get("price_usd"):
                return dex_data
        
        # Fallback to CoinGecko
        if platform:
            cg_data = await self.coingecko.fetch_token_data(address, platform)
            if cg_data and cg_data.get("price_usd"):
                return cg_data
        
        return None
    
    async def close(self):
        """Close all HTTP clients."""
        await self.dexscreener.close()
        await self.coingecko.close()


# For sync usage (worker script)
def fetch_token_market_data_sync(
    address: str,
    platform: str,
    chain_id: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    """Synchronous wrapper for market data fetching."""
    fetcher = MarketDataFetcher()
    try:
        return asyncio.run(fetcher.fetch_token_market_data(address, platform, chain_id))
    finally:
        asyncio.run(fetcher.close())
