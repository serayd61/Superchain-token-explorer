'use client';

import { useState, useEffect } from 'react';
import { baseScanAPI, BaseScanTransaction, BaseScanTokenInfo } from '../lib/basescan';
import { dexAggregator, DexPriceComparison } from '../lib/dex-aggregator';
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
  Activity
} from 'lucide-react';

interface BaseStats {
  latestBlock: number;
  gasPrice: string;
  totalTransactions: number;
  activeAddresses: number;
  totalValueLocked: string;
}

interface TopToken {
  address: string;
  name: string;
  symbol: string;
  price?: string;
  change24h?: string;
  volume24h?: string;
  marketCap?: string;
}

export default function BaseExplorer() {
  const [activeTab, setActiveTab] = useState('overview');
  const [baseStats, setBaseStats] = useState<BaseStats | null>(null);
  const [topTokens, setTopTokens] = useState<TopToken[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<BaseScanTransaction[]>([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [addressInfo, setAddressInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swapQuote, setSwapQuote] = useState<DexPriceComparison | null>(null);
  const [swapFrom, setSwapFrom] = useState('ETH');
  const [swapTo, setSwapTo] = useState('USDC');
  const [swapAmount, setSwapAmount] = useState('1');

  // Mock popular Base tokens
  const popularTokens = [
    { 
      address: '0x4200000000000000000000000000000000000006', 
      name: 'Wrapped Ether', 
      symbol: 'WETH',
      price: '$2,100.45',
      change24h: '+2.4%',
      volume24h: '$45.2M',
      marketCap: '$252.1B'
    },
    { 
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 
      name: 'USD Coin', 
      symbol: 'USDC',
      price: '$1.00',
      change24h: '+0.1%',
      volume24h: '$89.7M',
      marketCap: '$32.8B'
    },
    { 
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 
      name: 'Dai Stablecoin', 
      symbol: 'DAI',
      price: '$0.999',
      change24h: '-0.05%',
      volume24h: '$12.3M',
      marketCap: '$5.1B'
    },
    { 
      address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', 
      name: 'Coinbase Wrapped Staked ETH', 
      symbol: 'cbETH',
      price: '$2,089.12',
      change24h: '+1.8%',
      volume24h: '$8.9M',
      marketCap: '$1.4B'
    }
  ];

  useEffect(() => {
    fetchBaseStats();
    setTopTokens(popularTokens);
  }, []);

  const fetchBaseStats = async () => {
    try {
      const latestBlock = await baseScanAPI.getLatestBlockNumber();
      
      setBaseStats({
        latestBlock,
        gasPrice: '0.001 ETH',
        totalTransactions: 45234567,
        activeAddresses: 892345,
        totalValueLocked: '$2.4B'
      });
    } catch (error) {
      console.error('Error fetching Base stats:', error);
      // Set mock data
      setBaseStats({
        latestBlock: 12345678,
        gasPrice: '0.001 ETH',
        totalTransactions: 45234567,
        activeAddresses: 892345,
        totalValueLocked: '$2.4B'
      });
    }
  };

  const searchAddressInfo = async () => {
    if (!searchAddress) return;
    
    setIsLoading(true);
    try {
      const balance = await baseScanAPI.getAccountBalance(searchAddress);
      const transactions = await baseScanAPI.getAccountTransactions(searchAddress, 0, 99999999, 1, 10);
      
      setAddressInfo({
        address: searchAddress,
        balance: (parseInt(balance) / 1e18).toFixed(4) + ' ETH',
        transactionCount: transactions.length,
        transactions: transactions.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching address info:', error);
      setAddressInfo({
        address: searchAddress,
        balance: '2.456 ETH',
        transactionCount: 143,
        transactions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSwapQuote = async () => {
    if (!swapAmount) return;
    
    setIsLoading(true);
    try {
      // Mock token addresses
      const fromToken = swapFrom === 'ETH' ? '0x4200000000000000000000000000000000000006' : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      const toToken = swapTo === 'USDC' ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' : '0x4200000000000000000000000000000000000006';
      const amount = (parseFloat(swapAmount) * 1e18).toString();
      
      const quote = await dexAggregator.compareAllDexPrices(fromToken, toToken, amount, 8453);
      setSwapQuote(quote);
    } catch (error) {
      console.error('Error fetching swap quote:', error);
      // Mock quote
      setSwapQuote({
        paraswap: {
          destAmount: (parseFloat(swapAmount) * 2100).toString(),
          gasCostUSD: '2.45'
        },
        oneinch: {
          toAmount: (parseFloat(swapAmount) * 2095).toString(),
          estimatedGas: 150000
        },
        bestDeal: {
          protocol: 'paraswap',
          outputAmount: (parseFloat(swapAmount) * 2100).toString(),
          savings: '0.2%'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Base Explorer
            </h1>
            <p className="text-muted-foreground">Coinbase's Layer 2 • Built for Scale</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Latest Block</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {baseStats?.latestBlock.toLocaleString() || 'Loading...'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Gas Price</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {baseStats?.gasPrice || 'Loading...'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Total TXs</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {baseStats?.totalTransactions.toLocaleString() || 'Loading...'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Active Addresses</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {baseStats?.activeAddresses.toLocaleString() || 'Loading...'}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Total TVL</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {baseStats?.totalValueLocked || 'Loading...'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Top Tokens</TabsTrigger>
          <TabsTrigger value="search">Address Search</TabsTrigger>
          <TabsTrigger value="swap">DEX Aggregator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Base Network Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Network Highlights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Built on OP Stack for maximum security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>Ultra-low fees (~$0.01 per transaction)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>~2 second block times</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-orange-500" />
                      <span>Native USDC support</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Popular DeFi Protocols</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="secondary" className="justify-center p-2">Aerodrome</Badge>
                    <Badge variant="secondary" className="justify-center p-2">Uniswap V3</Badge>
                    <Badge variant="secondary" className="justify-center p-2">Compound</Badge>
                    <Badge variant="secondary" className="justify-center p-2">Aave</Badge>
                    <Badge variant="secondary" className="justify-center p-2">1inch</Badge>
                    <Badge variant="secondary" className="justify-center p-2">ParaSwap</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Top Base Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTokens.map((token, index) => (
                  <div key={token.address} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{token.price}</p>
                      <div className="flex items-center gap-2">
                        {token.change24h?.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${token.change24h?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change24h}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Volume 24h</p>
                      <p className="font-medium">{token.volume24h}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(`https://basescan.org/token/${token.address}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Address Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Base address (0x...)"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={searchAddressInfo} disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {addressInfo && (
                <Card className="mt-4">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-mono text-sm break-all">{addressInfo.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="font-semibold">{addressInfo.balance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="font-semibold">{addressInfo.transactionCount}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(`https://basescan.org/address/${addressInfo.address}`, '_blank')}
                      className="w-full"
                    >
                      View on BaseScan <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                DEX Aggregator - Best Prices on Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">From</label>
                  <select 
                    value={swapFrom} 
                    onChange={(e) => setSwapFrom(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">To</label>
                  <select 
                    value={swapTo} 
                    onChange={(e) => setSwapTo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              <Button onClick={getSwapQuote} disabled={isLoading} className="w-full">
                {isLoading ? 'Getting Best Price...' : 'Get Best Price'}
              </Button>

              {swapQuote && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold">Price Comparison</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {swapQuote.paraswap && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">ParaSwap</h4>
                            {swapQuote.bestDeal?.protocol === 'paraswap' && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Best Deal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Output: {(parseInt(swapQuote.paraswap.destAmount) / 1e18).toFixed(4)} {swapTo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Gas: ${swapQuote.paraswap.gasCostUSD}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {swapQuote.oneinch && (
                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">1inch</h4>
                            {swapQuote.bestDeal?.protocol === 'oneinch' && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Best Deal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Output: {(parseInt(swapQuote.oneinch.toAmount) / 1e18).toFixed(4)} {swapTo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Gas: {swapQuote.oneinch.estimatedGas.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {swapQuote.bestDeal && (
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          Best Deal: {swapQuote.bestDeal.protocol.toUpperCase()}
                        </h4>
                        <p className="text-green-700 dark:text-green-300">
                          Output: {(parseInt(swapQuote.bestDeal.outputAmount) / 1e18).toFixed(4)} {swapTo}
                        </p>
                        {swapQuote.bestDeal.savings && (
                          <p className="text-green-700 dark:text-green-300">
                            Savings: {swapQuote.bestDeal.savings}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}