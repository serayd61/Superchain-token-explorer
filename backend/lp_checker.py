# lp_checker.py - Liquidity Pool Detection
from web3 import Web3
import time

class LPChecker:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
        
        # Base network addresses
        self.WETH_ADDRESS = "0x4200000000000000000000000000000000000006"  # Base WETH
        
        # Uniswap V2 Factory on Base
        self.UNISWAP_V2_FACTORY = "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6"
        
        # Uniswap V3 Factory on Base  
        self.UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"
        
        # Factory ABI'ları
        self.v2_factory_abi = [{
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
        
        self.v3_factory_abi = [{
            "constant": True,
            "inputs": [
                {"internalType": "address", "name": "tokenA", "type": "address"},
                {"internalType": "address", "name": "tokenB", "type": "address"},
                {"internalType": "uint24", "name": "fee", "type": "uint24"}
            ],
            "name": "getPool",
            "outputs": [{"internalType": "address", "name": "pool", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }]
        
        # V3 fee tiers
        self.v3_fees = [500, 3000, 10000]  # 0.05%, 0.3%, 1%
    
    def check_v2_lp(self, token_address):
        """Uniswap V2 LP kontrolü"""
        try:
            factory = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.UNISWAP_V2_FACTORY),
                abi=self.v2_factory_abi
            )
            
            pair_address = factory.functions.getPair(
                Web3.to_checksum_address(token_address),
                Web3.to_checksum_address(self.WETH_ADDRESS)
            ).call()
            
            # Zero address check
            if int(pair_address, 16) == 0:
                return False, None
            else:
                return True, pair_address
                
        except Exception as e:
            print(f"   ⚠️ V2 LP check error: {e}")
            return False, None
    
    def check_v3_lp(self, token_address):
        """Uniswap V3 LP kontrolü (tüm fee tier'lar)"""
        try:
            factory = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.UNISWAP_V3_FACTORY),
                abi=self.v3_factory_abi
            )
            
            pools_found = []
            
            for fee in self.v3_fees:
                try:
                    pool_address = factory.functions.getPool(
                        Web3.to_checksum_address(token_address),
                        Web3.to_checksum_address(self.WETH_ADDRESS),
                        fee
                    ).call()
                    
                    if int(pool_address, 16) != 0:
                        pools_found.append({
                            "pool_address": pool_address,
                            "fee_tier": fee,
                            "fee_percent": fee / 10000
                        })
                        
                except Exception as e:
                    print(f"   ⚠️ V3 fee {fee} error: {e}")
            
            return len(pools_found) > 0, pools_found
            
        except Exception as e:
            print(f"   ⚠️ V3 LP check error: {e}")
            return False, []
    
    def check_token_liquidity(self, token_address, token_symbol="TOKEN"):
        """Token için tüm LP'leri kontrol et"""
        print(f"\n💧 Checking liquidity for {token_symbol} ({token_address})...")
        
        result = {
            "token_address": token_address,
            "token_symbol": token_symbol,
            "v2_lp": {"exists": False, "pair_address": None},
            "v3_lp": {"exists": False, "pools": []},
            "has_liquidity": False
        }
        
        # V2 kontrolü
        print("   🔍 Checking Uniswap V2...")
        time.sleep(1)
        v2_exists, v2_pair = self.check_v2_lp(token_address)
        
        if v2_exists:
            print(f"   ✅ V2 LP found: {v2_pair}")
            result["v2_lp"] = {"exists": True, "pair_address": v2_pair}
        else:
            print("   ❌ No V2 LP")
        
        # V3 kontrolü
        print("   🔍 Checking Uniswap V3...")
        time.sleep(1)
        v3_exists, v3_pools = self.check_v3_lp(token_address)
        
        if v3_exists:
            print(f"   ✅ V3 LP found: {len(v3_pools)} pools")
            for pool in v3_pools:
                print(f"      Pool: {pool['pool_address']} (Fee: {pool['fee_percent']}%)")
            result["v3_lp"] = {"exists": True, "pools": v3_pools}
        else:
            print("   ❌ No V3 LP")
        
        # Genel sonuç
        result["has_liquidity"] = v2_exists or v3_exists
        
        if result["has_liquidity"]:
            print(f"   🎯 {token_symbol} HAS LIQUIDITY!")
        else:
            print(f"   📝 {token_symbol} has no liquidity yet")
        
        return result

def main():
    print("🚀 LP Checker - Finding Liquidity Pools...")
    
    # Bulunan token'ları kontrol et
    tokens_to_check = [
        {"address": "0x6A7cd894859d6A4702298DB8d0aae63Bf462F491", "symbol": "ZORB"},
        {"address": "0x3704338bdC4BA6CD32A42E30b8F8D3A78be8b0A4", "symbol": "🚢SHIPX"}
    ]
    
    checker = LPChecker()
    results = []
    
    for token in tokens_to_check:
        lp_result = checker.check_token_liquidity(token["address"], token["symbol"])
        results.append(lp_result)
    
    # Sonuçları kaydet
    import json
    with open("lp_check_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 LP results saved to lp_check_results.json")
    
    # Özet
    tokens_with_lp = [r for r in results if r["has_liquidity"]]
    print(f"\n📊 LIQUIDITY SUMMARY:")
    print(f"   {len(tokens_with_lp)}/{len(results)} tokens have liquidity!")
    
    for token in tokens_with_lp:
        lp_types = []
        if token["v2_lp"]["exists"]:
            lp_types.append("V2")
        if token["v3_lp"]["exists"]:
            lp_types.append("V3")
        
        print(f"   🎯 {token['token_symbol']}: {', '.join(lp_types)} LP available")

if __name__ == "__main__":
    main()