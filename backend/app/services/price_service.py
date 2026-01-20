"""Price service for price history queries."""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models import TokenPrice
from datetime import datetime, timedelta
from typing import List, Optional


def get_price_history(
    db: Session,
    token_id: int,
    range_str: str = "24h"
) -> List[TokenPrice]:
    """Get price history for a token within a time range."""
    # Calculate time range
    now = datetime.utcnow()
    if range_str == "24h":
        start_time = now - timedelta(hours=24)
        # For 24h, we want hourly data points
        # Group by hour if needed, or return all points
    elif range_str == "7d":
        start_time = now - timedelta(days=7)
        # For 7d, we want daily data points
    elif range_str == "30d":
        start_time = now - timedelta(days=30)
        # For 30d, we want daily data points
    else:
        # Default to 24h
        start_time = now - timedelta(hours=24)
    
    # Query price history
    query = db.query(TokenPrice).filter(
        and_(
            TokenPrice.token_id == token_id,
            TokenPrice.timestamp >= start_time
        )
    ).order_by(TokenPrice.timestamp.asc())
    
    prices = query.all()
    
    # For 7d and 30d, we should aggregate to daily points
    # For now, return all points (can be optimized later)
    if range_str in ["7d", "30d"] and len(prices) > 0:
        # Simple aggregation: take one point per day (the latest)
        aggregated = {}
        for price in prices:
            day_key = price.timestamp.date()
            if day_key not in aggregated or price.timestamp > aggregated[day_key].timestamp:
                aggregated[day_key] = price
        prices = sorted(aggregated.values(), key=lambda p: p.timestamp)
    
    return prices


def get_latest_price(db: Session, token_id: int) -> Optional[TokenPrice]:
    """Get the latest price for a token."""
    return db.query(TokenPrice).filter(
        TokenPrice.token_id == token_id
    ).order_by(TokenPrice.timestamp.desc()).first()


def create_price_point(
    db: Session,
    token_id: int,
    price_usd: float,
    volume_24h: Optional[float] = None,
    tvl: Optional[float] = None,
    market_cap: Optional[float] = None,
    timestamp: Optional[datetime] = None
) -> TokenPrice:
    """Create a new price history point."""
    if timestamp is None:
        timestamp = datetime.utcnow()
    
    price_point = TokenPrice(
        token_id=token_id,
        timestamp=timestamp,
        price_usd=price_usd,
        volume_24h=volume_24h,
        tvl=tvl,
        market_cap=market_cap
    )
    
    db.add(price_point)
    db.commit()
    db.refresh(price_point)
    
    return price_point
