from web3 import Web3
from datetime import datetime
from eth_abi import decode_abi

# UniswapV2 Pair Swap Event Signature
SWAP_TOPIC = Web3.keccak(text="Swap(address,uint256,uint256,uint256,uint256,address)").hex()

# WETH address on Base
WETH_ADDRESS = Web3.to_checksum_address("0x4200000000000000000000000000000000000006")

def get_price_history(w3: Web3, pair_address: str, from_timestamp: int, to_timestamp: int, max_events=100):
    try:
        pair_address = Web3.to_checksum_address(pair_address)

        logs = w3.eth.get_logs({
            "address": pair_address,
            "topics": [SWAP_TOPIC],
            "fromBlock": "latest",
            "toBlock": "latest"
        })

        prices = []
        for log in logs[:max_events]:
            block = w3.eth.get_block(log.blockNumber)
            timestamp = block.timestamp

            if timestamp < from_timestamp or timestamp > to_timestamp:
                continue

            data = log["data"]
            decoded = decode_abi(["uint256", "uint256", "uint256", "uint256"], bytes.fromhex(data[2:]))

            amount0_in, amount1_in, amount0_out, amount1_out = decoded
            if amount0_in > 0 and amount1_out > 0:
                price = amount1_out / amount0_in
            elif amount1_in > 0 and amount0_out > 0:
                price = amount0_out / amount1_in
            else:
                continue

            prices.append({
                "timestamp": datetime.utcfromtimestamp(timestamp).isoformat(),
                "price": float(price)
            })

        return prices

    except Exception as e:
        print(f"Error fetching price history: {e}")
        return []
