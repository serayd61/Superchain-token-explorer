
from datetime import datetime
import os
import json
import requests
import pandas as pd
import matplotlib.pyplot as plt
from web3 import Web3

# RPC & DEX Info
w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
UNISWAP_FACTORY = Web3.toChecksumAddress("0x327Df1E6de05895d2ab08513aaDD9313Fe505d86")
WETH_ADDRESS = Web3.toChecksumAddress("0x4200000000000000000000000000000000000006")

FACTORY_ABI = [{
    "constant": True,
    "inputs": [
        {"internalType": "address", "name": "tokenA", "type": "address"},
        {"internalType": "address", "name": "tokenB", "type": "address"}
    ],
    "name": "getPair",
    "outputs": [{"internalType": "address", "name": "pair", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}]

def check_lp_exists(token_address: str) -> str:
    try:
        token_address = Web3.toChecksumAddress(token_address)
        factory = w3.eth.contract(address=UNISWAP_FACTORY, abi=FACTORY_ABI)
        pair = factory.functions.getPair(token_address, WETH_ADDRESS).call()
        return "YES" if int(pair, 16) != 0 else "NO"
    except:
        return "ERROR"

def fetch_price_data(token_address: str) -> list:
    try:
        url = f"https://api.dexscreener.com/latest/dex/pairs/base/{token_address}"
        response = requests.get(url)
        data = response.json()
        if "pairs" not in data or not data["pairs"]:
            return []
        history = data["pairs"][0].get("priceUsdHistory", [])
        return history[-12:] if len(history) > 0 else []
    except:
        return []

def draw_price_chart(prices: list, token_address: str):
    if not prices:
        return
    times = [i for i in range(len(prices))]
    plt.figure()
    plt.plot(times, prices, marker='o')
    plt.title(f"Price chart: {token_address[:6]}...")
    plt.xlabel("Interval")
    plt.ylabel("Price (USD)")
    plt.tight_layout()
    chart_path = f"../public/charts/{token_address}.png"
    os.makedirs(os.path.dirname(chart_path), exist_ok=True)
    plt.savefig(chart_path)
    plt.close()

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
                contract = tx["creates"] if "creates" in tx and tx["creates"] else deployer
                lp_status = check_lp_exists(contract)
                prices = fetch_price_data(contract)
                draw_price_chart(prices, contract)

                results.append({
                    "chain": "base",
                    "block": block_num,
                    "hash": tx.hash.hex(),
                    "from": deployer,
                    "timestamp": datetime.utcfromtimestamp(block.timestamp).isoformat(),
                    "lp_status": lp_status,
                    "price_chart": f"charts/{contract}.png" if prices else "none"
                })
    except Exception as e:
        print(f"Error on block {block_num}: {e}")

df = pd.DataFrame(results)
os.makedirs("../public", exist_ok=True)
df.to_json("../public/base_tokenlar_lp.json", orient="records", indent=2)
print("✅ Saved with charts.")
