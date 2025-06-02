# simple_scanner.py - Gerçek Contract Deployment Scanner
from web3 import Web3
from datetime import datetime
import json
import time

class SimpleContractScanner:
    def __init__(self):
        # Base chain ile başlayalım (en stabil)
        self.w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
        self.chain_name = "base"
        
    def scan_latest_blocks(self, block_count=5):
        """Son N bloku tarayarak contract deployment'ları bul"""
        print(f"🔍 Scanning last {block_count} blocks on {self.chain_name}...")
        
        try:
            latest_block = self.w3.eth.block_number
            start_block = latest_block - block_count
            print(f"📊 Scanning blocks {start_block} to {latest_block}")
            
            results = []
            
            for block_num in range(start_block, latest_block + 1):
                print(f"📦 Scanning block {block_num}...")
                
                try:
                    # Block'u transaction'larıyla beraber al
                    block = self.w3.eth.get_block(block_num, full_transactions=True)
                    print(f"   Found {len(block.transactions)} transactions")
                    
                    for i, tx in enumerate(block.transactions):
                        # Contract deployment transaction'ı: to == None
                        if tx.to is None:
                            print(f"🆕 Contract deployment found in tx {i}!")
                            
                            # Transaction receipt'ini al
                            try:
                                receipt = self.w3.eth.get_transaction_receipt(tx.hash)
                                
                                if receipt.contractAddress:
                                    contract_data = {
                                        "chain": self.chain_name,
                                        "block": block_num,
                                        "transaction_hash": tx.hash.hex(),
                                        "contract_address": receipt.contractAddress,
                                        "deployer": tx["from"],
                                        "gas_used": receipt.gasUsed,
                                        "timestamp": datetime.utcfromtimestamp(block.timestamp).isoformat(),
                                        "block_timestamp": block.timestamp
                                    }
                                    
                                    results.append(contract_data)
                                    print(f"   📋 Contract: {receipt.contractAddress}")
                                    print(f"   👤 Deployer: {tx['from']}")
                                    print(f"   ⛽ Gas used: {receipt.gasUsed}")
                                    
                            except Exception as e:
                                print(f"   ⚠️ Receipt error: {e}")
                                
                except Exception as e:
                    print(f"⚠️ Block {block_num} error: {e}")
                    
                # Rate limiting
                time.sleep(0.5)
            
            print(f"\n✅ Scan complete! Found {len(results)} contract deployments")
            return results
            
        except Exception as e:
            print(f"❌ Scanning error: {e}")
            return []

def main():
    print("🚀 Simple Contract Scanner Starting...")
    
    scanner = SimpleContractScanner()
    
    # Test: Son 5 bloku tara (fazla yapmayalım rate limiting için)
    contracts = scanner.scan_latest_blocks(5)
    
    if contracts:
        print(f"\n📋 Found {len(contracts)} contract deployments:")
        
        for i, contract in enumerate(contracts, 1):
            print(f"\n{i}. Contract Deployment:")
            print(f"   Address: {contract['contract_address']}")
            print(f"   Deployer: {contract['deployer']}")
            print(f"   Block: {contract['block']}")
            print(f"   Time: {contract['timestamp']}")
        
        # JSON'a kaydet
        with open("contract_deployments.json", "w") as f:
            json.dump(contracts, f, indent=2)
        
        print(f"\n💾 Results saved to contract_deployments.json")
        
    else:
        print("No contract deployments found in recent blocks.")
        print("This is normal - not every block has contract deployments.")

if __name__ == "__main__":
    main()
