'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  Zap, 
  DollarSign,
  BarChart3,
  Coins,
  Clock,
  ArrowUpDown,
  Wallet,
  Shield,
  Activity,
  Globe,
  Users,
  Layers
} from 'lucide-react';

interface L2Network {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tvl: string;
  transactions: string;
  gasPrice: string;
  blockTime: string;
  mainTokens: Array<{
    symbol: string;
    name: string;
    price: string;
    change: string;
  }>;
  topDapps: Array<{
    name: string;
    category: string;
    tvl: string;
    users: string;
  }>;
  stats: {
    totalTransactions: string;
    activeAddresses: string;
    avgFees: string;
    uptime: string;
  };
  links: {
    website: string;
    explorer: string;
    bridge: string;
    docs: string;
  };
  rpcUrl: string;
  chainId: number;
}

export default function L2Explorer() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('base');
  const [activeTab, setActiveTab] = useState('overview');

  const l2Networks: L2Network[] = [
    {
      id: 'base',
      name: 'Base',
      icon: '🔵',
      color: 'from-blue-500 to-blue-600',
      description: 'Coinbase\'s Ethereum L2 built on OP Stack',
      tvl: '$2.8B',
      transactions: '2.5M/day',
      gasPrice: '0.001 ETH',
      blockTime: '2s',
      mainTokens: [
        { symbol: 'ETH', name: 'Ethereum', price: '$2,100', change: '+2.4%' },
        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.1%' },
        { symbol: 'cbETH', name: 'Coinbase Staked ETH', price: '$2,089', change: '+1.8%' }
      ],
      topDapps: [
        { name: 'Aerodrome', category: 'DEX', tvl: '$450M', users: '125K' },
        { name: 'Compound', category: 'Lending', tvl: '$280M', users: '45K' },
        { name: 'Uniswap V3', category: 'DEX', tvl: '$320M', users: '89K' }
      ],
      stats: {
        totalTransactions: '85.2M',
        activeAddresses: '892K',
        avgFees: '$0.05',
        uptime: '99.95%'
      },
      links: {
        website: 'https://base.org',
        explorer: 'https://basescan.org',
        bridge: 'https://bridge.base.org',
        docs: 'https://docs.base.org'
      },
      rpcUrl: 'https://mainnet.base.org',
      chainId: 8453
    },
    {
      id: 'optimism',
      name: 'Optimism',
      icon: '🔴',
      color: 'from-red-500 to-red-600',
      description: 'The original Optimistic Rollup scaling Ethereum',
      tvl: '$1.8B',
      transactions: '1.8M/day',
      gasPrice: '0.001 ETH',
      blockTime: '2s',
      mainTokens: [
        { symbol: 'OP', name: 'Optimism Token', price: '$2.34', change: '+5.67%' },
        { symbol: 'ETH', name: 'Ethereum', price: '$2,100', change: '+2.4%' },
        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.1%' }
      ],
      topDapps: [
        { name: 'Velodrome', category: 'DEX', tvl: '$180M', users: '67K' },
        { name: 'Aave V3', category: 'Lending', tvl: '$350M', users: '78K' },
        { name: 'Synthetix', category: 'Derivatives', tvl: '$95M', users: '23K' }
      ],
      stats: {
        totalTransactions: '145.8M',
        activeAddresses: '1.2M',
        avgFees: '$0.08',
        uptime: '99.92%'
      },
      links: {
        website: 'https://optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        bridge: 'https://app.optimism.io/bridge',
        docs: 'https://docs.optimism.io'
      },
      rpcUrl: 'https://mainnet.optimism.io',
      chainId: 10
    },
    {
      id: 'mode',
      name: 'Mode',
      icon: '🟢',
      color: 'from-green-500 to-green-600',
      description: 'DeFi-focused L2 with native yield generation',
      tvl: '$120M',
      transactions: '45K/day',
      gasPrice: '0.0005 ETH',
      blockTime: '2s',
      mainTokens: [
        { symbol: 'MODE', name: 'Mode Token', price: '$0.85', change: '+12.3%' },
        { symbol: 'ETH', name: 'Ethereum', price: '$2,100', change: '+2.4%' },
        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.1%' }
      ],
      topDapps: [
        { name: 'Mode DEX', category: 'DEX', tvl: '$45M', users: '12K' },
        { name: 'Ionic', category: 'Lending', tvl: '$28M', users: '5K' },
        { name: 'Kim Protocol', category: 'DEX', tvl: '$35M', users: '8K' }
      ],
      stats: {
        totalTransactions: '2.8M',
        activeAddresses: '45K',
        avgFees: '$0.03',
        uptime: '99.87%'
      },
      links: {
        website: 'https://mode.network',
        explorer: 'https://explorer.mode.network',
        bridge: 'https://bridge.mode.network',
        docs: 'https://docs.mode.network'
      },
      rpcUrl: 'https://mainnet.mode.network',
      chainId: 34443
    },
    {
      id: 'ink',
      name: 'Ink',
      icon: '🔥',
      color: 'from-purple-500 to-purple-600',
      description: 'Kraken\'s DeFi-focused L2 built for professional trading',
      tvl: '$450M',
      transactions: '125K/day',
      gasPrice: '0.0008 ETH',
      blockTime: '2s',
      mainTokens: [
        { symbol: 'INK', name: 'Ink Token', price: '$1.25', change: '+8.9%' },
        { symbol: 'ETH', name: 'Ethereum', price: '$2,100', change: '+2.4%' },
        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.1%' }
      ],
      topDapps: [
        { name: 'InkSwap', category: 'DEX', tvl: '$180M', users: '34K' },
        { name: 'Kraken DeFi', category: 'Lending', tvl: '$120M', users: '18K' },
        { name: 'Ink Perps', category: 'Derivatives', tvl: '$95M', users: '15K' }
      ],
      stats: {
        totalTransactions: '8.5M',
        activeAddresses: '125K',
        avgFees: '$0.04',
        uptime: '99.90%'
      },
      links: {
        website: 'https://inkonchain.com',
        explorer: 'https://explorer.inkonchain.com',
        bridge: 'https://bridge.inkonchain.com',
        docs: 'https://docs.inkonchain.com'
      },
      rpcUrl: 'https://rpc-gel.inkonchain.com',
      chainId: 57073
    },
    {
      id: 'unichain',
      name: 'Unichain',
      icon: '🦄',
      color: 'from-pink-500 to-pink-600',
      description: 'Uniswap\'s native L2 for optimal DEX performance',
      tvl: '$890M',
      transactions: '890K/day',
      gasPrice: '0.0003 ETH',
      blockTime: '1s',
      mainTokens: [
        { symbol: 'UNI', name: 'Uniswap Token', price: '$8.45', change: '+6.2%' },
        { symbol: 'ETH', name: 'Ethereum', price: '$2,100', change: '+2.4%' },
        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.1%' }
      ],
      topDapps: [
        { name: 'Uniswap V4', category: 'DEX', tvl: '$650M', users: '180K' },
        { name: 'Unichain Lend', category: 'Lending', tvl: '$150M', users: '45K' },
        { name: 'Hook Protocol', category: 'DeFi Tools', tvl: '$89M', users: '23K' }
      ],
      stats: {
        totalTransactions: '45.2M',
        activeAddresses: '456K',
        avgFees: '$0.02',
        uptime: '99.98%'
      },
      links: {
        website: 'https://unichain.org',
        explorer: 'https://unichain.org/explorer',
        bridge: 'https://bridge.unichain.org',
        docs: 'https://docs.unichain.org'
      },
      rpcUrl: 'https://rpc.unichain.org',
      chainId: 1301
    },
    {
      id: 'sonerium',
      name: 'Sonerium',
      icon: '💎',
      color: 'from-cyan-500 to-cyan-600',
      description: 'Sony\'s blockchain for digital entertainment and NFTs',
      tvl: '$75M',
      transactions: '28K/day',
      gasPrice: '0.0002 ETH',
      blockTime: '2s',
      mainTokens: [
        { symbol: 'SONE', name: 'Sonerium Token', price: '$0.95', change: '+15.4%' },
        { symbol: 'ETH', name: 'Ethereum', price: '$2,100', change: '+2.4%' },
        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '+0.1%' }
      ],
      topDapps: [
        { name: 'Sony NFT', category: 'NFT', tvl: '$25M', users: '8K' },
        { name: 'Sonerium DEX', category: 'DEX', tvl: '$18M', users: '4K' },
        { name: 'Digital Assets', category: 'Marketplace', tvl: '$12M', users: '6K' }
      ],
      stats: {
        totalTransactions: '1.2M',
        activeAddresses: '18K',
        avgFees: '$0.01',
        uptime: '99.85%'
      },
      links: {
        website: 'https://sonerium.org',
        explorer: 'https://explorer.sonerium.org',
        bridge: 'https://bridge.sonerium.org',
        docs: 'https://docs.sonerium.org'
      },
      rpcUrl: 'https://rpc.sonerium.org',
      chainId: 1946
    }
  ];

  const selectedL2 = l2Networks.find(network => network.id === selectedNetwork) || l2Networks[0];

  const totalTvl = l2Networks.reduce((acc, network) => {
    return acc + parseFloat(network.tvl.replace('$', '').replace('B', '000').replace('M', ''));
  }, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              L2 Explorer
            </h1>
            <p className="text-muted-foreground">Explore the Superchain Ecosystem</p>
          </div>
        </div>
      </div>

      {/* Superchain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Total TVL</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${(totalTvl / 1000).toFixed(1)}B+
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">L2 Networks</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {l2Networks.length}
                </p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Daily TXs</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  5.4M+
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Active Users</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  2.8M+
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Superchain Networks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {l2Networks.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedNetwork === network.id
                    ? `bg-gradient-to-br ${network.color} text-white border-transparent`
                    : 'bg-muted/50 hover:bg-muted/70 border-border'
                }`}
              >
                <div className="text-2xl mb-1">{network.icon}</div>
                <div className="font-medium">{network.name}</div>
                <div className="text-xs opacity-80 mt-1">{network.tvl} TVL</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Network Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Top Tokens</TabsTrigger>
          <TabsTrigger value="dapps">Top DApps</TabsTrigger>
          <TabsTrigger value="stats">Network Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className={`bg-gradient-to-br ${selectedL2.color} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedL2.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedL2.name}</h2>
                    <p className="opacity-90">{selectedL2.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-80">Chain ID</div>
                  <div className="text-xl font-bold">{selectedL2.chainId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm opacity-80">Total TVL</div>
                  <div className="text-lg font-bold">{selectedL2.tvl}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm opacity-80">Daily TXs</div>
                  <div className="text-lg font-bold">{selectedL2.transactions}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm opacity-80">Gas Price</div>
                  <div className="text-lg font-bold">{selectedL2.gasPrice}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm opacity-80">Block Time</div>
                  <div className="text-lg font-bold">{selectedL2.blockTime}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => window.open(selectedL2.links.website, '_blank')}
                >
                  Website <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => window.open(selectedL2.links.explorer, '_blank')}
                >
                  Explorer <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => window.open(selectedL2.links.bridge, '_blank')}
                >
                  Bridge <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Tokens on {selectedL2.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedL2.mainTokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{token.price}</p>
                    <div className="flex items-center gap-1">
                      {token.change.startsWith('+') ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${token.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dapps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top DApps on {selectedL2.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedL2.topDapps.map((dapp, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <h4 className="font-semibold">{dapp.name}</h4>
                    <Badge variant="secondary">{dapp.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">TVL: {dapp.tvl}</div>
                    <div className="text-sm text-muted-foreground">Users: {dapp.users}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-semibold">{selectedL2.stats.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Addresses</span>
                  <span className="font-semibold">{selectedL2.stats.activeAddresses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Fees</span>
                  <span className="font-semibold">{selectedL2.stats.avgFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Uptime</span>
                  <span className="font-semibold text-green-500">{selectedL2.stats.uptime}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">RPC URL</p>
                  <p className="font-mono text-sm break-all">{selectedL2.rpcUrl}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chain ID</p>
                  <p className="font-semibold">{selectedL2.chainId}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(selectedL2.links.docs, '_blank')}
                  >
                    Documentation
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedL2.rpcUrl);
                      // You could add a toast notification here
                    }}
                  >
                    Copy RPC
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}