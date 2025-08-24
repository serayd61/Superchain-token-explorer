import { ethers } from 'ethers';

export interface GasData {
  chainId: number;
  chainName: string;
  gasPrice: {
    slow: string;
    standard: string;
    fast: string;
  };
  gasPriceGwei: {
    slow: number;
    standard: number;
    fast: number;
  };
  estimatedCosts: {
    simple: { slow: string; standard: string; fast: string; };
    erc20: { slow: string; standard: string; fast: string; };
    uniswap: { slow: string; standard: string; fast: string; };
    bridge: { slow: string; standard: string; fast: string; };
  };
  blockTime: number;
  congestion: 'low' | 'medium' | 'high';
  lastUpdate: number;
}

export interface GasComparison {
  transactionType: 'simple' | 'erc20' | 'uniswap' | 'bridge';
  chains: Array<{
    chainName: string;
    cost: string;
    costUsd: number;
    time: string;
    ranking: number;
  }>;
  cheapest: string;
  fastest: string;
  bestValue: string;
}

export interface GasTrend {
  chainId: number;
  chainName: string;
  prices: Array<{
    timestamp: number;
    gasPrice: number;
    congestion: 'low' | 'medium' | 'high';
  }>;
  trend: 'up' | 'down' | 'stable';
  percentageChange24h: number;
}

class GasTrackerService {
  private readonly CHAIN_CONFIGS = {
    1: {
      name: 'Ethereum',
      rpc: 'https://eth.drpc.org',
      nativeToken: 'ETH',
      blockTime: 12,
      gasLimits: {
        simple: 21000,
        erc20: 65000,
        uniswap: 150000,
        bridge: 250000
      }
    },
    8453: {
      name: 'Base',
      rpc: 'https://mainnet.base.org',
      nativeToken: 'ETH',
      blockTime: 2,
      gasLimits: {
        simple: 21000,
        erc20: 52000,
        uniswap: 120000,
        bridge: 180000
      }
    },
    10: {
      name: 'Optimism',
      rpc: 'https://optimism.drpc.org',
      nativeToken: 'ETH',
      blockTime: 2,
      gasLimits: {
        simple: 21000,
        erc20: 55000,
        uniswap: 130000,
        bridge: 200000
      }
    },
    34443: {
      name: 'Mode',
      rpc: 'https://mainnet.mode.network',
      nativeToken: 'ETH',
      blockTime: 2,
      gasLimits: {
        simple: 21000,
        erc20: 50000,
        uniswap: 115000,
        bridge: 170000
      }
    },
    1301: {
      name: 'Unichain',
      rpc: 'https://rpc.unichain.org',
      nativeToken: 'ETH',
      blockTime: 1,
      gasLimits: {
        simple: 21000,
        erc20: 48000,
        uniswap: 100000,
        bridge: 160000
      }
    },
    57073: {
      name: 'Ink',
      rpc: 'https://rpc-gel.inkonchain.com',
      nativeToken: 'ETH',
      blockTime: 2,
      gasLimits: {
        simple: 21000,
        erc20: 53000,
        uniswap: 125000,
        bridge: 185000
      }
    }
  };

  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private ethPrice: number = 2100; // Mock ETH price - would fetch from CoinGecko

  constructor() {
    // Initialize providers
    Object.entries(this.CHAIN_CONFIGS).forEach(([chainId, config]) => {
      this.providers.set(Number(chainId), new ethers.JsonRpcProvider(config.rpc));
    });
  }

  async getAllGasData(): Promise<GasData[]> {
    try {
      const gasDataPromises = Object.entries(this.CHAIN_CONFIGS).map(([chainId, config]) =>
        this.getChainGasData(Number(chainId), config)
      );

      const results = await Promise.allSettled(gasDataPromises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<GasData> => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Error fetching gas data:', error);
      return this.getMockGasData();
    }
  }

  private async getChainGasData(chainId: number, config: any): Promise<GasData> {
    try {
      const provider = this.providers.get(chainId);
      if (!provider) throw new Error(`No provider for chain ${chainId}`);

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('1', 'gwei');
      
      // Calculate different speed tiers
      const basePrice = Number(ethers.formatUnits(gasPrice, 'gwei'));
      const slowPrice = basePrice * 0.8;
      const standardPrice = basePrice;
      const fastPrice = basePrice * 1.3;

      // Determine congestion level
      let congestion: 'low' | 'medium' | 'high' = 'low';
      if (chainId === 1) {
        if (basePrice > 50) congestion = 'high';
        else if (basePrice > 20) congestion = 'medium';
      } else {
        if (basePrice > 0.1) congestion = 'high';
        else if (basePrice > 0.05) congestion = 'medium';
      }

      return {
        chainId,
        chainName: config.name,
        gasPrice: {
          slow: ethers.parseUnits(slowPrice.toFixed(2), 'gwei').toString(),
          standard: gasPrice.toString(),
          fast: ethers.parseUnits(fastPrice.toFixed(2), 'gwei').toString()
        },
        gasPriceGwei: {
          slow: slowPrice,
          standard: basePrice,
          fast: fastPrice
        },
        estimatedCosts: this.calculateTransactionCosts(config.gasLimits, slowPrice, standardPrice, fastPrice),
        blockTime: config.blockTime,
        congestion,
        lastUpdate: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching gas data for chain ${chainId}:`, error);
      return this.getMockChainGasData(chainId, config);
    }
  }

  private calculateTransactionCosts(gasLimits: any, slowGwei: number, standardGwei: number, fastGwei: number) {
    const calculateCost = (gasLimit: number, gweiPrice: number) => {
      const gasCostEth = (gasLimit * gweiPrice) / 1e9;
      const gasCostUsd = gasCostEth * this.ethPrice;
      return `$${gasCostUsd.toFixed(2)}`;
    };

    return {
      simple: {
        slow: calculateCost(gasLimits.simple, slowGwei),
        standard: calculateCost(gasLimits.simple, standardGwei),
        fast: calculateCost(gasLimits.simple, fastGwei)
      },
      erc20: {
        slow: calculateCost(gasLimits.erc20, slowGwei),
        standard: calculateCost(gasLimits.erc20, standardGwei),
        fast: calculateCost(gasLimits.erc20, fastGwei)
      },
      uniswap: {
        slow: calculateCost(gasLimits.uniswap, slowGwei),
        standard: calculateCost(gasLimits.uniswap, standardGwei),
        fast: calculateCost(gasLimits.uniswap, fastGwei)
      },
      bridge: {
        slow: calculateCost(gasLimits.bridge, slowGwei),
        standard: calculateCost(gasLimits.bridge, standardGwei),
        fast: calculateCost(gasLimits.bridge, fastGwei)
      }
    };
  }

  async getGasComparison(transactionType: 'simple' | 'erc20' | 'uniswap' | 'bridge'): Promise<GasComparison> {
    const gasData = await this.getAllGasData();
    
    const chains = gasData.map(data => {
      const cost = data.estimatedCosts[transactionType].standard;
      const costUsd = parseFloat(cost.replace('$', ''));
      const timeEstimate = this.getConfirmationTime(data.chainName, data.blockTime, data.congestion);
      
      return {
        chainName: data.chainName,
        cost,
        costUsd,
        time: timeEstimate,
        ranking: 0 // Will be set after sorting
      };
    }).sort((a, b) => a.costUsd - b.costUsd);

    // Add rankings
    chains.forEach((chain, index) => {
      chain.ranking = index + 1;
    });

    const cheapest = chains[0].chainName;
    const fastest = gasData
      .sort((a, b) => a.blockTime - b.blockTime)[0].chainName;
    
    // Best value = good balance of cost and speed
    const bestValue = chains
      .sort((a, b) => {
        const aScore = a.costUsd + (a.time.includes('sec') ? 0 : 
                     a.time.includes('min') ? parseFloat(a.time) * 10 : 100);
        const bScore = b.costUsd + (b.time.includes('sec') ? 0 : 
                     b.time.includes('min') ? parseFloat(b.time) * 10 : 100);
        return aScore - bScore;
      })[0].chainName;

    return {
      transactionType,
      chains,
      cheapest,
      fastest,
      bestValue
    };
  }

  private getConfirmationTime(chainName: string, blockTime: number, congestion: string): string {
    let multiplier = 1;
    if (congestion === 'medium') multiplier = 1.5;
    else if (congestion === 'high') multiplier = 2;

    const estimatedTime = blockTime * multiplier;
    
    if (estimatedTime < 60) return `${Math.round(estimatedTime)}s`;
    return `${Math.round(estimatedTime / 60)}min`;
  }

  async getGasTrends(hours = 24): Promise<GasTrend[]> {
    // Mock historical data - in production would store/fetch real historical data
    return Object.entries(this.CHAIN_CONFIGS).map(([chainId, config]) => {
      const prices = Array.from({ length: hours }, (_, i) => {
        const basePrice = chainId === '1' ? 25 : 0.05;
        const variation = (Math.random() - 0.5) * 0.4;
        const price = basePrice * (1 + variation);
        
        return {
          timestamp: Date.now() - (hours - i) * 3600000,
          gasPrice: price,
          congestion: price > basePrice * 1.2 ? 'high' as const : 
                     price > basePrice * 0.8 ? 'medium' as const : 'low' as const
        };
      });

      const firstPrice = prices[0].gasPrice;
      const lastPrice = prices[prices.length - 1].gasPrice;
      const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (percentageChange > 5) trend = 'up';
      else if (percentageChange < -5) trend = 'down';

      return {
        chainId: Number(chainId),
        chainName: config.name,
        prices,
        trend,
        percentageChange24h: percentageChange
      };
    });
  }

  async getOptimalTransactionTime(chainId: number, transactionType: string): Promise<{
    recommendation: 'now' | 'wait' | 'schedule';
    reason: string;
    estimatedSavings?: string;
    suggestedTime?: number;
  }> {
    const gasData = await this.getAllGasData();
    const chainData = gasData.find(data => data.chainId === chainId);
    
    if (!chainData) {
      return {
        recommendation: 'now',
        reason: 'Chain data unavailable'
      };
    }

    const trends = await this.getGasTrends(6); // Last 6 hours
    const chainTrend = trends.find(trend => trend.chainId === chainId);
    
    if (!chainTrend) {
      return {
        recommendation: 'now',
        reason: 'Trend data unavailable'
      };
    }

    if (chainData.congestion === 'high' && chainTrend.trend === 'down') {
      return {
        recommendation: 'wait',
        reason: 'Gas prices are high but trending down',
        estimatedSavings: '15-25%',
        suggestedTime: Date.now() + 2 * 3600000 // 2 hours
      };
    }

    if (chainData.congestion === 'low' || chainTrend.trend === 'up') {
      return {
        recommendation: 'now',
        reason: chainData.congestion === 'low' ? 
                'Gas prices are currently low' : 
                'Gas prices are trending up'
      };
    }

    return {
      recommendation: 'schedule',
      reason: 'Consider scheduling for off-peak hours',
      estimatedSavings: '10-20%',
      suggestedTime: this.getNextOffPeakTime()
    };
  }

  private getNextOffPeakTime(): number {
    const now = new Date();
    const offPeakStart = new Date(now);
    
    // Set to 2 AM UTC (typically lower gas prices)
    offPeakStart.setUTCHours(2, 0, 0, 0);
    
    // If it's already past 2 AM today, schedule for tomorrow
    if (offPeakStart <= now) {
      offPeakStart.setDate(offPeakStart.getDate() + 1);
    }
    
    return offPeakStart.getTime();
  }

  // Helper methods for mock data
  private getMockGasData(): GasData[] {
    return Object.entries(this.CHAIN_CONFIGS).map(([chainId, config]) => 
      this.getMockChainGasData(Number(chainId), config)
    );
  }

  private getMockChainGasData(chainId: number, config: any): GasData {
    const basePrice = chainId === 1 ? 25 : 0.05;
    const slowPrice = basePrice * 0.8;
    const fastPrice = basePrice * 1.3;

    return {
      chainId,
      chainName: config.name,
      gasPrice: {
        slow: ethers.parseUnits(slowPrice.toFixed(9), 'gwei').toString(),
        standard: ethers.parseUnits(basePrice.toFixed(9), 'gwei').toString(),
        fast: ethers.parseUnits(fastPrice.toFixed(9), 'gwei').toString()
      },
      gasPriceGwei: {
        slow: slowPrice,
        standard: basePrice,
        fast: fastPrice
      },
      estimatedCosts: this.calculateTransactionCosts(config.gasLimits, slowPrice, basePrice, fastPrice),
      blockTime: config.blockTime,
      congestion: basePrice > (chainId === 1 ? 50 : 0.1) ? 'high' : 
                 basePrice > (chainId === 1 ? 20 : 0.05) ? 'medium' : 'low',
      lastUpdate: Date.now()
    };
  }
}

export const gasTracker = new GasTrackerService();