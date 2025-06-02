# test_rpc.py - RPC Bağlantılarını Test Et
from web3 import Web3
import time

def test_rpc_connection(chain_name, rpc_url):
    """RPC bağlantısını test et"""
    try:
        print(f"\n🔍 Testing {chain_name}...")
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Bağlantı test et
        is_connected = w3.is_connected()
        print(f"   Connection: {'✅ Connected' if is_connected else '❌ Failed'}")
        
        if is_connected:
            # Latest block
            latest_block = w3.eth.block_number
            print(f"   Latest block: {latest_block}")
            
            # Chain ID
            chain_id = w3.eth.chain_id
            print(f"   Chain ID: {chain_id}")
            
            return True
        else:
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("🚀 Testing RPC Connections for Superchain...")
    
    # RPC endpoints
    chains = {
        "Base": "https://mainnet.base.org",
        "OP Mainnet": "https://mainnet.optimism.io", 
        "Ethereum": "https://ethereum.publicnode.com"
    }
    
    results = {}
    
    for chain_name, rpc_url in chains.items():
        results[chain_name] = test_rpc_connection(chain_name, rpc_url)
        time.sleep(1)  # Rate limiting
    
    print(f"\n📊 Test Results Summary:")
    print("=" * 30)
    for chain, success in results.items():
        status = "✅ Working" if success else "❌ Failed"
        print(f"{chain}: {status}")

if __name__ == "__main__":
    main()