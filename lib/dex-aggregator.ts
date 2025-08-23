export interface SwapQuote {
  srcToken: string;
  destToken: string;
  srcAmount: string;
  destAmount: string;
  priceRoute: any;
  gasCostUSD: string;
  side: 'SELL' | 'BUY';
  contractMethod: string;
  contractParams: any[];
  exchangeName: string;
}

export interface ParaSwapQuote {
  priceRoute: {
    bestRoute: Array<{
      swaps: Array<{
        srcToken: string;
        destToken: string;
        srcAmount: string;
        destAmount: string;
        exchange: string;
        poolData?: any;
      }>;
    }>;
    blockNumber: number;
    destAmount: string;
    destToken: string;
    destUSD: string;
    gasCostUSD: string;
    srcAmount: string;
    srcToken: string;
    srcUSD: string;
  };
}

export interface OneInchQuote {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  toAmount: string;
  fromAmount: string;
  protocols: any[];
  estimatedGas: number;
}

export interface DexPriceComparison {
  paraswap?: {
    destAmount: string;
    gasCostUSD: string;
    priceImpact?: string;
  };
  oneinch?: {
    toAmount: string;
    estimatedGas: number;
    gasPrice?: string;
  };
  uniswap?: {
    amountOut: string;
    priceImpact: string;
    fee: string;
  };
  bestDeal: {
    protocol: 'paraswap' | 'oneinch' | 'uniswap';
    outputAmount: string;
    savings?: string;
  };
}

export class ParaSwapAPI {
  private baseUrl = 'https://apiv5.paraswap.io';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PARASWAP_API_KEY;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-API-KEY': this.apiKey }),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (!response.ok) {
      throw new Error(`ParaSwap API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async getQuote(
    srcToken: string,
    destToken: string,
    srcAmount: string,
    network = 8453, // Base
    userAddress?: string,
    side: 'SELL' | 'BUY' = 'SELL'
  ): Promise<ParaSwapQuote> {
    const params = new URLSearchParams({
      srcToken,
      destToken,
      srcAmount,
      network: network.toString(),
      side,
      ...(userAddress && { userAddress }),
    });

    return await this.makeRequest(`/prices/?${params}`);
  }

  async getSupportedTokens(network = 8453): Promise<Array<{
    symbol: string;
    address: string;
    decimals: number;
    img?: string;
  }>> {
    return await this.makeRequest(`/tokens/${network}`);
  }

  async buildTransaction(
    srcToken: string,
    destToken: string,
    srcAmount: string,
    destAmount: string,
    priceRoute: any,
    userAddress: string,
    network = 8453
  ): Promise<{
    from: string;
    to: string;
    value: string;
    data: string;
    gasPrice: string;
    gas: string;
    chainId: number;
  }> {
    return await this.makeRequest(`/transactions/${network}`, {
      method: 'POST',
      body: JSON.stringify({
        srcToken,
        destToken,
        srcAmount,
        destAmount,
        priceRoute,
        userAddress,
        slippage: 100, // 1%
      }),
    });
  }
}

export class OneInchAPI {
  private baseUrl = 'https://api.1inch.dev/swap/v6.0';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ONEINCH_API_KEY;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async getQuote(
    src: string,
    dst: string,
    amount: string,
    chainId = 8453, // Base
    fromAddress?: string
  ): Promise<OneInchQuote> {
    const params = new URLSearchParams({
      src,
      dst,
      amount,
      ...(fromAddress && { from: fromAddress }),
    });

    return await this.makeRequest(`/${chainId}/quote?${params}`);
  }

  async getSwap(
    src: string,
    dst: string,
    amount: string,
    from: string,
    chainId = 8453,
    slippage = 1
  ): Promise<{
    fromToken: any;
    toToken: any;
    toAmount: string;
    fromAmount: string;
    tx: {
      from: string;
      to: string;
      data: string;
      value: string;
      gasPrice: string;
      gas: number;
    };
  }> {
    const params = new URLSearchParams({
      src,
      dst,
      amount,
      from,
      slippage: slippage.toString(),
    });

    return await this.makeRequest(`/${chainId}/swap?${params}`);
  }

  async getSupportedTokens(chainId = 8453): Promise<{
    tokens: Record<string, {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      logoURI?: string;
    }>;
  }> {
    return await this.makeRequest(`/${chainId}/tokens`);
  }
}

export class DexAggregatorService {
  private paraswap: ParaSwapAPI;
  private oneinch: OneInchAPI;

  constructor() {
    this.paraswap = new ParaSwapAPI();
    this.oneinch = new OneInchAPI();
  }

  async compareAllDexPrices(
    srcToken: string,
    destToken: string,
    amount: string,
    chainId = 8453,
    userAddress?: string
  ): Promise<DexPriceComparison> {
    const results: DexPriceComparison = {} as any;

    try {
      // Get ParaSwap quote
      const paraswapQuote = await this.paraswap.getQuote(
        srcToken,
        destToken,
        amount,
        chainId,
        userAddress
      );
      results.paraswap = {
        destAmount: paraswapQuote.priceRoute.destAmount,
        gasCostUSD: paraswapQuote.priceRoute.gasCostUSD,
      };
    } catch (error) {
      console.warn('ParaSwap quote failed:', error);
    }

    try {
      // Get 1inch quote
      const oneinchQuote = await this.oneinch.getQuote(
        srcToken,
        destToken,
        amount,
        chainId,
        userAddress
      );
      results.oneinch = {
        toAmount: oneinchQuote.toAmount,
        estimatedGas: oneinchQuote.estimatedGas,
      };
    } catch (error) {
      console.warn('1inch quote failed:', error);
    }

    // Determine best deal
    const amounts = [];
    if (results.paraswap) amounts.push({ protocol: 'paraswap', amount: BigInt(results.paraswap.destAmount) });
    if (results.oneinch) amounts.push({ protocol: 'oneinch', amount: BigInt(results.oneinch.toAmount) });

    if (amounts.length > 0) {
      const best = amounts.reduce((prev, curr) => curr.amount > prev.amount ? curr : prev);
      results.bestDeal = {
        protocol: best.protocol as any,
        outputAmount: best.amount.toString(),
      };

      // Calculate savings compared to worst deal
      if (amounts.length > 1) {
        const worst = amounts.reduce((prev, curr) => curr.amount < prev.amount ? curr : prev);
        const savings = ((best.amount - worst.amount) * BigInt(100)) / worst.amount;
        results.bestDeal.savings = `${savings.toString()}%`;
      }
    }

    return results;
  }

  async getBestSwapRoute(
    srcToken: string,
    destToken: string,
    amount: string,
    userAddress: string,
    chainId = 8453
  ): Promise<{
    protocol: string;
    transaction?: any;
    quote: any;
    estimatedOutput: string;
  }> {
    const comparison = await this.compareAllDexPrices(srcToken, destToken, amount, chainId, userAddress);
    
    if (!comparison.bestDeal) {
      throw new Error('No valid quotes found');
    }

    const bestProtocol = comparison.bestDeal.protocol;

    if (bestProtocol === 'paraswap' && comparison.paraswap) {
      // Get ParaSwap transaction
      const quote = await this.paraswap.getQuote(srcToken, destToken, amount, chainId, userAddress);
      const transaction = await this.paraswap.buildTransaction(
        srcToken,
        destToken,
        amount,
        quote.priceRoute.destAmount,
        quote.priceRoute,
        userAddress,
        chainId
      );

      return {
        protocol: 'ParaSwap',
        transaction,
        quote,
        estimatedOutput: quote.priceRoute.destAmount,
      };
    } else if (bestProtocol === 'oneinch' && comparison.oneinch) {
      // Get 1inch transaction
      const swap = await this.oneinch.getSwap(srcToken, destToken, amount, userAddress, chainId);

      return {
        protocol: '1inch',
        transaction: swap.tx,
        quote: swap,
        estimatedOutput: swap.toAmount,
      };
    }

    throw new Error('Unable to build swap transaction');
  }

  async getSupportedTokensForChain(chainId: number): Promise<Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  }>> {
    try {
      // Try ParaSwap first
      const paraswapTokens = await this.paraswap.getSupportedTokens(chainId);
      return paraswapTokens.map(token => ({
        address: token.address,
        symbol: token.symbol,
        name: token.symbol,
        decimals: token.decimals,
        logoURI: token.img,
      }));
    } catch (error) {
      console.warn('ParaSwap tokens failed, trying 1inch:', error);
      
      try {
        const oneinchTokens = await this.oneinch.getSupportedTokens(chainId);
        return Object.values(oneinchTokens.tokens).map(token => ({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
        }));
      } catch (error) {
        console.error('Both DEX APIs failed:', error);
        return [];
      }
    }
  }
}

export const dexAggregator = new DexAggregatorService();
export const paraswapAPI = new ParaSwapAPI();
export const oneinchAPI = new OneInchAPI();