"""Chains router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.dependencies import get_db
from app.schemas.chain import ChainResponse
from app.services.chain_service import get_all_chains

router = APIRouter()


@router.get("/chains", response_model=List[ChainResponse])
async def list_chains(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all supported chains."""
    chains = get_all_chains(db, active_only=active_only)
    return chains
