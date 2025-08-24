'use client';

import { useState, useEffect } from 'react';
import { gasTracker, type GasData, type GasComparison, type GasTrend } from '../lib/gas-tracker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Timer,
  Target,
  Lightbulb
} from 'lucide-react';

interface CongestionIndicatorProps {
  level: 'low' | 'medium' | 'high';
}

function CongestionIndicator({ level }: CongestionIndicatorProps) {
  const config = {
    low: { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900', icon: '🟢', label: 'Low' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900', icon: '🟡', label: 'Medium' },
    high: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', icon: '🔴', label: 'High' }
  };

  const { color, bg, icon, label } = config[level];

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${bg}`}>
      <span className="text-xs">{icon}</span>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
}

export default function GasComparison() {
  const [gasData, setGasData] = useState<GasData[]>([]);
  const [comparison, setComparison] = useState<GasComparison | null>(null);
  const [trends, setTrends] = useState<GasTrend[]>([]);
  const [selectedTxType, setSelectedTxType] = useState<'simple' | 'erc20' | 'uniswap' | 'bridge'>('simple');
  const [activeTab, setActiveTab] = useState('current');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchGasData();
    const interval = setInterval(fetchGasData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gasData.length > 0) {
      fetchComparison();
    }
  }, [selectedTxType, gasData]);

  const fetchGasData = async () => {
    try {
      setIsLoading(true);
      const [data, trendData] = await Promise.all([
        gasTracker.getAllGasData(),
        gasTracker.getGasTrends(24)
      ]);
      
      setGasData(data);
      setTrends(trendData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch gas data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      const comparisonData = await gasTracker.getGasComparison(selectedTxType);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
    }
  };

  const formatGwei = (gwei: number) => {
    return gwei < 1 ? gwei.toFixed(3) : gwei.toFixed(1);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable') return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getSpeedBadge = (chainName: string, comparison: GasComparison) => {
    if (chainName === comparison.cheapest) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Cheapest</Badge>;
    if (chainName === comparison.fastest) return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Fastest</Badge>;
    if (chainName === comparison.bestValue) return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Best Value</Badge>;
    return null;
  };

  if (isLoading && gasData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Gas Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Gas Tracker
            </h1>
            <p className="text-muted-foreground">Real-time gas price comparison across all chains</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={fetchGasData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-medium">Cheapest</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {comparison?.cheapest || 'Loading...'}
            </p>
            <p className="text-xs text-muted-foreground">
              {comparison && comparison.chains.find(c => c.chainName === comparison.cheapest)?.cost}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Fastest</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {comparison?.fastest || 'Loading...'}
            </p>
            <p className="text-xs text-muted-foreground">
              {comparison && comparison.chains.find(c => c.chainName === comparison.fastest)?.time}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Best Value</span>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {comparison?.bestValue || 'Loading...'}
            </p>
            <p className="text-xs text-muted-foreground">Optimal cost/speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Congested</span>
            </div>
            <p className="text-lg font-bold text-orange-600">
              {gasData.filter(d => d.congestion === 'high').length}
            </p>
            <p className="text-xs text-muted-foreground">
              of {gasData.length} chains
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Type Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transaction Type</h3>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Choose your transaction type for accurate comparison</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'simple', label: 'Simple Transfer', desc: 'Basic ETH/token transfer' },
              { key: 'erc20', label: 'ERC-20 Transfer', desc: 'Token contract interaction' },
              { key: 'uniswap', label: 'DEX Swap', desc: 'Uniswap-like transaction' },
              { key: 'bridge', label: 'Cross-Chain Bridge', desc: 'L1/L2 bridge operation' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedTxType(type.key as any)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTxType === type.key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Prices</TabsTrigger>
          <TabsTrigger value="comparison">Chain Comparison</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {gasData.map((data) => {
              const trend = trends.find(t => t.chainId === data.chainId);
              
              return (
                <Card key={data.chainId} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {data.chainName}
                        <CongestionIndicator level={data.congestion} />
                      </CardTitle>
                      {trend && (
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.trend, trend.percentageChange24h)}
                          <span className={`text-xs ${
                            trend.trend === 'up' ? 'text-red-500' : 
                            trend.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                          }`}>
                            {Math.abs(trend.percentageChange24h).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Slow</span>
                        <div className="text-right">
                          <span className="font-medium">{formatGwei(data.gasPriceGwei.slow)} gwei</span>
                          <p className="text-xs text-muted-foreground">
                            {data.estimatedCosts[selectedTxType].slow}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Standard</span>
                        <div className="text-right">
                          <span className="font-medium">{formatGwei(data.gasPriceGwei.standard)} gwei</span>
                          <p className="text-xs text-muted-foreground">
                            {data.estimatedCosts[selectedTxType].standard}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Fast</span>
                        <div className="text-right">
                          <span className="font-medium">{formatGwei(data.gasPriceGwei.fast)} gwei</span>
                          <p className="text-xs text-muted-foreground">
                            {data.estimatedCosts[selectedTxType].fast}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-between text-sm">
                      <span className="text-muted-foreground">Block Time</span>
                      <span className="font-medium">{data.blockTime}s</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {selectedTxType.charAt(0).toUpperCase() + selectedTxType.slice(1)} Transaction Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparison.chains.map((chain, index) => (
                    <div 
                      key={chain.chainName} 
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0 ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' :
                        index === 1 ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800' :
                        'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                        }`}>
                          {chain.ranking}
                        </div>
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {chain.chainName}
                            {getSpeedBadge(chain.chainName, comparison)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Confirmation time: {chain.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{chain.cost}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 ? 'Best price' : 
                           index === 1 ? `+$${(chain.costUsd - comparison.chains[0].costUsd).toFixed(2)}` :
                           `+$${(chain.costUsd - comparison.chains[0].costUsd).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trends.map((trend) => (
              <Card key={trend.chainId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{trend.chainName} Trend</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend, trend.percentageChange24h)}
                      <span className={`text-sm ${
                        trend.trend === 'up' ? 'text-red-500' : 
                        trend.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {trend.percentageChange24h > 0 ? '+' : ''}{trend.percentageChange24h.toFixed(1)}%
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {formatGwei(trend.prices[trend.prices.length - 1].gasPrice)} gwei
                      </p>
                      <p className="text-sm text-muted-foreground">Current gas price</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium text-green-600">
                          {trend.prices.filter(p => p.congestion === 'low').length}
                        </p>
                        <p className="text-muted-foreground">Low hours</p>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-600">
                          {trend.prices.filter(p => p.congestion === 'medium').length}
                        </p>
                        <p className="text-muted-foreground">Medium hours</p>
                      </div>
                      <div>
                        <p className="font-medium text-red-600">
                          {trend.prices.filter(p => p.congestion === 'high').length}
                        </p>
                        <p className="text-muted-foreground">High hours</p>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          trend.trend === 'up' ? 'bg-red-500' : 
                          trend.trend === 'down' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${Math.min(Math.abs(trend.percentageChange24h) * 5, 100)}%` }}
                      ></div>
                    </div>
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