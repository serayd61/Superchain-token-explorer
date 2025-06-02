
# token_checker.py - Contract'ların Token Olup Olmadığını Kontrol Et
from web3 import Web3
import json

class TokenChecker:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
        
        # ERC-20 ABI (basic functions)
        self.erc20_abi = [
            {"constant": True, "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
        ]
    
    def check_if_token(self, contract_address):
        """Contract'ın ERC-20 token olup olmadığını kontrol et"""
        print(f"\n🔍 Checking {contract_address}...")
        
        try:
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(contract_address), 
                abi=self.erc20_abi
            )
            
            metadata = {}
            is_token = True
            
            # Name function'ını dene
            try:
                metadata["name"] = contract.functions.name().call()
                print(f"   ✅ Name: {metadata['name']}")
            except Exception as e:
                print(f"   ❌ Name function failed: {e}")
                is_token = False
                
            # Symbol function'ını dene
            try:
                metadata["symbol"] = contract.functions.symbol().call()
                print(f"   ✅ Symbol: {metadata['symbol']}")
            except Exception as e:
                print(f"   ❌ Symbol function failed: {e}")
                is_token = False
                
            # Decimals function'ını dene
            try:
                metadata["decimals"] = contract.functions.decimals().call()
                print(f"   ✅ Decimals: {metadata['decimals']}")
            except Exception as e:
                print(f"   ❌ Decimals function failed: {e}")
                is_token = False
                
            # Total Supply function'ını dene
            try:
                total_supply = contract.functions.totalSupply().call()
                metadata["totalSupply"] = total_supply
                # Human readable format
                if metadata.get("decimals"):
                    readable_supply = total_supply / (10 ** metadata["decimals"])
                    metadata["readableSupply"] = readable_supply
                    print(f"   ✅ Total Supply: {readable_supply:,.2f} {metadata.get('symbol', 'tokens')}")
                else:
                    print(f"   ✅ Total Supply: {total_supply}")
            except Exception as e:
                print(f"   ❌ Total Supply function failed: {e}")
                is_token = False
            
            if is_token:
                print(f"   🎯 This is a TOKEN! {metadata.get('symbol', 'UNKNOWN')}")
                metadata["is_token"] = True
            else:
                print(f"   ℹ️ Not a standard ERC-20 token")
                metadata["is_token"] = False
                
            return metadata
            
        except Exception as e:
            print(f"   ❌ Contract check error: {e}")
            return {"is_token": False, "error": str(e)}

def main():
    print("🚀 Token Checker Starting...")
    
    # Bulunan contract'ları kontrol et
    contracts_to_check = [
        "0x486299f1d2dFaDb3d2223BfBd9F5Da9c164d2896",
        "0x5f200c998DcD859291D817dFc519E8b65F7CE678"
    ]
    
    checker = TokenChecker()
    results = []
    
    for contract_address in contracts_to_check:
        metadata = checker.check_if_token(contract_address)
        
        result = {
            "contract_address": contract_address,
            "metadata": metadata,
            "checked_at": "2025-06-01T06:43:29"
        }
        results.append(result)
    
    # Sonuçları kaydet
    with open("token_check_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to token_check_results.json")
    
    # Özet
    tokens_found = [r for r in results if r["metadata"].get("is_token")]
    print(f"\n📊 Summary: {len(tokens_found)}/{len(results)} contracts are tokens!")
    
    for token in tokens_found:
        metadata = token["metadata"]
        print(f"🎯 TOKEN: {metadata.get('name', 'Unknown')} ({metadata.get('symbol', 'UNKNOWN')})")

if __name__ == "__main__":
    main()