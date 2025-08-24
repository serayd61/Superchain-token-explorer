'use client';

import { useState, useEffect } from 'react';
import { 
  crossChainAnalytics, 
  type ChainTokenStats, 
  type TokenBridgeActivity, 
  type TokenMovement,
  type MultiChainTokenProfile 
} from '../lib/cross-chain-analytics';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { 
  Network,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Users,
  DollarSign,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Search,
  Layers,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(amount: string): string {
  return amount.replace(/\$|,/g, '');
}

export default function CrossChainAnalytics() {
  const [chainStats, setChainStats] = useState<ChainTokenStats[]>([]);
  const [bridgeActivity, setBridgeActivity] = useState<TokenBridgeActivity[]>([]);
  const [recentMovements, setRecentMovements] = useState<TokenMovement[]>([]);
  const [tokenProfile, setTokenProfile] = useState<MultiChainTokenProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [searchToken, setSearchToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedToken && activeTab === 'token-profile') {
      fetchTokenProfile(selectedToken);
    }
  }, [selectedToken, activeTab]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [stats, bridge, movements] = await Promise.all([
        crossChainAnalytics.getAllChainTokenStats(),
        crossChainAnalytics.getTokenBridgeActivity(),
        crossChainAnalytics.getRecentTokenMovements(20)
      ]);
      
      setChainStats(stats);
      setBridgeActivity(bridge);
      setRecentMovements(movements);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenProfile = async (token: string) => {
    try {
      const profile = await crossChainAnalytics.getMultiChainTokenProfile(token);
      setTokenProfile(profile);
    } catch (error) {
      console.error('Failed to fetch token profile:', error);
    }
  };

  const searchTokenProfile = () => {
    if (searchToken.trim()) {
      setSelectedToken(searchToken.trim().toUpperCase());
      fetchTokenProfile(searchToken.trim());
    }
  };

  const getTotalStats = () => {
    return chainStats.reduce((acc, chain) => ({
      totalTokens: acc.totalTokens + chain.totalTokens,
      newTokens24h: acc.newTokens24h + chain.newTokens24h,
      totalMarketCap: acc.totalMarketCap + parseFloat(formatCurrency(chain.totalMarketCap).replace('B', '').replace('M', '')),
      uniqueHolders: acc.uniqueHolders + chain.uniqueHolders
    }), { totalTokens: 0, newTokens24h: 0, totalMarketCap: 0, uniqueHolders: 0 });
  };

  if (isLoading && chainStats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Cross-Chain Analytics...</p>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cross-Chain Analytics
            </h1>
            <p className="text-muted-foreground">Comprehensive multi-chain token analysis & bridge monitoring</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={fetchAllData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(totalStats.totalTokens)}
            </p>
            <p className="text-xs text-muted-foreground">Across all chains</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium">New Today</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(totalStats.newTokens24h)}
            </p>
            <p className="text-xs text-muted-foreground">Deployed 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Total Holders</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(totalStats.uniqueHolders)}
            </p>
            <p className="text-xs text-muted-foreground">Unique addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Bridge Volume</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {bridgeActivity.reduce((sum, activity) => {
                const volume = parseFloat(activity.totalBridgeVolume24h.replace(/[\$M]/g, ''));
                return sum + volume;
              }, 0).toFixed(0)}M
            </p>
            <p className="text-xs text-muted-foreground">24h volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Chain Overview</TabsTrigger>
          <TabsTrigger value="bridge-activity">Bridge Activity</TabsTrigger>
          <TabsTrigger value="token-profile">Token Profile</TabsTrigger>
          <TabsTrigger value="movements">Recent Movements</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {chainStats.map((chain) => (
              <Card key={chain.chainId}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{chain.chainName}</span>
                    <Badge variant="outline">Chain {chain.chainId}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tokens</p>
                      <p className="font-semibold text-lg">{formatNumber(chain.totalTokens)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">New 24h</p>
                      <p className="font-semibold text-lg text-green-600">+{chain.newTokens24h}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="font-semibold text-lg">{chain.totalMarketCap}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume 24h</p>
                      <p className="font-semibold text-lg">{chain.totalVolume24h}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Top Tokens by Volume</h4>
                    {chain.topTokensByVolume.slice(0, 3).map((token, index) => (
                      <div key={token.address} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{token.symbol}</span>
                          {token.verificationStatus === 'verified' && (
                            <span className="text-green-500">✓</span>
                          )}
                        </div>
                        <span className="text-muted-foreground">{token.volume24h}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bridge-activity" className="space-y-6">
          <div className="space-y-6">
            {bridgeActivity.map((activity) => (
              <Card key={activity.token}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span>{activity.symbol}</span>
                      <Badge variant="outline">{activity.token}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{activity.totalBridgeVolume24h}</p>
                      <p className="text-sm text-muted-foreground">24h volume</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Most Active Route</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.mostActiveRoute.from}</span>
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{activity.mostActiveRoute.to}</span>
                        <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {activity.mostActiveRoute.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activity.flows.map((flow, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">{flow.fromChain}</span>
                            <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{flow.toChain}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Volume</span>
                              <span className="font-medium">{flow.volume24h}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transactions</span>
                              <span className="font-medium">{flow.transactions24h}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg Amount</span>
                              <span className="font-medium">{flow.avgAmount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="token-profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Multi-Chain Token Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter token symbol (e.g., USDC, ETH)"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTokenProfile()}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button onClick={searchTokenProfile}>
                  Search Token
                </Button>
              </div>

              {tokenProfile && (
                <div className="space-y-6">
                  {/* Base Token Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          <span>{tokenProfile.baseToken.symbol}</span>
                          <p className="text-sm text-muted-foreground font-normal">{tokenProfile.baseToken.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{tokenProfile.baseToken.priceUsd}</p>
                          <div className="flex items-center gap-1">
                            {tokenProfile.baseToken.priceChange24h >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${tokenProfile.baseToken.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {tokenProfile.baseToken.priceChange24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Market Cap</p>
                          <p className="font-semibold">{tokenProfile.baseToken.marketCap}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Volume 24h</p>
                          <p className="font-semibold">{tokenProfile.baseToken.volume24h}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Holders</p>
                          <p className="font-semibold">{formatNumber(tokenProfile.holders.total)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Liquidity</p>
                          <p className="font-semibold">{tokenProfile.liquidity.total}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chain Deployments */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Chain Deployments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[tokenProfile.baseToken, ...tokenProfile.deployments].map((deployment) => (
                          <div key={`${deployment.chainId}-${deployment.address}`} className={`p-4 rounded-lg border ${
                            deployment.isOriginal ? 'border-gold-500 bg-yellow-50 dark:bg-yellow-950' : ''
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{deployment.chainName}</span>
                                {deployment.isOriginal && (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    Original
                                  </Badge>
                                )}
                                {deployment.verificationStatus === 'verified' && (
                                  <span className="text-green-500 text-sm">✓</span>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Score: {deployment.securityScore}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Supply</span>
                                <span className="font-medium">{formatNumber(parseFloat(deployment.totalSupply))}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Holders</span>
                                <span className="font-medium">{formatNumber(deployment.holders)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Volume 24h</span>
                                <span className="font-medium">{deployment.volume24h}</span>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground font-mono">
                                {deployment.address.slice(0, 10)}...{deployment.address.slice(-8)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Cross-Chain Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.slice(0, 20).map((movement, index) => (
                  <div key={movement.txHash} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{movement.amount} {movement.symbol}</span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              movement.status === 'completed' ? 'border-green-500 text-green-700' :
                              movement.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }`}
                          >
                            {movement.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{movement.fromChain}</span>
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{movement.toChain}</span>
                          <span>•</span>
                          <span>{movement.bridgeProtocol}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{movement.fees}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Token Distribution Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">
                  Select a token in the Token Profile tab to view its distribution across chains
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}