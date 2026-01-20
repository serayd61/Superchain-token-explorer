"""TokenGroup model for grouping same tokens across different chains."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

# Association table for many-to-many relationship
token_group_members = Table(
    "token_group_members",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("token_groups.id", ondelete="CASCADE"), nullable=False),
    Column("token_id", Integer, ForeignKey("tokens.id", ondelete="CASCADE"), nullable=False),
    UniqueConstraint("group_id", "token_id", name="uq_group_token"),
)


class TokenGroup(Base):
    """TokenGroup model for grouping same token across multiple chains."""
    
    __tablename__ = "token_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    canonical_address = Column(String, nullable=True, index=True)  # Original token address (e.g., on Ethereum)
    canonical_symbol = Column(String, nullable=True, index=True)  # e.g., "USDC", "WETH"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    members = relationship("TokenGroupMember", back_populates="group", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TokenGroup(id={self.id}, canonical_symbol='{self.canonical_symbol}')>"


class TokenGroupMember(Base):
    """TokenGroupMember model for token-group association."""
    
    __tablename__ = "token_group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("token_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    token_id = Column(Integer, ForeignKey("tokens.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    group = relationship("TokenGroup", back_populates="members")
    token = relationship("Token", back_populates="group_members")
    
    def __repr__(self):
        return f"<TokenGroupMember(group_id={self.group_id}, token_id={self.token_id})>"
