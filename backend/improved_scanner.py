# improved_scanner.py - Rate Limiting ile Geliştirilmiş Scanner
from web3 import Web3
from datetime import datetime
import json
import time

class ImprovedScanner:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
        self.chain_name = "base"
        
        # ERC-20 ABI
        self.erc20_abi = [
            {"constant": True, "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
        ]
    
    def safe_contract_call(self, contract, function_name, delay=1):
        """Rate limiting ile güvenli contract call"""
        try:
            time.sleep(delay)  # Rate limiting
            result = getattr(contract.functions, function_name)().call()
            return result, None
        except Exception as e:
            return None, str(e)
    
    def check_token_with_retry(self, contract_address, max_retries=3):
        """Retry logic ile token kontrolü"""
        print(f"\n🔍 Checking {contract_address} (with retry logic)...")
        
        for attempt in range(max_retries):
            try:
                contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(contract_address), 
                    abi=self.erc20_abi
                )
                
                metadata = {}
                token_functions_working = 0
                
                # Name check
                name, error = self.safe_contract_call(contract, "name", delay=2)
                if name:
                    metadata["name"] = name
                    token_functions_working += 1
                    print(f"   ✅ Name: {name}")
                else:
                    print(f"   ❌ Name failed: {error}")
                
                # Symbol check
                symbol, error = self.safe_contract_call(contract, "symbol", delay=2)
                if symbol:
                    metadata["symbol"] = symbol
                    token_functions_working += 1
                    print(f"   ✅ Symbol: {symbol}")
                else:
                    print(f"   ❌ Symbol failed: {error}")
                
                # Decimals check
                decimals, error = self.safe_contract_call(contract, "decimals", delay=2)
                if decimals is not None:
                    metadata["decimals"] = decimals
                    token_functions_working += 1
                    print(f"   ✅ Decimals: {decimals}")
                else:
                    print(f"   ❌ Decimals failed: {error}")
                
                # Total Supply check
                total_supply, error = self.safe_contract_call(contract, "totalSupply", delay=2)
                if total_supply is not None:
                    metadata["totalSupply"] = total_supply
                    token_functions_working += 1
                    
                    if decimals:
                        readable = total_supply / (10 ** decimals)
                        metadata["readableSupply"] = readable
                        print(f"   ✅ Supply: {readable:,.2f} {symbol or 'tokens'}")
                    else:
                        print(f"   ✅ Supply: {total_supply}")
                else:
                    print(f"   ❌ Total Supply failed: {error}")
                
                # Token olup olmadığını belirle
                is_token = token_functions_working >= 2  # En az 2 function çalışmalı
                metadata["is_token"] = is_token
                metadata["functions_working"] = token_functions_working
                
                if is_token:
                    print(f"   🎯 TOKEN FOUND! {metadata.get('symbol', 'UNKNOWN')}")
                else:
                    print(f"   ℹ️ Not a standard ERC-20 token ({token_functions_working}/4 functions work)")
                
                return metadata
                
            except Exception as e:
                print(f"   ⚠️ Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    print(f"   🔄 Retrying in 5 seconds...")
                    time.sleep(5)
                else:
                    print(f"   ❌ All attempts failed")
                    return {"is_token": False, "error": str(e), "attempts": max_retries}

def main():
    print("🚀 Improved Scanner with Rate Limiting...")
    
    # Daha fazla block tarayalım, belki daha yeni token buluruz
    scanner = ImprovedScanner()
    
    print("📊 First, let's scan more recent blocks for new contracts...")
    
    try:
        latest_block = scanner.w3.eth.block_number
        start_block = latest_block - 20  # Son 20 block
        
        print(f"🔍 Scanning blocks {start_block} to {latest_block}")
        
        found_contracts = []
        
        for block_num in range(start_block, latest_block + 1):
            print(f"📦 Block {block_num}...", end="")
            
            try:
                block = scanner.w3.eth.get_block(block_num, full_transactions=True)
                contract_count = 0
                
                for tx in block.transactions:
                    if tx.to is None:  # Contract deployment
                        receipt = scanner.w3.eth.get_transaction_receipt(tx.hash)
                        if receipt.contractAddress:
                            found_contracts.append({
                                "address": receipt.contractAddress,
                                "block": block_num,
                                "deployer": tx["from"]
                            })
                            contract_count += 1
                
                print(f" {contract_count} contracts")
                time.sleep(0.5)  # Rate limiting
                
            except Exception as e:
                print(f" Error: {e}")
        
        print(f"\n📋 Found {len(found_contracts)} total contracts")
        
        # İlk 3 contract'ı kontrol et (rate limiting için)
        contracts_to_check = found_contracts[:3]
        
        if contracts_to_check:
            print(f"\n🔍 Checking first {len(contracts_to_check)} contracts for tokens...")
            
            results = []
            for i, contract_info in enumerate(contracts_to_check, 1):
                print(f"\n--- Contract {i}/{len(contracts_to_check)} ---")
                metadata = scanner.check_token_with_retry(contract_info["address"])
                
                result = {
                    "contract_address": contract_info["address"],
                    "block": contract_info["block"],
                    "deployer": contract_info["deployer"],
                    "metadata": metadata
                }
                results.append(result)
            
            # Sonuçları kaydet
            with open("improved_scan_results.json", "w") as f:
                json.dump(results, f, indent=2)
            
            print(f"\n💾 Results saved to improved_scan_results.json")
            
            # Token summary
            tokens = [r for r in results if r["metadata"].get("is_token")]
            print(f"\n🎯 SUMMARY: Found {len(tokens)} tokens out of {len(results)} contracts!")
            
            for token in tokens:
                meta = token["metadata"]
                print(f"   TOKEN: {meta.get('name', 'Unknown')} ({meta.get('symbol', 'UNKNOWN')})")
        else:
            print("No new contracts found in recent blocks.")
            
    except Exception as e:
        print(f"❌ Scanner error: {e}")

if __name__ == "__main__":
    main()