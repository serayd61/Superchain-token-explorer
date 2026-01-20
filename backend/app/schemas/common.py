"""Common Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaginationParams(BaseModel):
    """Pagination query parameters."""
    limit: int = 20
    offset: int = 0
    
    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    total: int
    limit: int
    offset: int
    has_more: bool
    
    class Config:
        from_attributes = True
