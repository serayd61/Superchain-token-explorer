'use client';

import { useState, useEffect } from 'react';
import { opAnalytics, type OpAnalyticsData, type ChainMetrics, type CrossChainFlow } from '../lib/op-analytics';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Clock,
  DollarSign,
  ArrowRightLeft,
  ExternalLink,
  RefreshCw,
  Gauge,
  Network,
  Layers
} from 'lucide-react';

interface HealthIndicatorProps {
  status: 'healthy' | 'degraded' | 'down';
  label: string;
  value?: string;
}

function HealthIndicator({ status, label, value }: HealthIndicatorProps) {
  const statusConfig = {
    healthy: { color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950', icon: '🟢' },
    degraded: { color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950', icon: '🟡' },
    down: { color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950', icon: '🔴' }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${config.bgColor}`}>
      <span className="text-sm">{config.icon}</span>
      <span className={`font-medium ${config.color}`}>{label}</span>
      {value && <span className={`text-sm ${config.color}`}>({value})</span>}
    </div>
  );
}

export default function SuperchainHealthDashboard() {
  const [analytics, setAnalytics] = useState<OpAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await opAnalytics.getFullAnalytics();
      setAnalytics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Superchain Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-4">Failed to load analytics data</p>
            <Button onClick={fetchAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
              Superchain Analytics
            </h1>
            <p className="text-muted-foreground">Real-time ecosystem monitoring • Powered by OP Analytics</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Network Uptime</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {analytics.superchainHealth.networkUptime}%
                </p>
              </div>
              <Gauge className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatNumber(analytics.superchainHealth.totalTxs24h)}
                </p>
                <p className="text-xs text-blue-600">24h</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Finalization Rate</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {analytics.superchainHealth.finalizationRate}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Avg Block Time</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {analytics.superchainHealth.avgBlockTime.toFixed(1)}s
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bridge Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Network className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Bridge Network Status</h3>
                <p className="text-sm text-muted-foreground">Cross-chain infrastructure health</p>
              </div>
            </div>
            <HealthIndicator 
              status={analytics.superchainHealth.bridgeStatus} 
              label="Bridges"
              value="All operational"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Chain Overview</TabsTrigger>
          <TabsTrigger value="flows">Cross-Chain Flows</TabsTrigger>
          <TabsTrigger value="contracts">Top Contracts</TabsTrigger>
          <TabsTrigger value="health">Health Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {analytics.chainMetrics.map((chain) => (
              <Card key={chain.chainId} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        chain.healthScore >= 95 ? 'bg-green-500' : 
                        chain.healthScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      {chain.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Chain {chain.chainId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">TVL</p>
                      <p className="font-semibold text-lg">{chain.tvl}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Daily TXs</p>
                      <p className="font-semibold text-lg">{formatNumber(chain.dailyTxs)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Block #</p>
                      <p className="font-semibold text-lg">{formatNumber(chain.blockNumber)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="font-semibold text-lg">{chain.healthScore}/100</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bridge Volume (24h)</span>
                      <span className="font-medium">{chain.bridgeVolume24h}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Addresses</span>
                      <span className="font-medium">{formatNumber(chain.activeAddresses)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Cross-Chain Token Flows (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.crossChainFlows.map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{flow.fromChain}</span>
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{flow.toChain}</span>
                      </div>
                      <Badge variant="outline">{flow.token}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{flow.volume24h}</p>
                      <p className="text-sm text-muted-foreground">
                        {flow.transactions24h} txs • ~{flow.avgTransferTime}min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Contracts by Activity (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topContracts.map((contract, index) => (
                  <div key={contract.address} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">{contract.address.slice(0, 10)}...{contract.address.slice(-8)}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{contract.chain}</Badge>
                          <Badge variant="outline" className="text-xs">{contract.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(contract.txCount24h)} txs</p>
                      <p className="text-sm text-muted-foreground">{contract.gasUsed24h} ETH gas</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.chainMetrics.map((chain) => (
              <Card key={chain.chainId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{chain.name} Health</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        chain.healthScore >= 95 ? 'bg-green-500' : 
                        chain.healthScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-xl font-bold">{chain.healthScore}/100</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Block Production</span>
                      <span className="text-sm font-medium">
                        {chain.blockNumber > 0 ? '✅ Active' : '❌ Stalled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transaction Volume</span>
                      <span className="text-sm font-medium">
                        {chain.dailyTxs > 1000 ? '✅ High' : chain.dailyTxs > 100 ? '⚠️ Medium' : '❌ Low'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gas Efficiency</span>
                      <span className="text-sm font-medium">
                        {parseFloat(chain.gasPrice) < 2000000000 ? '✅ Optimal' : '⚠️ High'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bridge Connectivity</span>
                      <span className="text-sm font-medium">✅ Connected</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        chain.healthScore >= 95 ? 'bg-green-500' : 
                        chain.healthScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${chain.healthScore}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}