import { ethers } from 'ethers';

export interface BridgeStatus {
  id: string;
  name: string;
  fromChain: string;
  toChain: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'down';
  lastUpdate: number;
  volume24h: string;
  totalValueLocked: string;
  avgTransferTime: number; // in minutes
  successRate: number; // percentage
  fees: {
    min: string;
    max: string;
    avg: string;
  };
  supportedTokens: string[];
}

export interface BridgeTransaction {
  txHash: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  status: 'pending' | 'confirming' | 'completed' | 'failed';
  timestamp: number;
  estimatedTime: number;
  actualTime?: number;
  fromTxHash: string;
  toTxHash?: string;
}

export interface CrossChainRoute {
  fromChain: string;
  toChain: string;
  bridges: {
    name: string;
    fee: string;
    time: number;
    reliability: number;
  }[];
  bestRoute: {
    bridge: string;
    reason: 'cheapest' | 'fastest' | 'most_reliable';
  };
}

class BridgeMonitorService {
  private readonly BRIDGE_CONFIGS = [
    {
      id: 'op-bridge',
      name: 'Optimism Bridge',
      contractAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
      fromChain: 'Ethereum',
      toChain: 'Optimism'
    },
    {
      id: 'base-bridge',
      name: 'Base Bridge',
      contractAddress: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
      fromChain: 'Ethereum',
      toChain: 'Base'
    },
    {
      id: 'mode-bridge',
      name: 'Mode Bridge',
      contractAddress: '0x735aDBbE72226BD52e818E7181953f42E3b0FF21',
      fromChain: 'Ethereum',
      toChain: 'Mode'
    },
    {
      id: 'ink-bridge',
      name: 'Ink Bridge',
      contractAddress: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
      fromChain: 'Ethereum',
      toChain: 'Ink'
    }
  ];

  private readonly CHAIN_RPCS = {
    'Ethereum': 'https://eth.drpc.org',
    'Base': 'https://mainnet.base.org',
    'Optimism': 'https://optimism.drpc.org',
    'Mode': 'https://mainnet.mode.network',
    'Ink': 'https://rpc-gel.inkonchain.com',
    'Unichain': 'https://rpc.unichain.org'
  };

  async getAllBridgeStatuses(): Promise<BridgeStatus[]> {
    try {
      const statuses = await Promise.all(
        this.BRIDGE_CONFIGS.map(bridge => this.getBridgeStatus(bridge))
      );
      
      // Add mock cross-L2 bridges
      const crossL2Bridges = [
        {
          id: 'hop-base-op',
          name: 'Hop Protocol',
          fromChain: 'Base',
          toChain: 'Optimism',
          status: 'operational' as const,
          lastUpdate: Date.now(),
          volume24h: '$12.3M',
          totalValueLocked: '$45.7M',
          avgTransferTime: 3,
          successRate: 99.2,
          fees: { min: '$0.50', max: '$2.10', avg: '$1.25' },
          supportedTokens: ['ETH', 'USDC', 'USDT']
        },
        {
          id: 'across-multi',
          name: 'Across Protocol',
          fromChain: 'Base',
          toChain: 'Mode',
          status: 'operational' as const,
          lastUpdate: Date.now(),
          volume24h: '$5.8M',
          totalValueLocked: '$23.1M',
          avgTransferTime: 2,
          successRate: 98.8,
          fees: { min: '$0.30', max: '$1.80', avg: '$0.85' },
          supportedTokens: ['ETH', 'USDC']
        }
      ];

      return [...statuses, ...crossL2Bridges];
    } catch (error) {
      console.error('Error fetching bridge statuses:', error);
      return this.getMockBridgeStatuses();
    }
  }

  private async getBridgeStatus(bridgeConfig: any): Promise<BridgeStatus> {
    try {
      const fromProvider = new ethers.JsonRpcProvider(this.CHAIN_RPCS[bridgeConfig.fromChain]);
      const toProvider = new ethers.JsonRpcProvider(this.CHAIN_RPCS[bridgeConfig.toChain]);
      
      // Check if both chains are responsive
      const [fromBlock, toBlock] = await Promise.all([
        fromProvider.getBlockNumber().catch(() => 0),
        toProvider.getBlockNumber().catch(() => 0)
      ]);
      
      const status = (fromBlock > 0 && toBlock > 0) ? 'operational' : 'degraded';
      
      return {
        id: bridgeConfig.id,
        name: bridgeConfig.name,
        fromChain: bridgeConfig.fromChain,
        toChain: bridgeConfig.toChain,
        status,
        lastUpdate: Date.now(),
        volume24h: this.getMockVolume(bridgeConfig.id),
        totalValueLocked: this.getMockTVL(bridgeConfig.id),
        avgTransferTime: this.getExpectedTransferTime(bridgeConfig.fromChain, bridgeConfig.toChain),
        successRate: status === 'operational' ? 99.5 : 95.2,
        fees: this.getMockFees(bridgeConfig.id),
        supportedTokens: ['ETH', 'USDC', 'USDT', 'WBTC']
      };
    } catch (error) {
      console.error(`Error checking bridge ${bridgeConfig.id}:`, error);
      return {
        id: bridgeConfig.id,
        name: bridgeConfig.name,
        fromChain: bridgeConfig.fromChain,
        toChain: bridgeConfig.toChain,
        status: 'down',
        lastUpdate: Date.now(),
        volume24h: '$0',
        totalValueLocked: '$0',
        avgTransferTime: 0,
        successRate: 0,
        fees: { min: '$0', max: '$0', avg: '$0' },
        supportedTokens: []
      };
    }
  }

  async getBridgeTransactions(bridgeId: string, limit = 10): Promise<BridgeTransaction[]> {
    // Mock transaction data - in production would query bridge APIs/events
    return Array.from({ length: limit }, (_, i) => ({
      txHash: `0x${Math.random().toString(16).slice(2, 18).padStart(64, '0')}`,
      fromChain: 'Ethereum',
      toChain: 'Base',
      token: ['ETH', 'USDC', 'USDT'][Math.floor(Math.random() * 3)],
      amount: (Math.random() * 10).toFixed(4),
      status: ['completed', 'completed', 'completed', 'pending'][Math.floor(Math.random() * 4)] as any,
      timestamp: Date.now() - (Math.random() * 86400000),
      estimatedTime: 15,
      actualTime: Math.random() < 0.8 ? 12 + Math.random() * 10 : undefined,
      fromTxHash: `0x${Math.random().toString(16).slice(2, 18).padStart(64, '0')}`,
      toTxHash: Math.random() < 0.8 ? `0x${Math.random().toString(16).slice(2, 18).padStart(64, '0')}` : undefined
    }));
  }

  async getCrossChainRoutes(fromChain: string, toChain: string): Promise<CrossChainRoute | null> {
    const routes = {
      'Ethereum-Base': {
        fromChain: 'Ethereum',
        toChain: 'Base',
        bridges: [
          { name: 'Base Bridge', fee: '$5.20', time: 15, reliability: 99.5 },
          { name: 'Hop Protocol', fee: '$8.50', time: 8, reliability: 98.9 },
          { name: 'Across', fee: '$4.80', time: 12, reliability: 99.1 }
        ],
        bestRoute: { bridge: 'Across', reason: 'cheapest' as const }
      },
      'Ethereum-Optimism': {
        fromChain: 'Ethereum',
        toChain: 'Optimism',
        bridges: [
          { name: 'Optimism Bridge', fee: '$4.20', time: 20, reliability: 99.8 },
          { name: 'Hop Protocol', fee: '$7.30', time: 10, reliability: 99.0 },
          { name: 'Across', fee: '$3.90', time: 15, reliability: 99.2 }
        ],
        bestRoute: { bridge: 'Across', reason: 'cheapest' as const }
      },
      'Base-Optimism': {
        fromChain: 'Base',
        toChain: 'Optimism',
        bridges: [
          { name: 'Hop Protocol', fee: '$1.25', time: 3, reliability: 99.2 },
          { name: 'Across', fee: '$0.85', time: 2, reliability: 98.8 }
        ],
        bestRoute: { bridge: 'Across', reason: 'cheapest' as const }
      }
    };

    const routeKey = `${fromChain}-${toChain}`;
    return routes[routeKey as keyof typeof routes] || null;
  }

  async monitorBridgeHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    details: {
      operational: number;
      degraded: number;
      down: number;
      total: number;
    };
  }> {
    const bridges = await this.getAllBridgeStatuses();
    
    const operational = bridges.filter(b => b.status === 'operational').length;
    const degraded = bridges.filter(b => b.status === 'degraded' || b.status === 'maintenance').length;
    const down = bridges.filter(b => b.status === 'down').length;
    
    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (down > 0 || degraded > bridges.length * 0.3) {
      overall = 'critical';
    } else if (degraded > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      details: {
        operational,
        degraded,
        down,
        total: bridges.length
      }
    };
  }

  // Helper methods
  private getMockVolume(bridgeId: string): string {
    const volumes: Record<string, string> = {
      'op-bridge': '$67.2M',
      'base-bridge': '$89.5M',
      'mode-bridge': '$23.1M',
      'ink-bridge': '$15.7M',
      'hop-base-op': '$12.3M',
      'across-multi': '$5.8M'
    };
    return volumes[bridgeId] || '$0';
  }

  private getMockTVL(bridgeId: string): string {
    const tvls: Record<string, string> = {
      'op-bridge': '$234.5M',
      'base-bridge': '$312.8M',
      'mode-bridge': '$78.9M',
      'ink-bridge': '$45.2M',
      'hop-base-op': '$45.7M',
      'across-multi': '$23.1M'
    };
    return tvls[bridgeId] || '$0';
  }

  private getExpectedTransferTime(fromChain: string, toChain: string): number {
    if (fromChain === 'Ethereum') return 15; // L1 to L2 takes longer
    if (toChain === 'Ethereum') return 20;   // L2 to L1 takes longest (finalization)
    return 3; // L2 to L2 is fast
  }

  private getMockFees(bridgeId: string) {
    const feeRanges: Record<string, { min: string; max: string; avg: string }> = {
      'op-bridge': { min: '$2.10', max: '$15.80', avg: '$6.45' },
      'base-bridge': { min: '$1.80', max: '$12.50', avg: '$5.20' },
      'mode-bridge': { min: '$1.50', max: '$8.90', avg: '$3.85' },
      'ink-bridge': { min: '$2.30', max: '$14.20', avg: '$7.15' },
      'hop-base-op': { min: '$0.50', max: '$2.10', avg: '$1.25' },
      'across-multi': { min: '$0.30', max: '$1.80', avg: '$0.85' }
    };
    return feeRanges[bridgeId] || { min: '$0', max: '$0', avg: '$0' };
  }

  private getMockBridgeStatuses(): BridgeStatus[] {
    return [
      {
        id: 'op-bridge',
        name: 'Optimism Bridge',
        fromChain: 'Ethereum',
        toChain: 'Optimism',
        status: 'operational',
        lastUpdate: Date.now(),
        volume24h: '$67.2M',
        totalValueLocked: '$234.5M',
        avgTransferTime: 15,
        successRate: 99.5,
        fees: { min: '$2.10', max: '$15.80', avg: '$6.45' },
        supportedTokens: ['ETH', 'USDC', 'USDT', 'WBTC']
      },
      {
        id: 'base-bridge',
        name: 'Base Bridge',
        fromChain: 'Ethereum',
        toChain: 'Base',
        status: 'operational',
        lastUpdate: Date.now(),
        volume24h: '$89.5M',
        totalValueLocked: '$312.8M',
        avgTransferTime: 12,
        successRate: 99.8,
        fees: { min: '$1.80', max: '$12.50', avg: '$5.20' },
        supportedTokens: ['ETH', 'USDC', 'USDT', 'WBTC']
      }
    ];
  }
}

export const bridgeMonitor = new BridgeMonitorService();