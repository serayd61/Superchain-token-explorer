"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://superchain:password@localhost:5432/superchain_explorer"
    
    # Chain RPC URLs
    chain_base_rpc_url: Optional[str] = None
    chain_optimism_rpc_url: Optional[str] = None
    chain_mode_rpc_url: Optional[str] = None
    chain_zora_rpc_url: Optional[str] = None
    
    # External APIs
    coingecko_api_key: Optional[str] = None
    
    # App settings
    app_name: str = "Superchain Token Explorer API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
