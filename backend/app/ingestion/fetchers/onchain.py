"""On-chain data fetcher for ERC-20 tokens."""
from typing import Dict, Optional, Any
from app.ingestion.fetchers.rpc import RPCClient

# Standard ERC-20 ABI (minimal: name, symbol, decimals, totalSupply)
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]


class OnChainFetcher:
    """Fetcher for on-chain ERC-20 token data."""
    
    def __init__(self, rpc_client: RPCClient):
        """Initialize on-chain fetcher."""
        self.rpc = rpc_client
    
    def fetch_token_metadata(self, address: str) -> Optional[Dict[str, Any]]:
        """Fetch ERC-20 token metadata from on-chain."""
        try:
            # Normalize address
            address = self.rpc.w3.to_checksum_address(address)
            
            # Fetch token data
            name = self.rpc.call_contract(address, ERC20_ABI, "name")
            symbol = self.rpc.call_contract(address, ERC20_ABI, "symbol")
            decimals = self.rpc.call_contract(address, ERC20_ABI, "decimals")
            total_supply = self.rpc.call_contract(address, ERC20_ABI, "totalSupply")
            
            return {
                "address": address,
                "name": name,
                "symbol": symbol,
                "decimals": decimals,
                "total_supply": str(total_supply),
            }
        except Exception as e:
            print(f"Error fetching token metadata for {address}: {e}")
            return None
    
    def get_token_deployment_info(self, address: str) -> Optional[Dict[str, Any]]:
        """Get token deployment information (block number, transaction hash)."""
        try:
            # This would require scanning blocks or using an indexer
            # For now, return None (can be implemented later)
            return None
        except Exception as e:
            print(f"Error fetching deployment info for {address}: {e}")
            return None
