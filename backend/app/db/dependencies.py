"""FastAPI dependencies for database."""
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

# Re-export get_db for convenience
__all__ = ["get_db", "Depends", "Session"]
