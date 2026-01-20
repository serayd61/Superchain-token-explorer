"""Tokens router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.dependencies import get_db
from app.schemas.token import (
    TokenResponse,
    TokenListQuery,
    TokenListResponse,
    PriceHistoryResponse,
    PriceHistoryQuery,
    PriceHistoryPoint,
)
from app.services.token_service import get_tokens, get_token_by_id, get_trending_tokens
from app.services.price_service import get_price_history

router = APIRouter()


@router.get("/tokens", response_model=TokenListResponse)
async def list_tokens(
    chain: Optional[str] = Query(None, description="Filter by chain slug"),
    search: Optional[str] = Query(None, description="Search by name or symbol"),
    sort: Optional[str] = Query("volume_24h", description="Sort field"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db)
):
    """Get list of tokens with filtering and pagination."""
    query_params = TokenListQuery(
        chain=chain,
        search=search,
        sort=sort,
        limit=limit,
        offset=offset
    )
    
    tokens, total = get_tokens(db, query_params)
    
    has_more = (offset + limit) < total
    
    return TokenListResponse(
        items=tokens,
        total=total,
        limit=limit,
        offset=offset,
        has_more=has_more
    )


@router.get("/tokens/trending", response_model=list[TokenResponse])
async def get_trending_tokens_endpoint(
    limit: int = Query(20, ge=1, le=100, description="Number of trending tokens"),
    db: Session = Depends(get_db)
):
    """Get trending tokens based on 24h volume."""
    tokens = get_trending_tokens(db, limit=limit)
    return tokens


@router.get("/tokens/{token_id}", response_model=TokenResponse)
async def get_token(
    token_id: int,
    db: Session = Depends(get_db)
):
    """Get token details by ID."""
    token = get_token_by_id(db, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return token


@router.get("/tokens/{token_id}/price-history", response_model=PriceHistoryResponse)
async def get_token_price_history(
    token_id: int,
    range_str: str = Query("24h", description="Time range: 24h, 7d, or 30d"),
    db: Session = Depends(get_db)
):
    """Get price history for a token."""
    # Validate token exists
    token = get_token_by_id(db, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Validate range
    if range_str not in ["24h", "7d", "30d"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid range. Must be one of: 24h, 7d, 30d"
        )
    
    # Get price history
    price_points = get_price_history(db, token_id, range_str)
    
    # Convert to response format
    data = [
        PriceHistoryPoint(
            timestamp=point.timestamp,
            price_usd=point.price_usd,
            volume_24h=point.volume_24h,
            market_cap=point.market_cap
        )
        for point in price_points
    ]
    
    return PriceHistoryResponse(
        token_id=token_id,
        range=range_str,
        data=data
    )
