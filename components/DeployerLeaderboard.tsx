import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Coins, Activity, BarChart3, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TokenContract {
  deployer: string;
  metadata: {
    symbol: string;
  };
  lp_info: {
    status: string;
  };
  dex_data?: {
    liquidity?: string;
  };
}

interface DeployerLeaderboardProps {
  tokens: TokenContract[];
  isLoading?: boolean;
}

interface AnalyticsDashboardProps extends DeployerLeaderboardProps {
  showCharts?: boolean;
}

export default function DeployerLeaderboard({ tokens, isLoading, showCharts = false }: AnalyticsDashboardProps) {
  const deployerStats = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    // Group tokens by deployer
    const deployerMap = new Map<string, {
      address: string;
      tokenCount: number;
      withLpCount: number;
      totalLiquidity: number;
      tokens: string[];
    }>();

    tokens.forEach(token => {
      const deployer = token.deployer.toLowerCase();
      
      if (!deployerMap.has(deployer)) {
        deployerMap.set(deployer, {
          address: token.deployer,
          tokenCount: 0,
          withLpCount: 0,
          totalLiquidity: 0,
          tokens: []
        });
      }

      const stats = deployerMap.get(deployer)!;
      stats.tokenCount++;
      
      if (token.lp_info.status === 'YES') {
        stats.withLpCount++;
        if (token.dex_data?.liquidity) {
          stats.totalLiquidity += parseFloat(token.dex_data.liquidity);
        }
      }
      
      stats.tokens.push(token.metadata.symbol);
    });

    // Convert to array and sort by token count
    return Array.from(deployerMap.values())
      .sort((a, b) => b.tokenCount - a.tokenCount)
      .slice(0, 10); // Top 10 deployers
  }, [tokens]);

  // Time series data for charts
  const timeSeriesData = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    // Group by hour
    const hourlyData = new Map<string, { hour: string; deployments: number; withLP: number }>();
    
    tokens.forEach(token => {
      const date = new Date(token.timestamp || new Date());
      const hourKey = `${date.getHours()}:00`;
      
      if (!hourlyData.has(hourKey)) {
        hourlyData.set(hourKey, { hour: hourKey, deployments: 0, withLP: 0 });
      }
      
      const data = hourlyData.get(hourKey)!;
      data.deployments++;
      if (token.lp_info.status === 'YES') {
        data.withLP++;
      }
    });

    return Array.from(hourlyData.values()).slice(-24); // Last 24 hours
  }, [tokens]);

  // Chain distribution data
  const chainDistribution = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    const chainMap = new Map<string, number>();
    tokens.forEach(token => {
      const chain = token.chain || 'unknown';
      chainMap.set(chain, (chainMap.get(chain) || 0) + 1);
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return Array.from(chainMap.entries()).map(([chain, value], index) => ({
      name: chain,
      value,
      color: colors[index % colors.length]
    }));
  }, [tokens]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatLiquidity = (amount: number) => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${rank + 1}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Top Deployers</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (deployerStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Top Deployers</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No deployment data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-800">Top Deployers</h3>
        <span className="ml-auto text-sm text-gray-500">Last 24h</span>
      </div>

      <div className="space-y-3">
        {deployerStats.map((deployer, index) => {
          const successRate = deployer.tokenCount > 0 
            ? (deployer.withLpCount / deployer.tokenCount * 100).toFixed(0)
            : '0';

          return (
            <div
              key={deployer.address}
              className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                index < 3 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-transparent' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index < 3 ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-lg font-bold">{getRankIcon(index)}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://basescan.org/address/${deployer.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:text-blue-800"
                      >
                        {formatAddress(deployer.address)}
                      </a>
                      {index === 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded-full">
                          👑 Leader
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>{deployer.tokenCount} tokens</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{successRate}% with LP</span>
                      </div>
                      {deployer.totalLiquidity > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{formatLiquidity(deployer.totalLiquidity)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {deployer.tokenCount}
                  </div>
                  <div className="text-xs text-gray-500">deployments</div>
                </div>
              </div>

              {/* Token symbols preview */}
              <div className="mt-3 flex flex-wrap gap-1">
                {deployer.tokens.slice(0, 5).map((symbol, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {symbol}
                  </span>
                ))}
                {deployer.tokens.length > 5 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{deployer.tokens.length - 5} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {deployerStats.reduce((sum, d) => sum + d.tokenCount, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Tokens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {deployerStats.reduce((sum, d) => sum + d.withLpCount, 0)}
            </div>
            <div className="text-xs text-gray-500">With LP</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatLiquidity(deployerStats.reduce((sum, d) => sum + d.totalLiquidity, 0))}
            </div>
            <div className="text-xs text-gray-500">Total Liquidity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
