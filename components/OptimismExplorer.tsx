'use client';
import { useState, useEffect } from 'react';

interface OptimismExplorerProps {
  onProtocolSelect?: (protocol: any) => void;
}

interface Protocol {
  id: string;
  name: string;
  category: string;
  tvl: string;
  tvlChange24h: string;
  apy: string;
  volume24h: string;
  description: string;
  logo: string;
  riskLevel: 'low' | 'medium' | 'high';
  features: string[];
  opIncentives: {
    active: boolean;
    amount: string;
    duration: string;
  };
  metrics: {
    users: string;
    transactions: string;
    fees: string;
    growth: string;
  };
}

export default function OptimismExplorer({ onProtocolSelect }: OptimismExplorerProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [opIncentives, setOpIncentives] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('tvl');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    fetchProtocols();
  }, [selectedCategory, sortBy]);

  const fetchProtocols = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('chain', 'optimism');

      const response = await fetch(`/api/optimism-explorer/protocols?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProtocols(data.protocols);
        setStats(data.stats);
        setTrending(data.trending);
        setOpIncentives(data.opIncentives);
      }
    } catch (error) {
      console.error('Failed to fetch protocols:', error);
    }
    setIsLoading(false);
  };

  const categories = [
    { id: 'all', name: 'All Protocols', icon: '🌐' },
    { id: 'DEX', name: 'DEXes', icon: '🔄' },
    { id: 'Lending', name: 'Lending', icon: '🏦' },
    { id: 'Derivatives', name: 'Derivatives', icon: '📈' },
    { id: 'Staking', name: 'Staking', icon: '🥩' },
  ];

  const sortOptions = [
    { value: 'tvl', label: 'TVL' },
    { value: 'apy', label: 'APY' },
    { value: 'volume', label: '24h Volume' },
    { value: 'growth', label: 'Growth' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-3xl">🔴</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Optimism DeFi Explorer</h2>
            <p className="text-gray-400">Discover and analyze protocols on the Superchain</p>
          </div>
        </div>
      </div>

      {/* Ecosystem Stats */}
      {stats && (
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Ecosystem Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.totalTVL}</p>
              <p className="text-sm text-gray-400">Total TVL</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.totalVolume24h}</p>
              <p className="text-sm text-gray-400">24h Volume</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.totalUsers}</p>
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.protocolCount}</p>
              <p className="text-sm text-gray-400">Protocols</p>
            </div>
          </div>
          
          {stats.avgTVLChange24h && (
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-400">24h Change: </span>
              <span className={`font-semibold ${
                stats.avgTVLChange24h.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.avgTVLChange24h}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Trending Protocols */}
      {trending.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">🔥</span>
            Trending Protocols
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {trending.map((protocol, index) => (
              <div key={protocol.id} className="bg-black/30 rounded-lg p-4 border border-gray-600 hover:bg-black/50 transition-all">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-bold text-gray-400 mr-2">#{index + 1}</span>
                  <h4 className="font-semibold text-white text-sm">{protocol.name}</h4>
                </div>
                <p className="text-xs text-gray-400 mb-2">{protocol.category}</p>
                <div className="text-xs">
                  <p className="text-green-400">{protocol.change} 📈</p>
                  <p className="text-gray-300">{protocol.tvl}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OP Incentives */}
      {opIncentives.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">🎁</span>
            Active OP Incentives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opIncentives.slice(0, 3).map((incentive, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-white">{incentive.protocol}</h4>
                  <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">
                    {incentive.amount}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Category: <span className="text-white">{incentive.category}</span></p>
                  <p className="text-gray-400">Duration: <span className="text-green-400">{incentive.duration}</span></p>
                  <p className="text-gray-400">APY: <span className="text-yellow-400">{incentive.apy}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{category.icon}</span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-white"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Protocol Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-400 border-t-transparent mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading protocols...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocols.map((protocol) => (
            <div
              key={protocol.id}
              onClick={() => {
                setSelectedProtocol(protocol);
                onProtocolSelect?.(protocol);
              }}
              className="bg-gray-900/40 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/50 hover:border-red-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{protocol.logo}</div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">
                      {protocol.name}
                    </h3>
                    <p className="text-sm text-gray-400">{protocol.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    protocol.riskLevel === 'low' ? 'bg-green-600/20 text-green-400' :
                    protocol.riskLevel === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {protocol.riskLevel.toUpperCase()}
                  </span>
                  {protocol.opIncentives.active && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">
                      OP
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {protocol.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">TVL</p>
                  <p className="font-semibold text-white">{protocol.tvl}</p>
                  <p className={`text-xs ${
                    protocol.tvlChange24h.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {protocol.tvlChange24h}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">APY</p>
                  <p className="font-semibold text-green-400">{protocol.apy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-gray-500">Users</p>
                  <p className="text-white">{protocol.metrics.users}</p>
                </div>
                <div>
                  <p className="text-gray-500">Volume 24h</p>
                  <p className="text-white">{protocol.volume24h}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {protocol.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {protocol.opIncentives.active && (
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                  <p className="text-red-400 text-xs font-semibold mb-1">🎁 OP Incentives Active</p>
                  <p className="text-white text-xs">
                    {protocol.opIncentives.amount} • {protocol.opIncentives.duration}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Protocol Details Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedProtocol.logo}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedProtocol.name}</h2>
                  <p className="text-gray-400">{selectedProtocol.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{selectedProtocol.tvl}</p>
                <p className="text-sm text-gray-400">Total Value Locked</p>
                <p className={`text-xs mt-1 ${
                  selectedProtocol.tvlChange24h.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedProtocol.tvlChange24h}
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{selectedProtocol.apy}</p>
                <p className="text-sm text-gray-400">APY Range</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{selectedProtocol.volume24h}</p>
                <p className="text-sm text-gray-400">24h Volume</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">{selectedProtocol.metrics.users}</p>
                <p className="text-sm text-gray-400">Active Users</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">🔧 Features</h3>
                <div className="space-y-2">
                  {selectedProtocol.features.map((feature, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                      <span className="text-blue-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">📊 Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transactions</span>
                    <span className="text-white">{selectedProtocol.metrics.transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fees Generated</span>
                    <span className="text-white">{selectedProtocol.metrics.fees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Growth Rate</span>
                    <span className="text-green-400">{selectedProtocol.metrics.growth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level</span>
                    <span className={`${
                      selectedProtocol.riskLevel === 'low' ? 'text-green-400' :
                      selectedProtocol.riskLevel === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedProtocol.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedProtocol.opIncentives.active && (
              <div className="mt-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <span className="mr-2">🎁</span>
                  OP Incentives Program
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Reward Amount:</span>
                    <span className="text-red-400 ml-2 font-semibold">{selectedProtocol.opIncentives.amount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white ml-2">{selectedProtocol.opIncentives.duration}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}