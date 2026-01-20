"""Chain Pydantic schemas."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ChainBase(BaseModel):
    """Base chain schema."""
    name: str
    slug: str
    chain_id: int
    rpc_url: Optional[str] = None
    is_active: bool = True


class ChainCreate(ChainBase):
    """Schema for creating a chain."""
    pass


class ChainResponse(ChainBase):
    """Schema for chain response."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
