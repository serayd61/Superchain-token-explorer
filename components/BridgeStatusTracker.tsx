'use client';

import { useState, useEffect } from 'react';
import { bridgeMonitor, type BridgeStatus, type BridgeTransaction, type CrossChainRoute } from '../lib/bridge-monitor';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { 
  Network,
  ArrowRightLeft,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

interface StatusIconProps {
  status: BridgeStatus['status'];
  size?: 'sm' | 'md' | 'lg';
}

function StatusIcon({ status, size = 'md' }: StatusIconProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeMap[size];

  switch (status) {
    case 'operational':
      return <CheckCircle className={`${iconSize} text-green-500`} />;
    case 'degraded':
    case 'maintenance':
      return <AlertTriangle className={`${iconSize} text-yellow-500`} />;
    case 'down':
      return <XCircle className={`${iconSize} text-red-500`} />;
    default:
      return <AlertTriangle className={`${iconSize} text-gray-500`} />;
  }
}

function StatusBadge({ status }: { status: BridgeStatus['status'] }) {
  const variants = {
    operational: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    maintenance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    down: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function BridgeStatusTracker() {
  const [bridges, setBridges] = useState<BridgeStatus[]>([]);
  const [bridgeHealth, setBridgeHealth] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('status');
  const [selectedBridge, setSelectedBridge] = useState<string | null>(null);
  const [bridgeTransactions, setBridgeTransactions] = useState<BridgeTransaction[]>([]);
  const [crossChainRoute, setCrossChainRoute] = useState<CrossChainRoute | null>(null);
  const [routeFrom, setRouteFrom] = useState('Ethereum');
  const [routeTo, setRouteTo] = useState('Base');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchBridgeData();
    const interval = setInterval(fetchBridgeData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedBridge) {
      fetchBridgeTransactions(selectedBridge);
    }
  }, [selectedBridge]);

  const fetchBridgeData = async () => {
    try {
      setIsLoading(true);
      const [bridgeStatuses, healthData] = await Promise.all([
        bridgeMonitor.getAllBridgeStatuses(),
        bridgeMonitor.monitorBridgeHealth()
      ]);
      
      setBridges(bridgeStatuses);
      setBridgeHealth(healthData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch bridge data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBridgeTransactions = async (bridgeId: string) => {
    try {
      const transactions = await bridgeMonitor.getBridgeTransactions(bridgeId, 10);
      setBridgeTransactions(transactions);
    } catch (error) {
      console.error('Failed to fetch bridge transactions:', error);
    }
  };

  const searchRoutes = async () => {
    try {
      const route = await bridgeMonitor.getCrossChainRoutes(routeFrom, routeTo);
      setCrossChainRoute(route);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusColor = (status: BridgeStatus['status']) => {
    switch (status) {
      case 'operational': return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'degraded': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'maintenance': return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'down': return 'border-red-500 bg-red-50 dark:bg-red-950';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  if (isLoading && bridges.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Bridge Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bridge Monitor
            </h1>
            <p className="text-muted-foreground">Cross-chain bridge health & transaction tracking</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={fetchBridgeData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      {bridgeHealth && (
        <Card className={`border-l-4 ${
          bridgeHealth.overall === 'healthy' ? 'border-l-green-500 bg-green-50 dark:bg-green-950' :
          bridgeHealth.overall === 'degraded' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
          'border-l-red-500 bg-red-50 dark:bg-red-950'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusIcon status={bridgeHealth.overall === 'healthy' ? 'operational' : 
                                  bridgeHealth.overall === 'degraded' ? 'degraded' : 'down'} size="lg" />
                <div>
                  <h3 className="text-xl font-semibold capitalize">
                    Cross-Chain Network Status: {bridgeHealth.overall}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bridgeHealth.details.operational} of {bridgeHealth.details.total} bridges operational
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{bridgeHealth.details.operational}</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{bridgeHealth.details.degraded}</p>
                  <p className="text-xs text-yellow-600">Degraded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{bridgeHealth.details.down}</p>
                  <p className="text-xs text-red-600">Down</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Bridge Status</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="routes">Route Finder</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bridges.map((bridge) => (
              <Card 
                key={bridge.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedBridge === bridge.id ? 'ring-2 ring-blue-500' : ''
                } ${getStatusColor(bridge.status)}`}
                onClick={() => setSelectedBridge(bridge.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <StatusIcon status={bridge.status} />
                      {bridge.name}
                    </CardTitle>
                    <StatusBadge status={bridge.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{bridge.fromChain}</span>
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>{bridge.toChain}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="font-semibold text-lg">{bridge.volume24h}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">TVL</p>
                      <p className="font-semibold text-lg">{bridge.totalValueLocked}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Time</p>
                      <p className="font-semibold text-lg">{formatTime(bridge.avgTransferTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="font-semibold text-lg">{bridge.successRate}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee Range</span>
                      <span className="font-medium">{bridge.fees.min} - {bridge.fees.max}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Supported Tokens</span>
                      <span className="font-medium">{bridge.supportedTokens.length} tokens</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {bridge.supportedTokens.slice(0, 4).map(token => (
                      <Badge key={token} variant="outline" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                    {bridge.supportedTokens.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{bridge.supportedTokens.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {selectedBridge ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Transactions - {bridges.find(b => b.id === selectedBridge)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bridgeTransactions.map((tx, index) => (
                    <div key={tx.txHash} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                tx.status === 'completed' ? 'border-green-500 text-green-700' :
                                tx.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                                tx.status === 'failed' ? 'border-red-500 text-red-700' :
                                'border-blue-500 text-blue-700'
                              }`}
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tx.amount} {tx.token} • {tx.fromChain} → {tx.toChain}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {tx.actualTime ? `${tx.actualTime}m` : `~${tx.estimatedTime}m`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleTimeString()}
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
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-lg text-muted-foreground">Select a bridge to view recent transactions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Cross-Chain Route Finder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">From Chain</label>
                  <select 
                    value={routeFrom} 
                    onChange={(e) => setRouteFrom(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ethereum">Ethereum</option>
                    <option value="Base">Base</option>
                    <option value="Optimism">Optimism</option>
                    <option value="Mode">Mode</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">To Chain</label>
                  <select 
                    value={routeTo} 
                    onChange={(e) => setRouteTo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Base">Base</option>
                    <option value="Optimism">Optimism</option>
                    <option value="Mode">Mode</option>
                    <option value="Ethereum">Ethereum</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={searchRoutes} className="w-full">
                    Find Routes
                  </Button>
                </div>
              </div>

              {crossChainRoute && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Available Routes</h3>
                  {crossChainRoute.bridges.map((route, index) => (
                    <div key={route.name} className={`p-4 rounded-lg border ${
                      route.name === crossChainRoute.bestRoute.bridge ? 
                      'border-green-500 bg-green-50 dark:bg-green-950' : 
                      'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{route.name}</span>
                          {route.name === crossChainRoute.bestRoute.bridge && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Best {crossChainRoute.bestRoute.reason.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Fee</p>
                            <p className="font-semibold">{route.fee}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="font-semibold">{route.time}m</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Reliability</p>
                            <p className="font-semibold">{route.reliability}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Bridge Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  ${bridges.reduce((sum, bridge) => {
                    const volume = parseFloat(bridge.volume24h.replace(/[$M]/g, ''));
                    return sum + (bridge.volume24h.includes('M') ? volume : volume / 1000);
                  }, 0).toFixed(1)}M
                </p>
                <p className="text-sm text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Network Reliability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {(bridges.reduce((sum, bridge) => sum + bridge.successRate, 0) / bridges.length).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Average success rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Avg Transfer Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(bridges.reduce((sum, bridge) => sum + bridge.avgTransferTime, 0) / bridges.length)}m
                </p>
                <p className="text-sm text-muted-foreground">Cross all bridges</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}