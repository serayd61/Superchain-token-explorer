"""Chain model."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Chain(Base):
    """Chain model representing OP Stack / Superchain networks."""
    
    __tablename__ = "chains"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)  # e.g., "base", "optimism"
    chain_id = Column(Integer, nullable=False, unique=True)  # EVM chain ID
    rpc_url = Column(String, nullable=True)  # Optional, can come from config
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    tokens = relationship("Token", back_populates="chain", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Chain(id={self.id}, name='{self.name}', slug='{self.slug}')>"
