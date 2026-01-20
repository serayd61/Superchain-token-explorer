"""RPC client wrapper for blockchain interactions."""
from web3 import Web3
from typing import Optional, Dict, Any
import time


class RPCClient:
    """RPC client wrapper with connection pooling and retry logic."""
    
    def __init__(self, rpc_url: Optional[str] = None):
        """Initialize RPC client."""
        if not rpc_url:
            raise ValueError("RPC URL is required")
        self.rpc_url = rpc_url
        self._w3: Optional[Web3] = None
    
    @property
    def w3(self) -> Web3:
        """Get Web3 instance, creating if needed."""
        if self._w3 is None:
            self._w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if not self._w3.is_connected():
                raise ConnectionError(f"Failed to connect to RPC: {self.rpc_url}")
        return self._w3
    
    def call_with_retry(self, func, max_retries: int = 3, delay: float = 1.0, *args, **kwargs):
        """Call a function with retry logic."""
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                time.sleep(delay * (attempt + 1))
                # Reconnect on retry
                self._w3 = None
        return None
    
    def get_block_number(self) -> int:
        """Get latest block number."""
        return self.call_with_retry(lambda: self.w3.eth.block_number)
    
    def get_balance(self, address: str) -> int:
        """Get ETH balance for an address."""
        return self.call_with_retry(
            lambda: self.w3.eth.get_balance(Web3.to_checksum_address(address))
        )
    
    def call_contract(self, address: str, abi: list, function_name: str, *args) -> Any:
        """Call a contract function."""
        contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(address),
            abi=abi
        )
        func = getattr(contract.functions, function_name)
        return self.call_with_retry(lambda: func(*args).call())
