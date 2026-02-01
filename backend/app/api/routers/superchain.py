"""Superchain API endpoints for cross-chain analytics and interop."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models import Token, Chain
from app.ingestion.config import (
    CHAIN_CONFIGS, 
    get_superchain_stats, 
    get_active_chains,
    get_chains_by_priority
)
from app.ingestion.fetchers.interop import (
    check_token_interop_status,
    find_cross_chain_token,
    get_interop_ready_tokens,
    KNOWN_SUPERCHAIN_TOKENS
)
from pydantic import BaseModel
from datetime import datetime


router = APIRouter(prefix="/superchain", tags=["superchain"])


# ============================================
# RESPONSE MODELS
# ============================================

class ChainStatsResponse(BaseModel):
    """Statistics for a single chain."""
    slug: str
    name: str
    chain_id: int
    priority: int
    is_active: bool
    token_count: int = 0
    total_volume_24h: float = 0
    total_tvl: float = 0


class SuperchainOverviewResponse(BaseModel):
    """Overview of the entire Superchain ecosystem."""
    total_chains: int
    active_chains: int
    total_tokens: int
    total_volume_24h: float
    total_tvl: float
    interop_ready_tokens: int
    chains: List[ChainStatsResponse]
    last_updated: datetime


class InteropTokenInfo(BaseModel):
    """Information about an interop-ready token."""
    symbol: str
    canonical_address: Optional[str]
    is_interop_ready: bool
    chains_available: List[str]
    addresses: dict


class CrossChainTokenResponse(BaseModel):
    """Cross-chain token information."""
    symbol: str
    source_chain: str
    is_interop_ready: bool
    canonical_address: Optional[str]
    cross_chain_addresses: dict
    price_comparison: Optional[dict] = None


# ============================================
# ENDPOINTS
# ============================================

@router.get("/overview", response_model=SuperchainOverviewResponse)
async def get_superchain_overview(db: Session = Depends(get_db)):
    """Get overview of the entire Superchain ecosystem.
    
    Returns statistics for all 19 eligible chains including:
    - Total tokens tracked
    - 24h volume across chains
    - TVL estimates
    - Interop-ready token count
    """
    stats = get_superchain_stats()
    active_chains = get_active_chains()
    
    chain_stats = []
    total_tokens = 0
    total_volume = 0.0
    total_tvl = 0.0
    
    for slug, config in CHAIN_CONFIGS.items():
        # Get chain from database
        chain = db.query(Chain).filter(Chain.slug == slug).first()
        
        token_count = 0
        chain_volume = 0.0
        chain_tvl = 0.0
        
        if chain:
            # Count tokens
            token_count = db.query(Token).filter(Token.chain_id == chain.id).count()
            
            # Sum volume
            volume_result = db.query(Token).filter(
                Token.chain_id == chain.id,
                Token.volume_24h.isnot(None)
            ).with_entities(
                db.query(Token.volume_24h).filter(Token.chain_id == chain.id)
            ).all()
            
            for token in db.query(Token).filter(Token.chain_id == chain.id).all():
                if token.volume_24h:
                    chain_volume += token.volume_24h
                if token.liquidity_usd:
                    chain_tvl += token.liquidity_usd
        
        chain_stats.append(ChainStatsResponse(
            slug=slug,
            name=config["name"],
            chain_id=config["chain_id"],
            priority=config.get("priority", 4),
            is_active=config.get("is_active", False),
            token_count=token_count,
            total_volume_24h=chain_volume,
            total_tvl=chain_tvl,
        ))
        
        total_tokens += token_count
        total_volume += chain_volume
        total_tvl += chain_tvl
    
    # Count interop-ready tokens
    interop_count = db.query(Token).filter(Token.is_interop_ready == True).count()
    
    # Sort chains by priority
    chain_stats.sort(key=lambda x: (x.priority, -x.token_count))
    
    return SuperchainOverviewResponse(
        total_chains=stats["total_chains"],
        active_chains=stats["active_chains"],
        total_tokens=total_tokens,
        total_volume_24h=total_volume,
        total_tvl=total_tvl,
        interop_ready_tokens=interop_count,
        chains=chain_stats,
        last_updated=datetime.utcnow(),
    )


@router.get("/chains")
async def get_supported_chains():
    """Get list of all 19 supported Superchain networks.
    
    Returns detailed information about each chain including:
    - Chain ID
    - RPC URL
    - Explorer URL
    - DEX factories
    - Priority tier
    """
    chains = []
    
    for slug, config in CHAIN_CONFIGS.items():
        chains.append({
            "slug": slug,
            "name": config["name"],
            "chain_id": config["chain_id"],
            "is_active": config.get("is_active", False),
            "priority": config.get("priority", 4),
            "tvl_rank": config.get("tvl_rank", 99),
            "explorer_url": config.get("explorer_url"),
            "has_dex": bool(config.get("dex", {})),
            "dex_types": list(config.get("dex", {}).keys()),
        })
    
    # Sort by priority and TVL rank
    chains.sort(key=lambda x: (x["priority"], x["tvl_rank"]))
    
    return {
        "total": len(chains),
        "chains": chains,
    }


@router.get("/interop/tokens")
async def get_interop_tokens(db: Session = Depends(get_db)):
    """Get list of all interop-ready tokens.
    
    These tokens support cross-chain transfers within the Superchain.
    """
    # Get known interop tokens
    known_tokens = get_interop_ready_tokens()
    
    # Get tokens marked as interop-ready in database
    db_tokens = db.query(Token).filter(Token.is_interop_ready == True).all()
    
    tokens = []
    
    for token_info in known_tokens:
        addresses = token_info.get("superchain_addresses", {})
        chains_available = list(addresses.keys()) if "all" not in addresses else list(CHAIN_CONFIGS.keys())
        
        tokens.append(InteropTokenInfo(
            symbol=token_info["symbol"],
            canonical_address=token_info.get("canonical_address"),
            is_interop_ready=True,
            chains_available=chains_available,
            addresses=addresses,
        ))
    
    return {
        "total": len(tokens),
        "tokens": tokens,
    }


@router.get("/interop/check/{chain_slug}/{token_address}")
async def check_token_interop(
    chain_slug: str,
    token_address: str,
):
    """Check if a token is SuperchainERC20 compatible.
    
    Analyzes the token contract to determine:
    - If it implements SuperchainERC20 interface
    - Cross-chain mint/burn capabilities
    - Bridge compatibility
    """
    if chain_slug not in CHAIN_CONFIGS:
        raise HTTPException(status_code=404, detail=f"Chain {chain_slug} not found")
    
    result = check_token_interop_status(token_address, chain_slug)
    
    return result


@router.get("/cross-chain/{symbol}")
async def get_cross_chain_token(
    symbol: str,
    source_chain: str = Query(default="base", description="Source chain slug"),
    db: Session = Depends(get_db),
):
    """Find the same token across different Superchain networks.
    
    Returns addresses and price comparison across chains.
    """
    result = find_cross_chain_token(symbol, source_chain)
    
    # Add price comparison from database
    price_comparison = {}
    
    for chain_slug, address in result.get("cross_chain_addresses", {}).items():
        if chain_slug == "all":
            continue
            
        chain = db.query(Chain).filter(Chain.slug == chain_slug).first()
        if chain:
            token = db.query(Token).filter(
                Token.chain_id == chain.id,
                Token.address.ilike(address)
            ).first()
            
            if token and token.price_usd:
                price_comparison[chain_slug] = {
                    "price_usd": token.price_usd,
                    "volume_24h": token.volume_24h,
                    "liquidity_usd": token.liquidity_usd,
                }
    
    return CrossChainTokenResponse(
        symbol=symbol.upper(),
        source_chain=source_chain,
        is_interop_ready=result.get("is_interop_ready", False),
        canonical_address=result.get("canonical_address"),
        cross_chain_addresses=result.get("cross_chain_addresses", {}),
        price_comparison=price_comparison if price_comparison else None,
    )


@router.get("/stats")
async def get_superchain_stats_endpoint():
    """Get quick statistics about Superchain support."""
    stats = get_superchain_stats()
    
    return {
        **stats,
        "eligible_for_grants": True,
        "grant_programs": [
            "Growth Grants",
            "Foundation Missions",
            "Retro Funding",
        ],
        "atlas_url": "https://atlas.optimism.io/",
    }


@router.get("/tvl")
async def get_superchain_tvl(db: Session = Depends(get_db)):
    """Get TVL breakdown across all Superchain networks."""
    tvl_data = []
    total_tvl = 0.0
    
    for slug, config in CHAIN_CONFIGS.items():
        if not config.get("is_active"):
            continue
            
        chain = db.query(Chain).filter(Chain.slug == slug).first()
        if not chain:
            continue
        
        # Calculate TVL from liquidity
        chain_tvl = 0.0
        tokens = db.query(Token).filter(Token.chain_id == chain.id).all()
        
        for token in tokens:
            if token.liquidity_usd:
                chain_tvl += token.liquidity_usd
        
        tvl_data.append({
            "chain": slug,
            "name": config["name"],
            "tvl_usd": chain_tvl,
            "token_count": len(tokens),
        })
        
        total_tvl += chain_tvl
    
    # Sort by TVL
    tvl_data.sort(key=lambda x: x["tvl_usd"], reverse=True)
    
    return {
        "total_tvl_usd": total_tvl,
        "chains": tvl_data,
        "last_updated": datetime.utcnow().isoformat(),
    }
