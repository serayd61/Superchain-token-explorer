"""Market data fetcher using CoinGecko API."""
import httpx
import asyncio
from typing import Dict, Optional, Any
from app.config import settings
import time


class MarketDataFetcher:
    """Fetcher for market data from CoinGecko."""
    
    def __init__(self):
        """Initialize market data fetcher."""
        self.base_url = "https://api.coingecko.com/api/v3"
        self.api_key = settings.coingecko_api_key
        self.client = httpx.AsyncClient(timeout=30.0)
        self._last_request_time = 0
        self._min_request_interval = 1.0  # Rate limiting: 1 request per second for free tier
    
    async def _rate_limit(self):
        """Apply rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self._last_request_time
        if time_since_last < self._min_request_interval:
            await asyncio.sleep(self._min_request_interval - time_since_last)
        self._last_request_time = time.time()
    
    async def fetch_token_market_data(
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
                # Token not found on CoinGecko
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
            print(f"HTTP error fetching market data for {address}: {e}")
            return None
        except Exception as e:
            print(f"Error fetching market data for {address}: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# For sync usage (worker script)
def fetch_token_market_data_sync(address: str, platform: str) -> Optional[Dict[str, Any]]:
    """Synchronous wrapper for market data fetching."""
    fetcher = MarketDataFetcher()
    try:
        return asyncio.run(fetcher.fetch_token_market_data(address, platform))
    finally:
        asyncio.run(fetcher.close())
