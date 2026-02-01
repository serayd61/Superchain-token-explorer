"""SuperchainERC20 and Interop token detection.

This module detects tokens that are compatible with Superchain Interop,
allowing cross-chain transfers within the Superchain ecosystem.

Reference: https://specs.optimism.io/interop/overview.html
"""
from typing import Dict, Any, Optional, List
from web3 import Web3
from app.ingestion.config import get_chain_config, get_active_chains, CHAIN_CONFIGS

# SuperchainERC20 interface signatures
# These are the key functions that identify a SuperchainERC20 token
SUPERCHAIN_ERC20_SIGNATURES = {
    # Standard ERC20
    "name()": "0x06fdde03",
    "symbol()": "0x95d89b41",
    "decimals()": "0x313ce567",
    "totalSupply()": "0x18160ddd",
    "balanceOf(address)": "0x70a08231",
    "transfer(address,uint256)": "0xa9059cbb",
    "approve(address,uint256)": "0x095ea7b3",
    "allowance(address,address)": "0xdd62ed3e",
    "transferFrom(address,address,uint256)": "0x23b872dd",
    
    # SuperchainERC20 specific
    "crosschainMint(address,uint256)": "0x2b8c49e3",
    "crosschainBurn(address,uint256)": "0x2b0a7032",
    "REMOTE_TOKEN()": "0x033964be",
    "BRIDGE()": "0xee9a31a2",
}

# Known SuperchainERC20 tokens (canonical addresses)
KNOWN_SUPERCHAIN_TOKENS = {
    "USDC": {
        "canonical": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  # Ethereum
        "superchain_addresses": {
            "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            "optimism": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
            "mode": "0xd988097fb8612cc24eeC14542bC03424c656005f",
        },
        "is_interop_ready": True,
    },
    "WETH": {
        "canonical": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # Ethereum
        "superchain_addresses": {
            # Standard OP Stack WETH address
            "all": "0x4200000000000000000000000000000000000006",
        },
        "is_interop_ready": True,
    },
    "OP": {
        "canonical": "0x4200000000000000000000000000000000000042",  # Optimism
        "superchain_addresses": {
            "optimism": "0x4200000000000000000000000000000000000042",
        },
        "is_interop_ready": False,  # Native to Optimism only
    },
}

# Standard bridge addresses
SUPERCHAIN_BRIDGE_ADDRESSES = {
    "L2StandardBridge": "0x4200000000000000000000000000000000000010",
    "L2CrossDomainMessenger": "0x4200000000000000000000000000000000000007",
    "L2ToL1MessagePasser": "0x4200000000000000000000000000000000000016",
}


class InteropDetector:
    """Detect SuperchainERC20 and interop-compatible tokens."""
    
    def __init__(self, chain_slug: str):
        """Initialize interop detector for a chain."""
        self.chain_slug = chain_slug
        self.config = get_chain_config(chain_slug)
        if not self.config:
            raise ValueError(f"Unknown chain: {chain_slug}")
        
        rpc_url = self.config.get("rpc_url")
        if not rpc_url:
            raise ValueError(f"No RPC URL configured for {chain_slug}")
        
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.chain_id = self.config.get("chain_id")
    
    def check_superchain_erc20(self, token_address: str) -> Dict[str, Any]:
        """Check if a token implements SuperchainERC20 interface.
        
        Returns:
            Dict with interop compatibility information
        """
        result = {
            "address": token_address,
            "chain": self.chain_slug,
            "is_superchain_erc20": False,
            "has_crosschain_mint": False,
            "has_crosschain_burn": False,
            "has_remote_token": False,
            "has_bridge": False,
            "bridge_address": None,
            "remote_token_address": None,
            "interop_score": 0,  # 0-100
        }
        
        try:
            address = Web3.to_checksum_address(token_address)
            
            # Check for crosschainMint function
            try:
                code = self.w3.eth.get_code(address)
                code_hex = code.hex()
                
                # Check for SuperchainERC20 function signatures in bytecode
                if SUPERCHAIN_ERC20_SIGNATURES["crosschainMint(address,uint256)"][2:] in code_hex:
                    result["has_crosschain_mint"] = True
                    result["interop_score"] += 30
                
                if SUPERCHAIN_ERC20_SIGNATURES["crosschainBurn(address,uint256)"][2:] in code_hex:
                    result["has_crosschain_burn"] = True
                    result["interop_score"] += 30
                
                if SUPERCHAIN_ERC20_SIGNATURES["REMOTE_TOKEN()"][2:] in code_hex:
                    result["has_remote_token"] = True
                    result["interop_score"] += 20
                
                if SUPERCHAIN_ERC20_SIGNATURES["BRIDGE()"][2:] in code_hex:
                    result["has_bridge"] = True
                    result["interop_score"] += 20
                
            except Exception as e:
                print(f"Error checking bytecode: {e}")
            
            # Determine if it's a SuperchainERC20
            if result["has_crosschain_mint"] and result["has_crosschain_burn"]:
                result["is_superchain_erc20"] = True
            
            # Check if it's a known interop token
            for symbol, token_info in KNOWN_SUPERCHAIN_TOKENS.items():
                addresses = token_info.get("superchain_addresses", {})
                if addresses.get("all") == token_address.lower() or \
                   addresses.get(self.chain_slug) == token_address.lower():
                    result["is_known_interop_token"] = True
                    result["canonical_symbol"] = symbol
                    result["interop_score"] = max(result["interop_score"], 80)
                    break
            
        except Exception as e:
            print(f"Error checking SuperchainERC20: {e}")
        
        return result
    
    def get_bridge_info(self, token_address: str) -> Optional[Dict[str, Any]]:
        """Get bridge information for a token."""
        try:
            # Check if token uses standard bridge
            bridge_address = SUPERCHAIN_BRIDGE_ADDRESSES["L2StandardBridge"]
            
            return {
                "bridge_type": "L2StandardBridge",
                "bridge_address": bridge_address,
                "messenger_address": SUPERCHAIN_BRIDGE_ADDRESSES["L2CrossDomainMessenger"],
            }
        except Exception as e:
            print(f"Error getting bridge info: {e}")
            return None


def find_cross_chain_token(
    symbol: str,
    source_chain: str
) -> Dict[str, Any]:
    """Find the same token across different Superchain networks.
    
    Args:
        symbol: Token symbol (e.g., "USDC")
        source_chain: Chain where token was found
        
    Returns:
        Dict with cross-chain token information
    """
    result = {
        "symbol": symbol,
        "source_chain": source_chain,
        "cross_chain_addresses": {},
        "is_interop_ready": False,
    }
    
    # Check known tokens first
    if symbol.upper() in KNOWN_SUPERCHAIN_TOKENS:
        token_info = KNOWN_SUPERCHAIN_TOKENS[symbol.upper()]
        result["canonical_address"] = token_info.get("canonical")
        result["is_interop_ready"] = token_info.get("is_interop_ready", False)
        
        addresses = token_info.get("superchain_addresses", {})
        if "all" in addresses:
            # Same address on all chains
            for chain_slug in CHAIN_CONFIGS.keys():
                result["cross_chain_addresses"][chain_slug] = addresses["all"]
        else:
            result["cross_chain_addresses"] = addresses
    
    return result


def get_interop_ready_tokens() -> List[Dict[str, Any]]:
    """Get list of all known interop-ready tokens."""
    tokens = []
    
    for symbol, info in KNOWN_SUPERCHAIN_TOKENS.items():
        if info.get("is_interop_ready"):
            tokens.append({
                "symbol": symbol,
                "canonical_address": info.get("canonical"),
                "superchain_addresses": info.get("superchain_addresses", {}),
            })
    
    return tokens


def check_token_interop_status(
    token_address: str,
    chain_slug: str
) -> Dict[str, Any]:
    """Check interop status for a token.
    
    Convenience function that combines all checks.
    """
    try:
        detector = InteropDetector(chain_slug)
        result = detector.check_superchain_erc20(token_address)
        
        # Add bridge info
        bridge_info = detector.get_bridge_info(token_address)
        if bridge_info:
            result["bridge_info"] = bridge_info
        
        return result
    except Exception as e:
        return {
            "address": token_address,
            "chain": chain_slug,
            "error": str(e),
            "is_superchain_erc20": False,
        }
