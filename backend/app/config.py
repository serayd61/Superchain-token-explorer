"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://superchain:password@localhost:5432/superchain_explorer"
    
    # ============================================
    # SUPERCHAIN RPC URLs (19 Eligible Chains)
    # ============================================
    
    # Primary Chains (Active)
    chain_base_rpc_url: Optional[str] = "https://mainnet.base.org"
    chain_optimism_rpc_url: Optional[str] = "https://mainnet.optimism.io"
    chain_ink_rpc_url: Optional[str] = "https://rpc-gel.inkonchain.com"
    chain_mode_rpc_url: Optional[str] = "https://mainnet.mode.network"
    chain_zora_rpc_url: Optional[str] = "https://rpc.zora.energy"
    
    # New Superchain Networks
    chain_unichain_rpc_url: Optional[str] = "https://mainnet.unichain.org"
    chain_world_rpc_url: Optional[str] = "https://worldchain-mainnet.g.alchemy.com/public"
    chain_soneium_rpc_url: Optional[str] = "https://rpc.soneium.org"
    chain_swell_rpc_url: Optional[str] = "https://swell-mainnet.alt.technology"
    chain_lisk_rpc_url: Optional[str] = "https://rpc.api.lisk.com"
    chain_mint_rpc_url: Optional[str] = "https://rpc.mintchain.io"
    chain_bob_rpc_url: Optional[str] = "https://rpc.gobob.xyz"
    chain_shape_rpc_url: Optional[str] = "https://mainnet.shape.network"
    chain_metal_rpc_url: Optional[str] = "https://rpc.metall2.com"
    chain_polynomial_rpc_url: Optional[str] = "https://rpc.polynomial.fi"
    chain_superseed_rpc_url: Optional[str] = "https://mainnet.superseed.xyz"
    chain_race_rpc_url: Optional[str] = "https://racemainnet.io"
    chain_arena_z_rpc_url: Optional[str] = "https://rpc.arena-z.gg"
    chain_epic_rpc_url: Optional[str] = "https://mainnet.ethernity.io"
    
    # External APIs
    coingecko_api_key: Optional[str] = None
    dexscreener_api_key: Optional[str] = None
    
    # App settings
    app_name: str = "Superchain Token Explorer API"
    app_version: str = "2.0.0"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
