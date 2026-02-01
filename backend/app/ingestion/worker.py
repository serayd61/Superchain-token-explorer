"""Data ingestion worker script."""
import click
import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Chain, Token
from app.services.token_service import create_or_update_token
from app.services.price_service import create_price_point
from app.ingestion.config import CHAIN_CONFIGS, get_chain_config, get_active_chains
from app.ingestion.fetchers.rpc import RPCClient
from app.ingestion.fetchers.onchain import OnChainFetcher
from app.ingestion.fetchers.market import MarketDataFetcher
from app.ingestion.fetchers.liquidity import LiquidityDetector
from app.ingestion.seed_tokens import get_seed_tokens
from datetime import datetime
from typing import List, Dict, Optional, Any
import time


def get_tracked_tokens(db: Session, chain: Chain) -> List[Dict[str, Any]]:
    """Get list of tokens to track for a chain.
    
    This combines:
    1. Existing tokens in database
    2. Seed tokens for the chain
    """
    tokens = []
    
    # Get existing tokens from database
    existing_tokens = db.query(Token).filter(Token.chain_id == chain.id).all()
    for token in existing_tokens:
        tokens.append({
            "address": token.address,
            "symbol": token.symbol,
            "name": token.name,
            "decimals": token.decimals,
            "from_db": True
        })
    
    # Get seed tokens and add any that aren't already in DB
    existing_addresses = {t["address"].lower() for t in tokens}
    seed_tokens = get_seed_tokens(chain.slug)
    
    for seed_token in seed_tokens:
        if seed_token["address"].lower() not in existing_addresses:
            tokens.append({
                "address": seed_token["address"],
                "symbol": seed_token["symbol"],
                "name": seed_token["name"],
                "decimals": seed_token["decimals"],
                "from_seed": True
            })
    
    return tokens


def ensure_chain_exists(db: Session, chain_slug: str) -> Optional[Chain]:
    """Ensure chain exists in database, create if not."""
    chain_config = get_chain_config(chain_slug)
    if not chain_config:
        print(f"Unknown chain: {chain_slug}")
        return None
    
    # Skip inactive chains
    if not chain_config.get("is_active", False):
        print(f"Chain {chain_slug} is not active, skipping...")
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
    token_info: Dict[str, Any],
    rpc_client: RPCClient,
    market_fetcher: MarketDataFetcher,
    liquidity_detector: Optional[LiquidityDetector] = None
) -> bool:
    """Process a single token: fetch data and update database."""
    token_address = token_info["address"]
    
    try:
        # Use seed data if available, otherwise fetch from chain
        if token_info.get("from_seed") or token_info.get("from_db"):
            onchain_data = {
                "address": token_address,
                "symbol": token_info.get("symbol", "UNKNOWN"),
                "name": token_info.get("name", "Unknown Token"),
                "decimals": token_info.get("decimals", 18),
                "total_supply": None
            }
        else:
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
        
        # Check liquidity
        has_liquidity = False
        liquidity_usd = None
        v2_pools = []
        v3_pools = []
        
        if liquidity_detector:
            try:
                liquidity_info = liquidity_detector.get_all_liquidity(token_address)
                has_liquidity = liquidity_info.get("has_liquidity", False)
                v2_pools = [p["pair_address"] for p in liquidity_info.get("v2_pools", [])]
                v3_pools = [p["pool_address"] for p in liquidity_info.get("v3_pools", [])]
            except Exception as e:
                print(f"Liquidity check failed for {token_address}: {e}")
        
        # Prepare token data
        token_data = {
            "chain_id": chain.id,
            "address": onchain_data["address"],
            "symbol": onchain_data["symbol"],
            "name": onchain_data["name"],
            "decimals": onchain_data["decimals"],
            "total_supply": onchain_data.get("total_supply"),
            "has_liquidity": has_liquidity,
            "v2_pools": v2_pools if v2_pools else None,
            "v3_pools": v3_pools if v3_pools else None,
        }
        
        # Add market data if available
        if market_data:
            token_data["price_usd"] = market_data.get("price_usd")
            token_data["price_change_24h"] = market_data.get("price_change_24h")
            token_data["volume_24h"] = market_data.get("volume_24h")
            token_data["market_cap"] = market_data.get("market_cap")
            if market_data.get("liquidity_usd"):
                token_data["liquidity_usd"] = market_data.get("liquidity_usd")
        
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
        
        price_str = f"${market_data['price_usd']:.6f}" if market_data and market_data.get("price_usd") else "N/A"
        liq_str = "✓" if has_liquidity else "✗"
        print(f"  ✓ {onchain_data['symbol']:10} | Price: {price_str:15} | Liquidity: {liq_str}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error processing {token_address[:10]}...: {e}")
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
    
    print(f"\n{'='*60}")
    print(f"Processing chain: {chain.name} ({chain_slug})")
    print(f"{'='*60}")
    
    # Initialize clients
    rpc_client = RPCClient(chain_config["rpc_url"])
    market_fetcher = MarketDataFetcher()
    
    # Initialize liquidity detector
    liquidity_detector = None
    try:
        liquidity_detector = LiquidityDetector(chain_slug)
    except Exception as e:
        print(f"Warning: Could not initialize liquidity detector: {e}")
    
    try:
        # Get tracked tokens
        tracked_tokens = get_tracked_tokens(db, chain)
        
        if not tracked_tokens:
            print(f"No tokens to track for {chain.name}")
            return
        
        print(f"Found {len(tracked_tokens)} tokens to process")
        print("-" * 60)
        
        # Process each token
        success_count = 0
        for token_info in tracked_tokens:
            success = await process_token(
                db, chain, token_info, rpc_client, market_fetcher, liquidity_detector
            )
            if success:
                success_count += 1
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.3)
        
        print("-" * 60)
        print(f"✓ Processed {success_count}/{len(tracked_tokens)} tokens for {chain.name}")
        
    finally:
        await market_fetcher.close()


async def run_ingestion_once():
    """Run ingestion once for all active chains."""
    db = SessionLocal()
    try:
        print("\n" + "=" * 60)
        print("SUPERCHAIN TOKEN EXPLORER - DATA INGESTION")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Process only active chains
        active_chains = get_active_chains()
        print(f"Active chains: {', '.join(active_chains.keys())}")
        
        for chain_slug in active_chains.keys():
            await process_chain(db, chain_slug)
        
        print("\n" + "=" * 60)
        print(f"✓ Ingestion complete at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
    finally:
        db.close()


async def run_seed_only():
    """Seed database with initial tokens without fetching market data."""
    from app.ingestion.seed_tokens import SEED_TOKENS
    
    db = SessionLocal()
    try:
        print("Seeding database with initial tokens...")
        
        for chain_slug, tokens in SEED_TOKENS.items():
            chain = ensure_chain_exists(db, chain_slug)
            if not chain:
                continue
            
            count = 0
            for token_data in tokens:
                try:
                    create_or_update_token(db, {
                        "chain_id": chain.id,
                        "address": token_data["address"],
                        "symbol": token_data["symbol"],
                        "name": token_data["name"],
                        "decimals": token_data["decimals"],
                        "is_verified": True,
                    })
                    count += 1
                except Exception as e:
                    print(f"Error seeding {token_data['symbol']}: {e}")
            
            print(f"Seeded {count} tokens for {chain_slug}")
        
        print("✓ Seeding complete")
        
    finally:
        db.close()


@click.command()
@click.option("--once", is_flag=True, help="Run ingestion once and exit")
@click.option("--seed", is_flag=True, help="Seed database with initial tokens only")
@click.option("--interval", type=int, default=300, help="Interval in seconds for periodic runs (default: 300 = 5 minutes)")
def main(once: bool, seed: bool, interval: int):
    """Data ingestion worker for Superchain Token Explorer."""
    if seed:
        # Seed only
        asyncio.run(run_seed_only())
    elif once:
        # Run once
        asyncio.run(run_ingestion_once())
    else:
        # Run periodically
        print(f"Starting periodic ingestion (interval: {interval}s)")
        while True:
            try:
                asyncio.run(run_ingestion_once())
                print(f"\nWaiting {interval} seconds until next run...")
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
