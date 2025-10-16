export interface TokenContract {
  chain: string;
  chain_id: number;
  is_op_stack: boolean;
  block: number;
  hash: string;
  deployer: string;
  contract_address: string;
  timestamp: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: number;
  };
  lp_info: {
    v2: boolean;
    v3: boolean;
    status: string;
  };
  dex_data?: {
    price_usd: string;
    volume_24h: string;
    liquidity: string;
    dex: string;
  };
  explorer_url: string;
}
