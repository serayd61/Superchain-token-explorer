from datetime import datetime
from web3 import Web3
import pandas as pd
import os

# Connect to Base chain RPC
w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))

# AlienBase DEX (UniswapV2 style) factory + WETH address on Base
UNISWAP_FACTORY = Web3.toChecksumAddress("0x327Df1E6de05895d2ab08513aaDD9313Fe505d86")
WETH_ADDRESS = Web3.toChecksumAddress("0x4200000000000000000000000000000000000006")

# Minimal ABI for getPair()
FACTORY_ABI = [
    {
        "constant": True,
        "inputs": [
            {"internalType": "address", "name": "tokenA", "type": "address"},
            {"internalType": "address", "name": "tokenB", "type": "address"}
        ],
        "name": "getPair",
        "outputs": [{"internalType": "address", "name": "pair", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Function to check LP existence
def check_lp_exists(token_address: str) -> str:
    try:
        token_address = Web3.toChecksumAddress(token_address)
        factory = w3.eth.contract(address=UNISWAP_FACTORY, abi=FACTORY_ABI)
        pair = factory.functions.getPair(token_address, WETH_ADDRESS).call()
        return "YES" if int(pair, 16) != 0 else "NO"
    except Exception:
        return "ERROR"

# Scan last 50 blocks
latest_block = w3.eth.block_number
start_block = latest_block - 50
results = []

print(f"🔍 Scanning blocks {start_block} to {latest_block}...")

for block_num in range(start_block, latest_block + 1):
    try:
        block = w3.eth.get_block(block_num, full_transactions=True)
        for tx in block.transactions:
            if tx.to is None:
                deployer = tx["from"]
                results.append({
                    "chain": "base",
                    "block": block_num,
                    "hash": tx.hash.hex(),
                    "from": deployer,
                    "timestamp": datetime.utcfromtimestamp(block.timestamp).isoformat(),
                    "lp_status": check_lp_exists(deployer)
                })
    except Exception as e:
        print(f"⚠️ Block {block_num} failed: {e}")
        continue

# Save results to public/ directory
df = pd.DataFrame(results)
output_path = os.path.join("..", "public", "base_tokenlar_lp.json")
df.to_json(output_path, orient="records", indent=2)

print(f"✅ Saved: {output_path}")
