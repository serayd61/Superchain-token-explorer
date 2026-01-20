"""Token model."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class Token(Base):
    """Token model representing ERC-20 tokens on Superchain networks."""
    
    __tablename__ = "tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    chain_id = Column(Integer, ForeignKey("chains.id"), nullable=False, index=True)
    address = Column(String, nullable=False, index=True)  # Contract address
    symbol = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    decimals = Column(Integer, nullable=False, default=18)
    created_at_on_chain = Column(DateTime(timezone=True), nullable=True)
    
    # Deployment info (optional, can be populated later)
    deployer = Column(String, nullable=True, index=True)
    block_number = Column(Integer, nullable=True)
    transaction_hash = Column(String, nullable=True)
    
    # Token metadata
    total_supply = Column(String, nullable=True)  # Stored as string for large numbers
    
    # Liquidity info
    has_liquidity = Column(Boolean, default=False, nullable=False, index=True)
    v2_pools = Column(ARRAY(String), nullable=True)  # Array of V2 pool addresses
    v3_pools = Column(ARRAY(String), nullable=True)  # Array of V3 pool addresses
    liquidity_usd = Column(Float, nullable=True)
    
    # Price data (latest snapshot)
    price_usd = Column(Float, nullable=True, index=True)
    volume_24h = Column(Float, nullable=True, index=True)
    market_cap = Column(Float, nullable=True)
    
    # Safety analysis
    safety_score = Column(Integer, nullable=True, index=True)  # 0-100
    risk_level = Column(String, nullable=True, index=True)  # RiskLevel enum as string
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    is_trending = Column(Boolean, default=False, nullable=False, index=True)
    is_honeypot = Column(Boolean, default=False, nullable=False)
    has_blacklist = Column(Boolean, default=False, nullable=False)
    has_mint_function = Column(Boolean, default=False, nullable=False)
    
    # Trading restrictions
    max_tx_amount = Column(String, nullable=True)
    buy_tax_percent = Column(Float, nullable=True)
    sell_tax_percent = Column(Float, nullable=True)
    
    # Holder analysis
    holder_count = Column(Integer, nullable=True)
    top_holders_percent = Column(Float, nullable=True)
    
    # Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    chain = relationship("Chain", back_populates="tokens")
    price_history = relationship("TokenPrice", back_populates="token", cascade="all, delete-orphan")
    group_members = relationship("TokenGroupMember", back_populates="token", cascade="all, delete-orphan")
    
    # Composite unique constraint: address must be unique per chain
    __table_args__ = (
        UniqueConstraint('chain_id', 'address', name='uq_token_chain_address'),
    )
    
    def __repr__(self):
        return f"<Token(id={self.id}, symbol='{self.symbol}', address='{self.address[:10]}...')>"
