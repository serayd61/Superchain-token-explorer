"""Chain service for business logic."""
from sqlalchemy.orm import Session
from app.models import Chain
from typing import List, Optional


def get_all_chains(db: Session, active_only: bool = True) -> List[Chain]:
    """Get all chains, optionally filtered by active status."""
    query = db.query(Chain)
    if active_only:
        query = query.filter(Chain.is_active == True)
    return query.order_by(Chain.name).all()


def get_chain_by_slug(db: Session, slug: str) -> Optional[Chain]:
    """Get chain by slug."""
    return db.query(Chain).filter(Chain.slug == slug).first()


def get_chain_by_id(db: Session, chain_id: int) -> Optional[Chain]:
    """Get chain by ID."""
    return db.query(Chain).filter(Chain.id == chain_id).first()
