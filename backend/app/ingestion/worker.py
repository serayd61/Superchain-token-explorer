"""Data ingestion worker script."""
import click
import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Chain, Token
from app.services.token_service import create_or_update_token
from app.services.price_service import create_price_point
from app.ingestion.config import CHAIN_CONFIGS, get_chain_config
from app.ingestion.fetchers.rpc import RPCClient
from app.ingestion.fetchers.onchain import OnChainFetcher
from app.ingestion.fetchers.market import MarketDataFetcher
from datetime import datetime
from typing import List, Dict, Optional
import time


def get_tracked_tokens(db: Session, chain_id: int) -> List[Dict[str, any]]:
    """Get list of tokens to track for a chain.
    
    For now, this returns an empty list. In production, this would:
    - Read from a config file with token addresses
    - Or query a token list API
    - Or scan for new token deployments
    """
    # TODO: Implement token discovery mechanism
    # For now, return empty list - tokens should be added manually or via API
    return []


def ensure_chain_exists(db: Session, chain_slug: str) -> Optional[Chain]:
    """Ensure chain exists in database, create if not."""
    chain_config = get_chain_config(chain_slug)
    if not chain_config:
        print(f"Unknown chain: {chain_slug}")
        return None
    
    chain = db.query(Chain).filter(Chain.slug == chain_slug).first()
    if not chain:
        chain = Chain(
            name=chain_config["name"],
            slug=chain_config["slug"],
            chain_id=chain_config["chain_id"],
            rpc_url=chain_config.get("rpc_url"),
            is_active=True
        )
        db.add(chain)
        db.commit()
        db.refresh(chain)
        print(f"Created chain: {chain.name}")
    
    return chain


async def process_token(
    db: Session,
    chain: Chain,
    token_address: str,
    rpc_client: RPCClient,
    market_fetcher: MarketDataFetcher
) -> bool:
    """Process a single token: fetch data and update database."""
    try:
        # Fetch on-chain metadata
        onchain_fetcher = OnChainFetcher(rpc_client)
        onchain_data = onchain_fetcher.fetch_token_metadata(token_address)
        
        if not onchain_data:
            print(f"Failed to fetch on-chain data for {token_address}")
            return False
        
        # Fetch market data
        chain_config = get_chain_config(chain.slug)
        platform = chain_config.get("coingecko_platform") if chain_config else None
        market_data = None
        if platform:
            market_data = await market_fetcher.fetch_token_market_data(token_address, platform)
        
        # Prepare token data
        token_data = {
            "chain_id": chain.id,
            "address": onchain_data["address"],
            "symbol": onchain_data["symbol"],
            "name": onchain_data["name"],
            "decimals": onchain_data["decimals"],
            "total_supply": onchain_data["total_supply"],
        }
        
        # Add market data if available
        if market_data:
            token_data["price_usd"] = market_data.get("price_usd")
            token_data["volume_24h"] = market_data.get("volume_24h")
            token_data["market_cap"] = market_data.get("market_cap")
        
        # Create or update token
        token = create_or_update_token(db, token_data)
        
        # Create price history point if we have price data
        if market_data and market_data.get("price_usd"):
            create_price_point(
                db=db,
                token_id=token.id,
                price_usd=market_data["price_usd"],
                volume_24h=market_data.get("volume_24h"),
                market_cap=market_data.get("market_cap")
            )
        
        print(f"✓ Processed {token.symbol} ({token_address[:10]}...)")
        return True
        
    except Exception as e:
        print(f"✗ Error processing token {token_address}: {e}")
        return False


async def process_chain(db: Session, chain_slug: str):
    """Process all tokens for a chain."""
    chain = ensure_chain_exists(db, chain_slug)
    if not chain:
        return
    
    chain_config = get_chain_config(chain_slug)
    if not chain_config or not chain_config.get("rpc_url"):
        print(f"No RPC URL configured for {chain_slug}")
        return
    
    print(f"\nProcessing chain: {chain.name} ({chain_slug})")
    
    # Initialize RPC client
    rpc_client = RPCClient(chain_config["rpc_url"])
    market_fetcher = MarketDataFetcher()
    
    try:
        # Get tracked tokens
        tracked_tokens = get_tracked_tokens(db, chain.id)
        
        if not tracked_tokens:
            print(f"No tokens tracked for {chain.name}. Add tokens manually or implement discovery.")
            return
        
        # Process each token
        success_count = 0
        for token_info in tracked_tokens:
            token_address = token_info.get("address") or token_info  # Support both dict and string
            if isinstance(token_info, dict):
                token_address = token_info["address"]
            else:
                token_address = token_info
            
            success = await process_token(db, chain, token_address, rpc_client, market_fetcher)
            if success:
                success_count += 1
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.5)
        
        print(f"\n✓ Processed {success_count}/{len(tracked_tokens)} tokens for {chain.name}")
        
    finally:
        await market_fetcher.close()


async def run_ingestion_once():
    """Run ingestion once for all chains."""
    db = SessionLocal()
    try:
        print("Starting data ingestion...")
        
        # Process each configured chain
        for chain_slug in CHAIN_CONFIGS.keys():
            await process_chain(db, chain_slug)
        
        print("\n✓ Ingestion complete")
        
    finally:
        db.close()


@click.command()
@click.option("--once", is_flag=True, help="Run ingestion once and exit")
@click.option("--interval", type=int, default=900, help="Interval in seconds for periodic runs (default: 900 = 15 minutes)")
def main(once: bool, interval: int):
    """Data ingestion worker for Superchain Token Explorer."""
    if once:
        # Run once
        asyncio.run(run_ingestion_once())
    else:
        # Run periodically
        print(f"Starting periodic ingestion (interval: {interval}s)")
        while True:
            try:
                asyncio.run(run_ingestion_once())
                print(f"Waiting {interval} seconds until next run...")
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\nStopping ingestion worker...")
                break
            except Exception as e:
                print(f"Error in ingestion cycle: {e}")
                print(f"Retrying in {interval} seconds...")
                time.sleep(interval)


if __name__ == "__main__":
    main()
