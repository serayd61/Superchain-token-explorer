'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

// API client for Superchain endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ChainStats {
  slug: string;
  name: string;
  chain_id: number;
  priority: number;
  is_active: boolean;
  token_count: number;
  total_volume_24h: number;
  total_tvl: number;
}

interface SuperchainOverview {
  total_chains: number;
  active_chains: number;
  total_tokens: number;
  total_volume_24h: number;
  total_tvl: number;
  interop_ready_tokens: number;
  chains: ChainStats[];
  last_updated: string;
}

interface InteropToken {
  symbol: string;
  canonical_address: string | null;
  is_interop_ready: boolean;
  chains_available: string[];
  addresses: Record<string, string>;
}

// Chain colors and icons
const CHAIN_STYLES: Record<string, { color: string; gradient: string }> = {
  base: { color: '#0052FF', gradient: 'from-blue-500 to-blue-700' },
  optimism: { color: '#FF0420', gradient: 'from-red-500 to-red-700' },
  unichain: { color: '#FF007A', gradient: 'from-pink-500 to-pink-700' },
  world: { color: '#00D4AA', gradient: 'from-teal-500 to-teal-700' },
  ink: { color: '#9945FF', gradient: 'from-purple-500 to-pink-500' },
  soneium: { color: '#000000', gradient: 'from-gray-700 to-gray-900' },
  mode: { color: '#DFFE00', gradient: 'from-yellow-400 to-yellow-600' },
  zora: { color: '#5B5BD6', gradient: 'from-indigo-500 to-indigo-700' },
  lisk: { color: '#0D47A1', gradient: 'from-blue-700 to-blue-900' },
  bob: { color: '#F7931A', gradient: 'from-orange-500 to-orange-700' },
  swell: { color: '#00A3FF', gradient: 'from-cyan-500 to-cyan-700' },
  mint: { color: '#00FF88', gradient: 'from-green-400 to-green-600' },
  shape: { color: '#FF6B6B', gradient: 'from-red-400 to-red-600' },
  metal: { color: '#C0C0C0', gradient: 'from-gray-400 to-gray-600' },
  polynomial: { color: '#7B61FF', gradient: 'from-violet-500 to-violet-700' },
  superseed: { color: '#00FF00', gradient: 'from-lime-500 to-lime-700' },
  race: { color: '#FF4500', gradient: 'from-orange-600 to-red-600' },
  arena_z: { color: '#FFD700', gradient: 'from-yellow-500 to-amber-600' },
  epic: { color: '#8B5CF6', gradient: 'from-purple-500 to-purple-700' },
};

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

// Chain card component
function ChainCard({ chain }: { chain: ChainStats }) {
  const style = CHAIN_STYLES[chain.slug] || { color: '#666', gradient: 'from-gray-500 to-gray-700' };
  
  return (
    <div className={`bg-gradient-to-br ${style.gradient} bg-opacity-20 border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{chain.name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${chain.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {chain.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400">Tokens</p>
          <p className="font-bold text-white">{chain.token_count}</p>
        </div>
        <div>
          <p className="text-gray-400">24h Volume</p>
          <p className="font-bold text-white">{formatNumber(chain.total_volume_24h)}</p>
        </div>
        <div>
          <p className="text-gray-400">TVL</p>
          <p className="font-bold text-white">{formatNumber(chain.total_tvl)}</p>
        </div>
        <div>
          <p className="text-gray-400">Chain ID</p>
          <p className="font-bold text-white">{chain.chain_id}</p>
        </div>
      </div>
    </div>
  );
}

// TVL comparison chart
function TVLChart({ chains }: { chains: ChainStats[] }) {
  const sortedChains = [...chains].sort((a, b) => b.total_tvl - a.total_tvl).slice(0, 10);
  const maxTVL = Math.max(...sortedChains.map(c => c.total_tvl)) || 1;
  
  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">TVL by Chain</h3>
      <div className="space-y-3">
        {sortedChains.map((chain) => {
          const style = CHAIN_STYLES[chain.slug] || { gradient: 'from-gray-500 to-gray-700' };
          const percentage = (chain.total_tvl / maxTVL) * 100;
          
          return (
            <div key={chain.slug} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{chain.name}</span>
                <span className="text-white font-mono">{formatNumber(chain.total_tvl)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${style.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Volume comparison chart
function VolumeChart({ chains }: { chains: ChainStats[] }) {
  const sortedChains = [...chains].sort((a, b) => b.total_volume_24h - a.total_volume_24h).slice(0, 10);
  const maxVolume = Math.max(...sortedChains.map(c => c.total_volume_24h)) || 1;
  
  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">24h Volume by Chain</h3>
      <div className="space-y-3">
        {sortedChains.map((chain) => {
          const style = CHAIN_STYLES[chain.slug] || { gradient: 'from-gray-500 to-gray-700' };
          const percentage = (chain.total_volume_24h / maxVolume) * 100;
          
          return (
            <div key={chain.slug} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{chain.name}</span>
                <span className="text-white font-mono">{formatNumber(chain.total_volume_24h)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${style.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Interop tokens section
function InteropTokensSection({ tokens }: { tokens: InteropToken[] }) {
  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Interop-Ready Tokens</h3>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
          Cross-Chain Compatible
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <div key={token.symbol} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{token.symbol}</span>
              <span className="text-xs text-green-400">Interop Ready</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Available on {token.chains_available.length} chains
            </p>
            <div className="flex flex-wrap gap-1">
              {token.chains_available.slice(0, 5).map((chain) => (
                <span key={chain} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                  {chain}
                </span>
              ))}
              {token.chains_available.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                  +{token.chains_available.length - 5}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperchainDashboard() {
  // Fetch overview data
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery<SuperchainOverview>({
    queryKey: ['superchain-overview'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/superchain/overview`);
      if (!res.ok) throw new Error('Failed to fetch overview');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
  });
  
  // Fetch interop tokens
  const { data: interopData } = useQuery<{ tokens: InteropToken[] }>({
    queryKey: ['interop-tokens'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/superchain/interop/tokens`);
      if (!res.ok) throw new Error('Failed to fetch interop tokens');
      return res.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
  
  const interopTokens = interopData?.tokens || [];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Superchain Analytics
          </span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real-time analytics across all 19 Optimism Atlas eligible chains
        </p>
        <a 
          href="https://atlas.optimism.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-sm text-blue-400 hover:text-blue-300"
        >
          Powered by Optimism Atlas
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      
      {/* Loading State */}
      {overviewLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading Superchain data...</p>
        </div>
      )}
      
      {/* Error State */}
      {overviewError && (
        <div className="text-center py-12 bg-red-900/20 border border-red-500/30 rounded-xl">
          <p className="text-red-400">Failed to load Superchain data</p>
          <p className="text-gray-500 text-sm mt-2">Make sure the backend API is running</p>
        </div>
      )}
      
      {/* Overview Stats */}
      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Total Chains</p>
              <p className="text-2xl font-bold text-white">{overview.total_chains}</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Active Chains</p>
              <p className="text-2xl font-bold text-green-400">{overview.active_chains}</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Total Tokens</p>
              <p className="text-2xl font-bold text-white">{overview.total_tokens.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">24h Volume</p>
              <p className="text-2xl font-bold text-blue-400">{formatNumber(overview.total_volume_24h)}</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Total TVL</p>
              <p className="text-2xl font-bold text-purple-400">{formatNumber(overview.total_tvl)}</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Interop Tokens</p>
              <p className="text-2xl font-bold text-green-400">{overview.interop_ready_tokens}</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TVLChart chains={overview.chains} />
            <VolumeChart chains={overview.chains} />
          </div>
          
          {/* Interop Tokens */}
          {interopTokens.length > 0 && (
            <InteropTokensSection tokens={interopTokens} />
          )}
          
          {/* Chain Grid */}
          <div>
            <h3 className="text-xl font-semibold mb-4">All Superchain Networks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {overview.chains.map((chain) => (
                <ChainCard key={chain.slug} chain={chain} />
              ))}
            </div>
          </div>
          
          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date(overview.last_updated).toLocaleString()}
          </div>
        </>
      )}
      
      {/* Atlas CTA */}
      <div className="bg-gradient-to-r from-red-900/20 via-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Building on Superchain?</h3>
        <p className="text-gray-400 mb-4">
          Apply for grants through Optimism Atlas - 6.33M OP available for Growth Grants
        </p>
        <a 
          href="https://atlas.optimism.io/missions/growth-grants"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl hover:from-red-700 hover:to-purple-700 transition-all font-semibold"
        >
          Apply for Grants
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
