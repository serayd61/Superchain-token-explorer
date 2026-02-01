"""Token Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TokenBase(BaseModel):
    """Base token schema."""
    address: str
    symbol: str
    name: str
    decimals: int = 18


class TokenCreate(TokenBase):
    """Schema for creating a token."""
    chain_id: int
    created_at_on_chain: Optional[datetime] = None
    deployer: Optional[str] = None
    block_number: Optional[int] = None
    transaction_hash: Optional[str] = None
    total_supply: Optional[str] = None


class TokenUpdate(BaseModel):
    """Schema for updating a token."""
    price_usd: Optional[float] = None
    price_change_24h: Optional[float] = None
    volume_24h: Optional[float] = None
    market_cap: Optional[float] = None
    has_liquidity: Optional[bool] = None
    liquidity_usd: Optional[float] = None
    is_verified: Optional[bool] = None
    is_trending: Optional[bool] = None
    safety_score: Optional[int] = None
    risk_level: Optional[str] = None
    # Interop fields
    is_superchain_erc20: Optional[bool] = None
    is_interop_ready: Optional[bool] = None
    interop_score: Optional[int] = None
    canonical_address: Optional[str] = None


class ChainInfo(BaseModel):
    """Chain information in token response."""
    id: int
    name: str
    slug: str
    chain_id: int
    
    class Config:
        from_attributes = True


class TokenResponse(TokenBase):
    """Schema for token response."""
    id: int
    chain_id: int
    chain: ChainInfo
    price_usd: Optional[float] = None
    price_change_24h: Optional[float] = None
    volume_24h: Optional[float] = None
    market_cap: Optional[float] = None
    has_liquidity: bool = False
    liquidity_usd: Optional[float] = None
    is_verified: bool = False
    is_trending: bool = False
    safety_score: Optional[int] = None
    risk_level: Optional[str] = None
    # Superchain Interop
    is_superchain_erc20: bool = False
    is_interop_ready: bool = False
    interop_score: Optional[int] = None
    canonical_address: Optional[str] = None
    # Timestamps
    created_at_on_chain: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InteropTokenResponse(BaseModel):
    """Response for interop token check."""
    address: str
    chain: str
    is_superchain_erc20: bool
    is_interop_ready: bool
    interop_score: int
    has_crosschain_mint: bool = False
    has_crosschain_burn: bool = False
    canonical_address: Optional[str] = None
    cross_chain_addresses: Optional[dict] = None


class TokenListQuery(BaseModel):
    """Query parameters for token list endpoint."""
    chain: Optional[str] = None  # Chain slug
    search: Optional[str] = None  # Search by name or symbol
    sort: Optional[str] = "volume_24h"  # Sort field: volume_24h, price_change_24h, etc.
    limit: int = 20
    offset: int = 0


class TokenListResponse(BaseModel):
    """Response for token list endpoint."""
    items: List[TokenResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


class PriceHistoryPoint(BaseModel):
    """Single price history data point."""
    timestamp: datetime
    price_usd: float
    volume_24h: Optional[float] = None
    market_cap: Optional[float] = None
    
    class Config:
        from_attributes = True


class PriceHistoryResponse(BaseModel):
    """Response for price history endpoint."""
    token_id: int
    range: str  # "24h", "7d", "30d"
    data: List[PriceHistoryPoint]


class PriceHistoryQuery(BaseModel):
    """Query parameters for price history endpoint."""
    range: str = "24h"  # "24h", "7d", "30d"
