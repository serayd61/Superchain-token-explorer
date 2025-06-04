import React, { useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Temporary interface definition - should match the one in TokenScanner.tsx
interface TokenContract {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  deployer: string;
  deploymentTx: string;
  deploymentBlock: number;
  deploymentTimestamp: number;
  chain: string;
  hasLiquidity: boolean;
  liquidityInfo?: {
    wethPaired: boolean;
    pairAddress: string;
    reserves: {
      token: string;
      weth: string;
    };
  };
}

interface DeployerLeaderboardProps {
  tokens: any[]; // Geçici olarak any kullanıyoruz
  isLoading?: boolean;
  showCharts?: boolean;
}

interface DeployerStats {
  address: string;
  tokenCount: number;
  totalLiquidity: number;
  successRate: number;
  tokens: TokenContract[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DeployerLeaderboard: React.FC<DeployerLeaderboardProps> = ({ tokens, isLoading, showCharts = true }) => {
  const deployerStats = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    
    const stats = new Map<string, DeployerStats>();
    
    tokens.forEach(token => {
      if (!token || !token.deployer) return; // Skip invalid tokens
      
      const deployer = token.deployer;
      if (!stats.has(deployer)) {
        stats.set(deployer, {
          address: deployer,
          tokenCount: 0,
          totalLiquidity: 0,
          successRate: 0,
          tokens: []
        });
      }
      
      const stat = stats.get(deployer)!;
      stat.tokenCount++;
      stat.tokens.push(token);
      
      if (token.hasLiquidity && token.liquidityInfo) {
        const wethReserve = parseFloat(token.liquidityInfo.reserves.weth) / 1e18;
        stat.totalLiquidity += wethReserve;
      }
    });
    
    // Calculate success rate (tokens with liquidity)
    stats.forEach(stat => {
      const withLiquidity = stat.tokens.filter(t => t.hasLiquidity).length;
      stat.successRate = (withLiquidity / stat.tokenCount) * 100;
    });
    
    return Array.from(stats.values())
      .sort((a, b) => b.tokenCount - a.tokenCount)
      .slice(0, 20); // Top 20 deployers
  }, [tokens]);

  const chainDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    tokens.forEach(token => {
      distribution.set(token.chain, (distribution.get(token.chain) || 0) + 1);
    });
    
    return Array.from(distribution.entries()).map(([chain, count]) => ({
      name: chain,
      value: count
    }));
  }, [tokens]);

  const timeSeriesData = useMemo(() => {
    const hourlyData = new Map<string, number>();
    
    tokens.forEach(token => {
      const date = new Date(token.deploymentTimestamp ? token.deploymentTimestamp * 1000 : Date.now());
      const hourKey = `${date.getHours()}:00`;
      
      if (!hourlyData.has(hourKey)) {
        hourlyData.set(hourKey, 0);
      }
      hourlyData.set(hourKey, hourlyData.get(hourKey)! + 1);
    });
    
    return Array.from(hourlyData.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => {
        const hourA = parseInt(a.hour);
        const hourB = parseInt(b.hour);
        return hourA - hourB;
      });
  }, [tokens]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Deployer Analytics</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        ) : tokens && tokens.length > 0 ? (
          <>
            {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-gray-600">Total Tokens</div>
            <div className="text-2xl font-bold">{tokens.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-gray-600">Unique Deployers</div>
            <div className="text-2xl font-bold">{deployerStats.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="text-sm text-gray-600">With Liquidity</div>
            <div className="text-2xl font-bold">
              {tokens.filter(t => t.hasLiquidity).length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold">
              {((tokens.filter(t => t.hasLiquidity).length / tokens.length) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Top Deployers Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Top Deployers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deployer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    With Liquidity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total ETH in LPs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deployerStats.slice(0, 10).map((stat, index) => (
                  <tr key={stat.address}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {stat.address.substring(0, 6)}...{stat.address.substring(38)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.tokenCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.tokens.filter(t => t.hasLiquidity).length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{stat.successRate.toFixed(1)}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${stat.successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.totalLiquidity.toFixed(4)} ETH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deployment Time Distribution */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Deployments by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chain Distribution */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chainDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chainDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate by Deployer */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Success Rate by Top Deployers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deployerStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="address" 
                  tickFormatter={(value) => `${value.substring(0, 6)}...`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `${value.substring(0, 6)}...${value.substring(38)}`}
                />
                <Bar dataKey="successRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No token data available for analytics
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployerLeaderboard;
