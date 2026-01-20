"""TokenPrice model for time-series price data."""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class TokenPrice(Base):
    """TokenPrice model for storing historical price and volume data."""
    
    __tablename__ = "token_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("tokens.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    price_usd = Column(Float, nullable=False)
    volume_24h = Column(Float, nullable=True)
    tvl = Column(Float, nullable=True)  # Total Value Locked
    market_cap = Column(Float, nullable=True)
    
    # Relationships
    token = relationship("Token", back_populates="price_history")
    
    # Composite index for efficient time-range queries
    __table_args__ = (
        Index("idx_token_price_timestamp", "token_id", "timestamp"),
    )
    
    def __repr__(self):
        return f"<TokenPrice(token_id={self.token_id}, price={self.price_usd}, timestamp={self.timestamp})>"
