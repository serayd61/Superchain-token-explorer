'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface ChainTVL {
  chain: string;
  name: string;
  tvl: number;
  tvl_prev_day?: number;
  tvl_prev_week?: number;
  change_1d?: number;
  change_7d?: number;
}

interface TVLSummary {
  total_tvl_usd: number;
  total_tvl_prev_day: number;
  change_24h: number;
  chains_count: number;
  chains: ChainTVL[];
  last_updated: string;
  source: string;
}

interface YieldPool {
  pool_id: string;
  chain: string;
  chain_name: string;
  project: string;
  symbol: string;
  tvl_usd: number;
  apy: number;
  apy_base: number;
  apy_reward: number;
  stable_coin: boolean;
  il_risk: string;
}

interface YieldsResponse {
  total_pools: number;
  pools: YieldPool[];
  by_chain: Record<string, YieldPool[]>;
  last_updated: string;
  source: string;
}

interface Protocol {
  name: string;
  slug: string;
  tvl: number;
  category: string;
  logo?: string;
  url?: string;
}

interface GrowthMetrics {
  tvl_metrics: {
    total_tvl_usd: number;
    tvl_change_24h: number;
    chains_tracked: number;
  };
  adoption_metrics: {
    total_tokens_tracked: number;
    interop_ready_tokens: number;
    interop_percentage: number;
    active_chains: number;
    total_eligible_chains: number;
  };
  grant_alignment: {
    supports_tvl_tracking: boolean;
    supports_interop: boolean;
    supports_cross_chain: boolean;
    eligible_for_growth_grants: boolean;
  };
  chains_by_tvl: ChainTVL[];
  last_updated: string;
  data_source: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const formatUSD = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export default function GrowthMetricsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tvl' | 'yields' | 'protocols'>('overview');
  const [selectedChain, setSelectedChain] = useState<string>('base');

  // Fetch real TVL data
  const { data: tvlData, isLoading: tvlLoading } = useQuery<TVLSummary>({
    queryKey: ['superchain-tvl-real'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/superchain/tvl/real`);
      if (!res.ok) throw new Error('Failed to fetch TVL');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch yields data
  const { data: yieldsData, isLoading: yieldsLoading } = useQuery<YieldsResponse>({
    queryKey: ['superchain-yields'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/superchain/yields`);
      if (!res.ok) throw new Error('Failed to fetch yields');
      return res.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch growth metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery<GrowthMetrics>({
    queryKey: ['growth-metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/superchain/growth-metrics`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    refetchInterval: 60000,
  });

  // Fetch protocols for selected chain
  const { data: protocolsData, isLoading: protocolsLoading } = useQuery<{ protocols: Protocol[]; total_tvl: number }>({
    queryKey: ['protocols', selectedChain],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/superchain/protocols/${selectedChain}`);
      if (!res.ok) throw new Error('Failed to fetch protocols');
      return res.json();
    },
    enabled: activeTab === 'protocols',
  });

  const isLoading = tvlLoading || metricsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-red-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
            Superchain Growth Metrics
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real-time TVL and yield data from DefiLlama - Track Superchain ecosystem growth for Optimism Growth Grants
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            Live Data
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            DefiLlama Powered
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
            19 Chains
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'tvl', label: 'TVL Breakdown', icon: '💰' },
          { id: 'yields', label: 'Top Yields', icon: '📈' },
          { id: 'protocols', label: 'Protocols', icon: '🏛️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Total Superchain TVL</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? '...' : formatUSD(tvlData?.total_tvl_usd || 0)}
              </div>
              <div className={`text-sm mt-1 ${(tvlData?.change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercent(tvlData?.change_24h)} (24h)
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Active Chains</div>
              <div className="text-3xl font-bold text-white">
                {metricsData?.adoption_metrics.active_chains || 0} / 19
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Superchain Networks
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Yield Pools</div>
              <div className="text-3xl font-bold text-white">
                {yieldsLoading ? '...' : yieldsData?.total_pools || 0}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Across all chains
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Interop Ready</div>
              <div className="text-3xl font-bold text-white">
                {metricsData?.adoption_metrics.interop_ready_tokens || 0}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Cross-chain tokens
              </div>
            </div>
          </div>

          {/* Grant Alignment */}
          <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> Growth Grants Alignment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm text-gray-400">TVL Tracking</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm text-gray-400">Interop Support</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm text-gray-400">Cross-Chain</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm text-gray-400">Grant Eligible</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://atlas.optimism.io/missions/growth-grants"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg hover:from-red-700 hover:to-purple-700 transition-all"
              >
                Apply for Growth Grants →
              </a>
            </div>
          </div>

          {/* Top Chains by TVL */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Top Chains by TVL</h3>
            <div className="space-y-3">
              {tvlData?.chains.slice(0, 5).map((chain, index) => (
                <div key={chain.chain} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <div className="font-semibold">{chain.name}</div>
                      <div className="text-sm text-gray-400">{chain.chain}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatUSD(chain.tvl)}</div>
                    <div className={`text-sm ${(chain.change_1d || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(chain.change_1d)} (24h)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TVL Breakdown Tab */}
      {activeTab === 'tvl' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">All Superchain TVL</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Chain</th>
                    <th className="pb-3 text-right">TVL</th>
                    <th className="pb-3 text-right">24h Change</th>
                    <th className="pb-3 text-right">7d Change</th>
                  </tr>
                </thead>
                <tbody>
                  {tvlData?.chains.map((chain, index) => (
                    <tr key={chain.chain} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 text-gray-500">#{index + 1}</td>
                      <td className="py-3">
                        <div className="font-semibold">{chain.name}</div>
                        <div className="text-sm text-gray-500">{chain.chain}</div>
                      </td>
                      <td className="py-3 text-right font-mono">{formatUSD(chain.tvl)}</td>
                      <td className={`py-3 text-right ${(chain.change_1d || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(chain.change_1d)}
                      </td>
                      <td className={`py-3 text-right ${(chain.change_7d || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(chain.change_7d)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Yields Tab */}
      {activeTab === 'yields' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Top Yield Opportunities</h3>
            <p className="text-gray-400 mb-4">
              Best APY pools across Superchain networks - Data from DefiLlama
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Pool</th>
                    <th className="pb-3">Chain</th>
                    <th className="pb-3">Project</th>
                    <th className="pb-3 text-right">TVL</th>
                    <th className="pb-3 text-right">APY</th>
                    <th className="pb-3 text-center">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {yieldsData?.pools.slice(0, 20).map((pool) => (
                    <tr key={pool.pool_id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3">
                        <div className="font-semibold">{pool.symbol}</div>
                      </td>
                      <td className="py-3 text-gray-400">{pool.chain_name}</td>
                      <td className="py-3 text-gray-400">{pool.project}</td>
                      <td className="py-3 text-right font-mono">{formatUSD(pool.tvl_usd)}</td>
                      <td className="py-3 text-right">
                        <span className="text-green-400 font-bold">{pool.apy?.toFixed(2)}%</span>
                      </td>
                      <td className="py-3 text-center">
                        {pool.stable_coin ? (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Stable</span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">Volatile</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-gray-400">Select Chain:</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              {tvlData?.chains.map((chain) => (
                <option key={chain.chain} value={chain.chain}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">
              Protocols on {tvlData?.chains.find(c => c.chain === selectedChain)?.name || selectedChain}
            </h3>
            {protocolsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading protocols...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {protocolsData?.protocols.slice(0, 15).map((protocol) => (
                  <div key={protocol.slug} className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      {protocol.logo && (
                        <img src={protocol.logo} alt={protocol.name} className="w-8 h-8 rounded-full" />
                      )}
                      <div>
                        <div className="font-semibold">{protocol.name}</div>
                        <div className="text-xs text-gray-500">{protocol.category}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-400">{formatUSD(protocol.tvl)}</div>
                    {protocol.url && (
                      <a
                        href={protocol.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Visit →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Source Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>
          Data sourced from{' '}
          <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            DefiLlama
          </a>
          {' '}• Last updated: {tvlData?.last_updated ? new Date(tvlData.last_updated).toLocaleString() : 'N/A'}
        </p>
      </div>
    </div>
  );
}
