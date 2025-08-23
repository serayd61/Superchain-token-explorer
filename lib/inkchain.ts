export interface InkChainTransaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: string;
  to: string | null;
  value: string;
  gas_price: string;
  gas_used: string;
  gas_limit: string;
  status: string;
  method?: string;
  decoded_input?: any;
}

export interface InkChainTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
  total_supply: string;
  type: string;
  holder_count?: number;
  exchange_rate?: string;
}

export interface InkChainBlock {
  number: number;
  hash: string;
  timestamp: string;
  miner: string;
  size: number;
  gas_used: string;
  gas_limit: string;
  transactions_count: number;
}

export interface BlockscoutResponse<T> {
  data: T;
  next_page_params?: any;
}

export class InkChainAPI {
  private baseUrl = 'https://explorer.inkonchain.com/api/v2';

  constructor() {}

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ink Chain API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getStats(): Promise<{
    total_blocks: string;
    total_transactions: string;
    total_addresses: string;
    average_block_time: number;
    coin_price: string;
    coin_price_change_percentage: number;
  }> {
    return await this.makeRequest('/stats');
  }

  async getLatestBlocks(count = 10): Promise<InkChainBlock[]> {
    const response = await this.makeRequest<BlockscoutResponse<InkChainBlock[]>>(`/blocks?items_count=${count}`);
    return response.data;
  }

  async getBlockByNumber(blockNumber: number): Promise<InkChainBlock> {
    return await this.makeRequest(`/blocks/${blockNumber}`);
  }

  async getTransactionsByBlock(
    blockNumber: number,
    page = 1,
    itemsCount = 50
  ): Promise<InkChainTransaction[]> {
    const response = await this.makeRequest<BlockscoutResponse<InkChainTransaction[]>>(
      `/blocks/${blockNumber}/transactions?items_count=${itemsCount}&page=${page}`
    );
    return response.data;
  }

  async getTransaction(txHash: string): Promise<InkChainTransaction> {
    return await this.makeRequest(`/transactions/${txHash}`);
  }

  async getAddressInfo(address: string): Promise<{
    hash: string;
    implementation_name?: string;
    is_contract: boolean;
    is_verified: boolean;
    name?: string;
    proxy_type?: string;
    token?: InkChainTokenInfo;
    watchlist_names: any[];
  }> {
    return await this.makeRequest(`/addresses/${address}`);
  }

  async getAddressTransactions(
    address: string,
    page = 1,
    itemsCount = 50,
    filter = 'to|from'
  ): Promise<InkChainTransaction[]> {
    const response = await this.makeRequest<BlockscoutResponse<InkChainTransaction[]>>(
      `/addresses/${address}/transactions?filter=${filter}&items_count=${itemsCount}&page=${page}`
    );
    return response.data;
  }

  async getTokenInfo(tokenAddress: string): Promise<InkChainTokenInfo> {
    return await this.makeRequest(`/tokens/${tokenAddress}`);
  }

  async getTokenTransfers(
    tokenAddress: string,
    page = 1,
    itemsCount = 50
  ): Promise<Array<{
    block_hash: string;
    block_number: number;
    from: { hash: string; is_contract: boolean; implementation_name?: string };
    to: { hash: string; is_contract: boolean; implementation_name?: string };
    log_index: string;
    method: string;
    timestamp: string;
    token: InkChainTokenInfo;
    total: { decimals: string; value: string };
    tx_hash: string;
    type: string;
  }>> {
    const response = await this.makeRequest<BlockscoutResponse<any>>(
      `/tokens/${tokenAddress}/transfers?items_count=${itemsCount}&page=${page}`
    );
    return response.data;
  }

  async getTopTokens(page = 1, itemsCount = 50): Promise<InkChainTokenInfo[]> {
    const response = await this.makeRequest<BlockscoutResponse<InkChainTokenInfo[]>>(
      `/tokens?items_count=${itemsCount}&page=${page}`
    );
    return response.data;
  }

  async searchTokens(query: string): Promise<{
    items: Array<{
      address: string;
      name: string;
      symbol: string;
      token_type: string;
      is_verified_via_admin_panel: boolean;
    }>;
  }> {
    return await this.makeRequest(`/search?q=${encodeURIComponent(query)}`);
  }

  async getSmartContract(address: string): Promise<{
    abi: any[];
    compiler_version: string;
    constructor_args: string;
    creation_bytecode?: string;
    deployed_bytecode?: string;
    evm_version: string;
    is_blueprint: boolean;
    is_self_destructed: boolean;
    is_verified: boolean;
    is_verified_via_sourcify: boolean;
    language: string;
    name: string;
    optimization_enabled: boolean;
    optimization_runs: number;
    source_code: string;
  }> {
    return await this.makeRequest(`/smart-contracts/${address}`);
  }

  async getContractMethods(address: string): Promise<Array<{
    abi: any;
    method_id: string;
    names: string[];
  }>> {
    return await this.makeRequest(`/smart-contracts/${address}/methods-read`);
  }

  async scanForNewTokens(
    fromBlock: number,
    toBlock: number = fromBlock + 100
  ): Promise<{
    tokens: InkChainTokenInfo[];
    contracts: string[];
    transactions: number;
  }> {
    const tokens: InkChainTokenInfo[] = [];
    const contracts: string[] = [];
    let transactionCount = 0;

    for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
      try {
        const transactions = await this.getTransactionsByBlock(blockNum);
        transactionCount += transactions.length;

        for (const tx of transactions) {
          if (tx.to === null && tx.status === 'success') {
            try {
              const addressInfo = await this.getAddressInfo(tx.hash);
              if (addressInfo.is_contract && addressInfo.token) {
                tokens.push(addressInfo.token);
                contracts.push(tx.hash);
              }
            } catch (error) {
              // Contract might not be a token
              continue;
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning block ${blockNum}:`, error);
        continue;
      }
    }

    return {
      tokens: tokens.filter((token, index, arr) => 
        arr.findIndex(t => t.address === token.address) === index
      ),
      contracts: [...new Set(contracts)],
      transactions: transactionCount,
    };
  }
}

export const inkChainAPI = new InkChainAPI();