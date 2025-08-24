import { ethers } from 'ethers';

export interface SuperchainHealthMetrics {
  totalTxs24h: number;
  totalGasUsed24h: string;
  avgBlockTime: number;
  finalizationRate: number;
  bridgeStatus: 'healthy' | 'degraded' | 'down';
  networkUptime: number;
}

export interface ChainMetrics {
  chainId: number;
  name: string;
  blockNumber: number;
  gasPrice: string;
  tvl: string;
  dailyTxs: number;
  activeAddresses: number;
  bridgeVolume24h: string;
  healthScore: number;
}

export interface CrossChainFlow {
  fromChain: string;
  toChain: string;
  token: string;
  volume24h: string;
  transactions24h: number;
  avgTransferTime: number; // in minutes
}

export interface OpAnalyticsData {
  timestamp: number;
  superchainHealth: SuperchainHealthMetrics;
  chainMetrics: ChainMetrics[];
  crossChainFlows: CrossChainFlow[];
  topContracts: Array<{
    address: string;
    chain: string;
    txCount24h: number;
    gasUsed24h: string;
    category: string;
  }>;
}

class OpAnalyticsService {
  private readonly SUPPORTED_CHAINS = {
    1: { name: 'Ethereum', rpc: 'https://eth.drpc.org' },
    8453: { name: 'Base', rpc: 'https://mainnet.base.org' },
    10: { name: 'Optimism', rpc: 'https://optimism.drpc.org' },
    34443: { name: 'Mode', rpc: 'https://mainnet.mode.network' },
    1301: { name: 'Unichain', rpc: 'https://rpc.unichain.org' },
    57073: { name: 'Ink', rpc: 'https://rpc-gel.inkonchain.com' }
  };

  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    // Initialize providers for each chain
    Object.entries(this.SUPPORTED_CHAINS).forEach(([chainId, config]) => {
      this.providers.set(Number(chainId), new ethers.JsonRpcProvider(config.rpc));
    });
  }

  async getSuperchainHealthMetrics(): Promise<SuperchainHealthMetrics> {
    try {
      // Aggregate data from all chains
      const chainData = await Promise.all(
        Array.from(this.providers.entries()).map(([chainId, provider]) => 
          this.getChainHealth(chainId, provider)
        )
      );

      const totalTxs = chainData.reduce((sum, chain) => sum + chain.dailyTxs, 0);
      const totalGasUsed = chainData.reduce((sum, chain) => sum + parseFloat(chain.gasUsed || '0'), 0);
      const avgBlockTime = chainData.reduce((sum, chain) => sum + chain.blockTime, 0) / chainData.length;
      
      return {
        totalTxs24h: totalTxs,
        totalGasUsed24h: totalGasUsed.toFixed(2),
        avgBlockTime,
        finalizationRate: 99.8, // Mock data - would integrate with actual finalization metrics
        bridgeStatus: this.calculateBridgeStatus(chainData),
        networkUptime: 99.95
      };
    } catch (error) {
      console.error('Error fetching Superchain health metrics:', error);
      return this.getMockSuperchainHealth();
    }
  }

  private async getChainHealth(chainId: number, provider: ethers.JsonRpcProvider) {
    try {
      const [blockNumber, gasPrice] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData()
      ]);

      return {
        chainId,
        blockNumber,
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        dailyTxs: Math.floor(Math.random() * 1000000), // Mock - would use real data
        gasUsed: (Math.random() * 1000).toFixed(2),
        blockTime: chainId === 1 ? 12 : 2 // Ethereum 12s, L2s 2s
      };
    } catch (error) {
      console.error(`Error fetching data for chain ${chainId}:`, error);
      return {
        chainId,
        blockNumber: 0,
        gasPrice: '0',
        dailyTxs: 0,
        gasUsed: '0',
        blockTime: 2
      };
    }
  }

  async getChainMetrics(): Promise<ChainMetrics[]> {
    try {
      const chainMetrics = await Promise.all(
        Object.entries(this.SUPPORTED_CHAINS).map(async ([chainId, config]) => {
          const provider = this.providers.get(Number(chainId));
          if (!provider) return null;

          const health = await this.getChainHealth(Number(chainId), provider);
          
          return {
            chainId: Number(chainId),
            name: config.name,
            blockNumber: health.blockNumber,
            gasPrice: health.gasPrice,
            tvl: this.getMockTVL(config.name),
            dailyTxs: health.dailyTxs,
            activeAddresses: Math.floor(health.dailyTxs * 0.6), // Estimate
            bridgeVolume24h: this.getMockBridgeVolume(config.name),
            healthScore: this.calculateHealthScore(health)
          };
        })
      );

      return chainMetrics.filter(Boolean) as ChainMetrics[];
    } catch (error) {
      console.error('Error fetching chain metrics:', error);
      return this.getMockChainMetrics();
    }
  }

  async getCrossChainFlows(): Promise<CrossChainFlow[]> {
    // Mock cross-chain flow data - in production would integrate with bridge APIs
    return [
      {
        fromChain: 'Ethereum',
        toChain: 'Base',
        token: 'ETH',
        volume24h: '$45.2M',
        transactions24h: 1250,
        avgTransferTime: 15
      },
      {
        fromChain: 'Base',
        toChain: 'Optimism',
        token: 'USDC',
        volume24h: '$23.8M',
        transactions24h: 890,
        avgTransferTime: 3
      },
      {
        fromChain: 'Ethereum',
        toChain: 'Optimism',
        token: 'ETH',
        volume24h: '$67.1M',
        transactions24h: 2340,
        avgTransferTime: 12
      },
      {
        fromChain: 'Mode',
        toChain: 'Base',
        token: 'USDC',
        volume24h: '$8.9M',
        transactions24h: 456,
        avgTransferTime: 4
      }
    ];
  }

  async getTopContracts() {
    // Mock top contracts data - would integrate with real contract analytics
    return [
      {
        address: '0x4200000000000000000000000000000000000006',
        chain: 'Base',
        txCount24h: 15420,
        gasUsed24h: '450.2',
        category: 'Bridge'
      },
      {
        address: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
        chain: 'Optimism',
        txCount24h: 12350,
        gasUsed24h: '380.7',
        category: 'DEX'
      },
      {
        address: '0xA0Cc33Dd6f4819D473226257792AFe230EC3c67f',
        chain: 'Base',
        txCount24h: 9870,
        gasUsed24h: '290.4',
        category: 'Lending'
      }
    ];
  }

  async getFullAnalytics(): Promise<OpAnalyticsData> {
    const [superchainHealth, chainMetrics, crossChainFlows, topContracts] = await Promise.all([
      this.getSuperchainHealthMetrics(),
      this.getChainMetrics(),
      this.getCrossChainFlows(),
      this.getTopContracts()
    ]);

    return {
      timestamp: Date.now(),
      superchainHealth,
      chainMetrics,
      crossChainFlows,
      topContracts
    };
  }

  // Helper methods
  private calculateBridgeStatus(chainData: any[]): 'healthy' | 'degraded' | 'down' {
    const healthyChains = chainData.filter(chain => chain.blockNumber > 0).length;
    const totalChains = chainData.length;
    
    if (healthyChains === totalChains) return 'healthy';
    if (healthyChains > totalChains * 0.5) return 'degraded';
    return 'down';
  }

  private calculateHealthScore(chainHealth: any): number {
    const baseScore = 100;
    let score = baseScore;
    
    if (chainHealth.blockNumber === 0) score -= 50;
    if (chainHealth.dailyTxs < 1000) score -= 20;
    if (parseFloat(chainHealth.gasUsed) < 10) score -= 15;
    
    return Math.max(score, 0);
  }

  private getMockTVL(chainName: string): string {
    const tvlMap: Record<string, string> = {
      'Ethereum': '$45.2B',
      'Base': '$2.8B',
      'Optimism': '$1.8B',
      'Mode': '$120M',
      'Unichain': '$890M',
      'Ink': '$450M'
    };
    return tvlMap[chainName] || '$0';
  }

  private getMockBridgeVolume(chainName: string): string {
    const volumeMap: Record<string, string> = {
      'Ethereum': '$125.4M',
      'Base': '$89.7M',
      'Optimism': '$67.3M',
      'Mode': '$23.1M',
      'Unichain': '$45.8M',
      'Ink': '$19.2M'
    };
    return volumeMap[chainName] || '$0';
  }

  private getMockSuperchainHealth(): SuperchainHealthMetrics {
    return {
      totalTxs24h: 3450000,
      totalGasUsed24h: '12450.50',
      avgBlockTime: 2.1,
      finalizationRate: 99.8,
      bridgeStatus: 'healthy',
      networkUptime: 99.95
    };
  }

  private getMockChainMetrics(): ChainMetrics[] {
    return [
      {
        chainId: 8453,
        name: 'Base',
        blockNumber: 12345678,
        gasPrice: '1000000000',
        tvl: '$2.8B',
        dailyTxs: 1250000,
        activeAddresses: 750000,
        bridgeVolume24h: '$89.7M',
        healthScore: 98
      },
      {
        chainId: 10,
        name: 'Optimism',
        blockNumber: 98765432,
        gasPrice: '1500000000',
        tvl: '$1.8B',
        dailyTxs: 890000,
        activeAddresses: 534000,
        bridgeVolume24h: '$67.3M',
        healthScore: 96
      }
    ];
  }
}

export const opAnalytics = new OpAnalyticsService();