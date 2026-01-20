"""Token service for business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models import Token, Chain
from app.schemas.token import TokenListQuery
from typing import List, Optional, Tuple


def get_tokens(
    db: Session,
    query_params: TokenListQuery
) -> Tuple[List[Token], int]:
    """Get tokens with filtering, searching, and sorting."""
    query = db.query(Token)
    
    # Filter by chain
    if query_params.chain:
        chain = db.query(Chain).filter(Chain.slug == query_params.chain).first()
        if chain:
            query = query.filter(Token.chain_id == chain.id)
    
    # Search by name or symbol
    if query_params.search:
        search_term = f"%{query_params.search.lower()}%"
        query = query.filter(
            or_(
                Token.name.ilike(search_term),
                Token.symbol.ilike(search_term)
            )
        )
    
    # Sorting
    sort_field = query_params.sort or "volume_24h"
    if sort_field == "volume_24h":
        query = query.order_by(desc(Token.volume_24h), desc(Token.id))
    elif sort_field == "price_change_24h":
        # For now, sort by price_usd (we can add price_change_24h field later)
        query = query.order_by(desc(Token.price_usd), desc(Token.id))
    elif sort_field == "market_cap":
        query = query.order_by(desc(Token.market_cap), desc(Token.id))
    else:
        query = query.order_by(desc(Token.id))
    
    # Get total count before pagination
    total = query.count()
    
    # Pagination
    tokens = query.offset(query_params.offset).limit(query_params.limit).all()
    
    return tokens, total


def get_token_by_id(db: Session, token_id: int) -> Optional[Token]:
    """Get token by ID."""
    return db.query(Token).filter(Token.id == token_id).first()


def get_trending_tokens(db: Session, limit: int = 20) -> List[Token]:
    """Get trending tokens based on 24h volume or price change."""
    # Get tokens with liquidity, ordered by volume_24h descending
    query = db.query(Token).filter(
        Token.has_liquidity == True,
        Token.volume_24h.isnot(None)
    ).order_by(desc(Token.volume_24h)).limit(limit)
    
    return query.all()


def create_or_update_token(db: Session, token_data: dict) -> Token:
    """Create or update a token."""
    # Check if token exists (by chain_id and address)
    existing = db.query(Token).filter(
        Token.chain_id == token_data["chain_id"],
        Token.address == token_data["address"]
    ).first()
    
    if existing:
        # Update existing token
        for key, value in token_data.items():
            if key not in ["chain_id", "address"]:  # Don't update these
                setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new token
        token = Token(**token_data)
        db.add(token)
        db.commit()
        db.refresh(token)
        return token
