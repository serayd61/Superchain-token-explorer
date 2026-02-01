'use client';

import { useState } from 'react';
import { useTrendingTokens, useTokens } from '@/lib/hooks/useTokens';
import { formatPrice, formatLargeNumber, formatPercentage, getPriceChangeColor, Token } from '@/lib/api';
import Link from 'next/link';

// Mini sparkline component
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-8" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

// Token card component
function TokenCard({ token, rank }: { token: Token; rank: number }) {
  const priceChangeColor = getPriceChangeColor(token.price_change_24h);
  const isPositive = (token.price_change_24h || 0) >= 0;
  
  // Mock sparkline data based on price change
  const mockSparkline = Array.from({ length: 24 }, (_, i) => {
    const basePrice = token.price_usd || 1;
    const change = (token.price_change_24h || 0) / 100;
    const progress = i / 23;
    return basePrice * (1 - change + change * progress) * (1 + (Math.random() - 0.5) * 0.02);
  });
  
  return (
    <Link href={`/tokens/${token.id}`}>
      <div className="bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600 rounded-xl p-4 transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 text-sm font-medium">#{rank}</span>
            <div>
              <h3 className="font-semibold text-white">{token.symbol}</h3>
              <p className="text-xs text-gray-400">{token.chain.name}</p>
            </div>
          </div>
          <MiniSparkline 
            data={mockSparkline} 
            color={isPositive ? '#22c55e' : '#ef4444'} 
          />
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-white font-mono">
              {formatPrice(token.price_usd)}
            </p>
            <p className="text-xs text-gray-400">
              Vol: {formatLargeNumber(token.volume_24h)}
            </p>
          </div>
          <div className={`text-right ${priceChangeColor}`}>
            <p className="text-sm font-semibold font-mono">
              {formatPercentage(token.price_change_24h)}
            </p>
            <p className="text-xs text-gray-500">24h</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Top gainers/losers component
function TopMovers({ tokens, title, icon }: { tokens: Token[]; title: string; icon: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">
        {tokens.slice(0, 5).map((token, index) => (
          <Link key={token.id} href={`/tokens/${token.id}`}>
            <div className="flex items-center justify-between hover:bg-gray-800/50 rounded-lg p-2 transition-all">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-sm w-4">{index + 1}</span>
                <div>
                  <p className="font-medium text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-400">{token.chain.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-white">{formatPrice(token.price_usd)}</p>
                <p className={`text-xs font-mono ${getPriceChangeColor(token.price_change_24h)}`}>
                  {formatPercentage(token.price_change_24h)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Chain stats component
function ChainStats() {
  const chains = [
    { name: 'Base', slug: 'base', color: 'from-blue-500 to-blue-700', tokens: 0, volume: 0 },
    { name: 'Optimism', slug: 'optimism', color: 'from-red-500 to-red-700', tokens: 0, volume: 0 },
    { name: 'Ink', slug: 'ink', color: 'from-purple-500 to-pink-500', tokens: 0, volume: 0 },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {chains.map((chain) => (
        <div 
          key={chain.slug}
          className={`bg-gradient-to-br ${chain.color} bg-opacity-20 border border-white/10 rounded-xl p-4`}
        >
          <h3 className="font-semibold text-white mb-2">{chain.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-300">Tokens</p>
              <p className="font-bold text-white">{chain.tokens || '-'}</p>
            </div>
            <div>
              <p className="text-gray-300">24h Vol</p>
              <p className="font-bold text-white">{chain.volume ? formatLargeNumber(chain.volume) : '-'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TokenCharts() {
  const [selectedChain, setSelectedChain] = useState<string | undefined>(undefined);
  const { data: tokensData, isLoading, error } = useTokens({ 
    chain: selectedChain, 
    sort: 'volume_24h', 
    limit: 12 
  });
  
  const tokens = tokensData?.items || [];
  
  // Sort for gainers and losers
  const sortedByChange = [...tokens].sort((a, b) => 
    (b.price_change_24h || 0) - (a.price_change_24h || 0)
  );
  const gainers = sortedByChange.filter(t => (t.price_change_24h || 0) > 0);
  const losers = [...sortedByChange].reverse().filter(t => (t.price_change_24h || 0) < 0);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
            Token Charts
          </span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real-time token prices across Base, Optimism, and Ink chains
        </p>
      </div>
      
      {/* Chain Filter */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setSelectedChain(undefined)}
          className={`px-4 py-2 rounded-lg transition-all ${
            !selectedChain 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Chains
        </button>
        <button
          onClick={() => setSelectedChain('base')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedChain === 'base' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Base
        </button>
        <button
          onClick={() => setSelectedChain('optimism')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedChain === 'optimism' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Optimism
        </button>
        <button
          onClick={() => setSelectedChain('ink')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedChain === 'ink' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Ink
        </button>
      </div>
      
      {/* Chain Stats */}
      <ChainStats />
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading tokens...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load tokens. Backend may not be running.</p>
          <p className="text-gray-500 text-sm mt-2">Make sure the API is deployed and running.</p>
        </div>
      )}
      
      {/* Token Grid */}
      {!isLoading && !error && tokens.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tokens.map((token, index) => (
              <TokenCard key={token.id} token={token} rank={index + 1} />
            ))}
          </div>
          
          {/* Top Movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopMovers tokens={gainers} title="Top Gainers" icon="🚀" />
            <TopMovers tokens={losers} title="Top Losers" icon="📉" />
          </div>
        </>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && tokens.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No tokens found.</p>
          <p className="text-gray-500 text-sm mt-2">Tokens will appear once the backend starts ingesting data.</p>
        </div>
      )}
      
      {/* View All Link */}
      <div className="text-center">
        <Link 
          href="/tokens"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
        >
          View All Tokens
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>
  );
}
