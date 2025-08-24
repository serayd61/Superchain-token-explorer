import { ethers } from 'ethers';

export interface CrossChainToken {
  address: string;
  symbol: string;
  name: string;
  chainId: number;
  chainName: string;
  deploymentDate: number;
  deployerAddress: string;
  totalSupply: string;
  holders: number;
  marketCap: string;
  volume24h: string;
  priceUsd: string;
  priceChange24h: number;
  bridgeSupport: string[];
  verificationStatus: 'verified' | 'unverified' | 'proxy';
  securityScore: number; // 0-100
  isOriginal: boolean; // true if this is the original chain deployment
}

export interface TokenBridgeActivity {
  token: string;
  symbol: string;
  flows: Array<{
    fromChain: string;
    toChain: string;
    volume24h: string;
    transactions24h: number;
    avgAmount: string;
  }>;
  totalBridgeVolume24h: string;
  mostActiveRoute: {
    from: string;
    to: string;
    percentage: number;
  };
}

export interface ChainTokenStats {
  chainId: number;
  chainName: string;
  totalTokens: number;
  newTokens24h: number;
  topTokensByVolume: CrossChainToken[];
  topTokensByHolders: CrossChainToken[];
  totalMarketCap: string;
  totalVolume24h: string;
  uniqueHolders: number;
}

export interface TokenMovement {
  tokenAddress: string;
  symbol: string;
  fromChain: string;
  toChain: string;
  amount: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  bridgeProtocol: string;
  fees: string;
}

export interface MultiChainTokenProfile {
  baseToken: CrossChainToken;
  deployments: CrossChainToken[];
  bridgeActivity: TokenBridgeActivity;
  priceHistory: Array<{
    timestamp: number;
    price: number;
    volume: number;
    chain: string;
  }>;
  holders: {
    total: number;
    byChain: Record<string, number>;
    overlap: number; // holders present on multiple chains
  };
  liquidity: {
    total: string;
    byChain: Record<string, string>;
    dexSupport: Array<{
      chain: string;
      dex: string;
      pair: string;
      liquidity: string;
    }>;
  };
}

class CrossChainAnalyticsService {
  private readonly SUPPORTED_CHAINS = {
    1: { name: 'Ethereum', rpc: 'https://eth.drpc.org', blockExplorer: 'https://etherscan.io' },
    8453: { name: 'Base', rpc: 'https://mainnet.base.org', blockExplorer: 'https://basescan.org' },
    10: { name: 'Optimism', rpc: 'https://optimism.drpc.org', blockExplorer: 'https://optimistic.etherscan.io' },
    34443: { name: 'Mode', rpc: 'https://mainnet.mode.network', blockExplorer: 'https://explorer.mode.network' },
    1301: { name: 'Unichain', rpc: 'https://rpc.unichain.org', blockExplorer: 'https://unichain-sepolia.blockscout.com' },
    57073: { name: 'Ink', rpc: 'https://rpc-gel.inkonchain.com', blockExplorer: 'https://explorer.inkonchain.com' }
  };

  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    Object.entries(this.SUPPORTED_CHAINS).forEach(([chainId, config]) => {
      this.providers.set(Number(chainId), new ethers.JsonRpcProvider(config.rpc));
    });
  }

  async getAllChainTokenStats(): Promise<ChainTokenStats[]> {
    try {
      const stats = await Promise.all(
        Object.entries(this.SUPPORTED_CHAINS).map(([chainId, config]) =>
          this.getChainTokenStats(Number(chainId), config)
        )
      );
      return stats;
    } catch (error) {
      console.error('Error fetching chain token stats:', error);
      return this.getMockChainStats();
    }
  }

  private async getChainTokenStats(chainId: number, config: any): Promise<ChainTokenStats> {
    try {
      // Mock implementation - in production would query indexers like The Graph
      const mockData = this.getMockChainData(chainId, config.name);
      return mockData;
    } catch (error) {
      console.error(`Error fetching stats for chain ${chainId}:`, error);
      return this.getMockChainData(chainId, config.name);
    }
  }

  async getTokenBridgeActivity(tokenSymbol?: string): Promise<TokenBridgeActivity[]> {
    // Mock bridge activity data - in production would aggregate from bridge APIs
    const mockActivities = [
      {
        token: 'ETH',
        symbol: 'ETH',
        flows: [
          {
            fromChain: 'Ethereum',
            toChain: 'Base',
            volume24h: '$45.2M',
            transactions24h: 1250,
            avgAmount: '0.85 ETH'
          },
          {
            fromChain: 'Ethereum',
            toChain: 'Optimism',
            volume24h: '$32.1M',
            transactions24h: 890,
            avgAmount: '1.2 ETH'
          },
          {
            fromChain: 'Base',
            toChain: 'Optimism',
            volume24h: '$12.3M',
            transactions24h: 456,
            avgAmount: '0.65 ETH'
          }
        ],
        totalBridgeVolume24h: '$89.6M',
        mostActiveRoute: {
          from: 'Ethereum',
          to: 'Base',
          percentage: 50.4
        }
      },
      {
        token: 'USDC',
        symbol: 'USDC',
        flows: [
          {
            fromChain: 'Ethereum',
            toChain: 'Base',
            volume24h: '$78.4M',
            transactions24h: 2340,
            avgAmount: '1,250 USDC'
          },
          {
            fromChain: 'Base',
            toChain: 'Optimism',
            volume24h: '$23.8M',
            transactions24h: 670,
            avgAmount: '890 USDC'
          }
        ],
        totalBridgeVolume24h: '$102.2M',
        mostActiveRoute: {
          from: 'Ethereum',
          to: 'Base',
          percentage: 76.7
        }
      }
    ];

    return tokenSymbol ? 
      mockActivities.filter(activity => activity.symbol.toLowerCase() === tokenSymbol.toLowerCase()) :
      mockActivities;
  }

  async getMultiChainTokenProfile(tokenSymbol: string): Promise<MultiChainTokenProfile | null> {
    try {
      // Mock multi-chain token profile
      if (tokenSymbol.toLowerCase() === 'usdc') {
        return {
          baseToken: {
            address: '0xA0b86991c431e803d7b6ad0dbf7ded06c9e2d4dbe',
            symbol: 'USDC',
            name: 'USD Coin',
            chainId: 1,
            chainName: 'Ethereum',
            deploymentDate: 1565812800000, // August 2019
            deployerAddress: '0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf',
            totalSupply: '24521847392.123456',
            holders: 2847593,
            marketCap: '$24.52B',
            volume24h: '$2.8B',
            priceUsd: '1.0001',
            priceChange24h: 0.01,
            bridgeSupport: ['Official Bridge', 'Hop', 'Across', 'Stargate'],
            verificationStatus: 'verified',
            securityScore: 98,
            isOriginal: true
          },
          deployments: [
            {
              address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
              symbol: 'USDC',
              name: 'USD Coin',
              chainId: 8453,
              chainName: 'Base',
              deploymentDate: 1690300800000,
              deployerAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
              totalSupply: '892475123.456789',
              holders: 234567,
              marketCap: '$892.5M',
              volume24h: '$145.2M',
              priceUsd: '1.0001',
              priceChange24h: 0.01,
              bridgeSupport: ['Base Bridge', 'Hop', 'Across'],
              verificationStatus: 'verified',
              securityScore: 97,
              isOriginal: false
            },
            {
              address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
              symbol: 'USDC.e',
              name: 'Bridged USDC',
              chainId: 10,
              chainName: 'Optimism',
              deploymentDate: 1652745600000,
              deployerAddress: '0x4200000000000000000000000000000000000010',
              totalSupply: '445892456.789012',
              holders: 156789,
              marketCap: '$445.9M',
              volume24h: '$89.3M',
              priceUsd: '0.9999',
              priceChange24h: -0.01,
              bridgeSupport: ['Optimism Bridge', 'Hop', 'Across'],
              verificationStatus: 'verified',
              securityScore: 96,
              isOriginal: false
            }
          ],
          bridgeActivity: {
            token: 'USDC',
            symbol: 'USDC',
            flows: [
              {
                fromChain: 'Ethereum',
                toChain: 'Base',
                volume24h: '$78.4M',
                transactions24h: 2340,
                avgAmount: '1,250 USDC'
              }
            ],
            totalBridgeVolume24h: '$102.2M',
            mostActiveRoute: {
              from: 'Ethereum',
              to: 'Base',
              percentage: 76.7
            }
          },
          priceHistory: Array.from({ length: 24 }, (_, i) => ({
            timestamp: Date.now() - (23 - i) * 3600000,
            price: 1.0001 + (Math.random() - 0.5) * 0.002,
            volume: 2800000000 + (Math.random() - 0.5) * 200000000,
            chain: 'Ethereum'
          })),
          holders: {
            total: 3238949,
            byChain: {
              'Ethereum': 2847593,
              'Base': 234567,
              'Optimism': 156789
            },
            overlap: 42356 // estimated holders with USDC on multiple chains
          },
          liquidity: {
            total: '$4.8B',
            byChain: {
              'Ethereum': '$3.2B',
              'Base': '$1.1B',
              'Optimism': '$0.5B'
            },
            dexSupport: [
              {
                chain: 'Ethereum',
                dex: 'Uniswap V3',
                pair: 'USDC/ETH',
                liquidity: '$145.2M'
              },
              {
                chain: 'Base',
                dex: 'Aerodrome',
                pair: 'USDC/ETH',
                liquidity: '$67.8M'
              },
              {
                chain: 'Optimism',
                dex: 'Velodrome',
                pair: 'USDC/ETH',
                liquidity: '$34.5M'
              }
            ]
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching multi-chain token profile:', error);
      return null;
    }
  }

  async getRecentTokenMovements(limit = 50): Promise<TokenMovement[]> {
    // Mock recent cross-chain token movements
    return Array.from({ length: limit }, (_, i) => {
      const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI'];
      const chains = ['Ethereum', 'Base', 'Optimism', 'Mode'];
      const protocols = ['Official Bridge', 'Hop Protocol', 'Across', 'Stargate'];
      
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const fromChain = chains[Math.floor(Math.random() * chains.length)];
      let toChain = chains[Math.floor(Math.random() * chains.length)];
      while (toChain === fromChain) {
        toChain = chains[Math.floor(Math.random() * chains.length)];
      }

      return {
        tokenAddress: `0x${Math.random().toString(16).slice(2, 18).padStart(40, '0')}`,
        symbol: token,
        fromChain,
        toChain,
        amount: (Math.random() * 1000).toFixed(2),
        txHash: `0x${Math.random().toString(16).slice(2, 18).padStart(64, '0')}`,
        timestamp: Date.now() - Math.random() * 86400000, // Last 24 hours
        status: ['completed', 'completed', 'completed', 'pending'][Math.floor(Math.random() * 4)] as any,
        bridgeProtocol: protocols[Math.floor(Math.random() * protocols.length)],
        fees: `$${(Math.random() * 20).toFixed(2)}`
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  async getTokenDistribution(tokenSymbol: string): Promise<{
    token: string;
    totalSupply: string;
    distribution: Array<{
      chainName: string;
      amount: string;
      percentage: number;
      holders: number;
    }>;
  }> {
    // Mock token distribution across chains
    if (tokenSymbol.toLowerCase() === 'usdc') {
      return {
        token: 'USDC',
        totalSupply: '25,859,894,971.24',
        distribution: [
          {
            chainName: 'Ethereum',
            amount: '24,521,847,392.12',
            percentage: 94.8,
            holders: 2847593
          },
          {
            chainName: 'Base',
            amount: '892,475,123.46',
            percentage: 3.4,
            holders: 234567
          },
          {
            chainName: 'Optimism',
            amount: '445,572,455.66',
            percentage: 1.8,
            holders: 156789
          }
        ]
      };
    }

    return {
      token: tokenSymbol.toUpperCase(),
      totalSupply: '0',
      distribution: []
    };
  }

  // Helper methods
  private getMockChainData(chainId: number, chainName: string): ChainTokenStats {
    const baseTokenCount = chainId === 1 ? 50000 : Math.floor(Math.random() * 5000) + 1000;
    const newTokens = Math.floor(Math.random() * 50) + 5;

    return {
      chainId,
      chainName,
      totalTokens: baseTokenCount,
      newTokens24h: newTokens,
      topTokensByVolume: this.generateMockTokens(chainId, chainName, 10, 'volume'),
      topTokensByHolders: this.generateMockTokens(chainId, chainName, 10, 'holders'),
      totalMarketCap: chainId === 1 ? '$245.8B' : `$${(Math.random() * 50 + 5).toFixed(1)}B`,
      totalVolume24h: chainId === 1 ? '$45.2B' : `$${(Math.random() * 5 + 0.5).toFixed(1)}B`,
      uniqueHolders: Math.floor(baseTokenCount * 0.6)
    };
  }

  private generateMockTokens(chainId: number, chainName: string, count: number, sortBy: 'volume' | 'holders'): CrossChainToken[] {
    const commonTokens = [
      { symbol: 'ETH', name: 'Ethereum' },
      { symbol: 'USDC', name: 'USD Coin' },
      { symbol: 'USDT', name: 'Tether' },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
      { symbol: 'DAI', name: 'Dai Stablecoin' }
    ];

    return Array.from({ length: count }, (_, i) => {
      const isCommon = i < commonTokens.length;
      const tokenData = isCommon ? commonTokens[i] : {
        symbol: `TOKEN${i}`,
        name: `Token ${i}`
      };

      return {
        address: `0x${Math.random().toString(16).slice(2, 18).padStart(40, '0')}`,
        symbol: tokenData.symbol,
        name: tokenData.name,
        chainId,
        chainName,
        deploymentDate: Date.now() - Math.random() * 31536000000, // Random date within last year
        deployerAddress: `0x${Math.random().toString(16).slice(2, 18).padStart(40, '0')}`,
        totalSupply: (Math.random() * 1000000000).toFixed(0),
        holders: sortBy === 'holders' ? 
          Math.floor(Math.random() * 100000) + 1000 - i * 5000 :
          Math.floor(Math.random() * 10000) + 100,
        marketCap: `$${(Math.random() * 1000 + 100).toFixed(1)}M`,
        volume24h: sortBy === 'volume' ? 
          `$${(Math.random() * 100 + 50 - i * 8).toFixed(1)}M` :
          `$${(Math.random() * 50 + 1).toFixed(1)}M`,
        priceUsd: (Math.random() * 100).toFixed(4),
        priceChange24h: (Math.random() - 0.5) * 20,
        bridgeSupport: isCommon ? ['Official Bridge', 'Hop', 'Across'] : ['Official Bridge'],
        verificationStatus: isCommon ? 'verified' : 
          Math.random() > 0.7 ? 'verified' : 'unverified',
        securityScore: Math.floor(Math.random() * 40) + 60,
        isOriginal: chainId === 1 && isCommon
      };
    });
  }

  private getMockChainStats(): ChainTokenStats[] {
    return Object.entries(this.SUPPORTED_CHAINS).map(([chainId, config]) =>
      this.getMockChainData(Number(chainId), config.name)
    );
  }
}

export const crossChainAnalytics = new CrossChainAnalyticsService();