export interface BaseScanTransaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  contractAddress?: string;
  methodId: string;
}

export interface BaseScanTokenInfo {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
}

export interface BaseScanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export class BaseScanAPI {
  private baseUrl = 'https://api.basescan.org/api';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BASESCAN_API_KEY || '';
  }

  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    const urlParams = new URLSearchParams({
      ...params,
      ...(this.apiKey && { apikey: this.apiKey }),
    });

    const response = await fetch(`${this.baseUrl}?${urlParams}`);
    
    if (!response.ok) {
      throw new Error(`BaseScan API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== '1') {
      throw new Error(`BaseScan API error: ${data.message}`);
    }

    return data.result;
  }

  async getAccountBalance(address: string): Promise<string> {
    return await this.makeRequest<string>({
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest',
    });
  }

  async getAccountTransactions(
    address: string,
    startBlock = 0,
    endBlock = 99999999,
    page = 1,
    offset = 100
  ): Promise<BaseScanTransaction[]> {
    return await this.makeRequest<BaseScanTransaction[]>({
      module: 'account',
      action: 'txlist',
      address,
      startblock: startBlock.toString(),
      endblock: endBlock.toString(),
      page: page.toString(),
      offset: offset.toString(),
      sort: 'desc',
    });
  }

  async getTokenInfo(contractAddress: string): Promise<BaseScanTokenInfo> {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.makeRequest<string>({
        module: 'token',
        action: 'tokeninfo',
        contractaddress: contractAddress,
      }).then(result => (result as any).tokenName || ''),
      
      this.makeRequest<string>({
        module: 'token',
        action: 'tokeninfo',
        contractaddress: contractAddress,
      }).then(result => (result as any).symbol || ''),
      
      this.makeRequest<string>({
        module: 'token',
        action: 'tokeninfo',
        contractaddress: contractAddress,
      }).then(result => (result as any).divisor || '18'),
      
      this.makeRequest<string>({
        module: 'stats',
        action: 'tokensupply',
        contractaddress: contractAddress,
      }),
    ]);

    return {
      contractAddress,
      name,
      symbol,
      decimals,
      totalSupply,
    };
  }

  async getContractCreation(contractAddress: string): Promise<{
    contractAddress: string;
    contractCreator: string;
    txHash: string;
  }> {
    const result = await this.makeRequest<Array<{
      contractAddress: string;
      contractCreator: string;
      txHash: string;
    }>>({
      module: 'contract',
      action: 'getcontractcreation',
      contractaddresses: contractAddress,
    });

    return result[0];
  }

  async getBlockByNumber(blockNumber: number): Promise<{
    blockNumber: string;
    timeStamp: string;
    blockMiner: string;
    gasUsed: string;
    gasLimit: string;
  }> {
    return await this.makeRequest({
      module: 'block',
      action: 'getblockreward',
      blockno: blockNumber.toString(),
    });
  }

  async getLatestBlockNumber(): Promise<number> {
    const result = await this.makeRequest<string>({
      module: 'proxy',
      action: 'eth_blockNumber',
    });
    
    return parseInt(result, 16);
  }

  async getTokenTransfers(
    contractAddress?: string,
    address?: string,
    startBlock = 0,
    endBlock = 99999999,
    page = 1,
    offset = 100
  ): Promise<Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
  }>> {
    const params: Record<string, string> = {
      module: 'account',
      action: 'tokentx',
      startblock: startBlock.toString(),
      endblock: endBlock.toString(),
      page: page.toString(),
      offset: offset.toString(),
      sort: 'desc',
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    if (address) {
      params.address = address;
    }

    return await this.makeRequest(params);
  }

  async getInternalTransactions(
    txHash?: string,
    address?: string,
    startBlock = 0,
    endBlock = 99999999
  ): Promise<Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasUsed: string;
    isError: string;
    errCode: string;
  }>> {
    const params: Record<string, string> = {
      module: 'account',
      action: 'txlistinternal',
      startblock: startBlock.toString(),
      endblock: endBlock.toString(),
      sort: 'desc',
    };

    if (txHash) {
      params.txhash = txHash;
    }

    if (address) {
      params.address = address;
    }

    return await this.makeRequest(params);
  }
}

export const baseScanAPI = new BaseScanAPI();