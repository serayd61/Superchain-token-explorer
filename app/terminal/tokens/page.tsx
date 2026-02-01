'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Token {
  id: number;
  address: string;
  symbol: string;
  name: string;
  chain: { name: string; slug: string };
  price_usd: number | null;
  price_change_24h: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  has_liquidity: boolean;
  is_verified: boolean;
  is_interop_ready: boolean;
}

export default function TokensPage() {
  const [chainFilter, setChainFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('volume_24h');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens', chainFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '50',
        sort: sortBy,
        ...(chainFilter !== 'all' && { chain: chainFilter }),
      });
      const res = await fetch(`${API_BASE_URL}/api/tokens?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const tokens: Token[] = data?.items || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            TOKEN SCANNER
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">
            Real-time token tracking across all chains
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="status-dot online" />
          <span className="text-[var(--status-online)]">SCANNING</span>
        </div>
      </div>

      {/* Filters */}
      <div className="terminal-surface p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-2">
              SEARCH
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Token name or symbol..."
              className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--status-online)] focus:outline-none transition-colors"
            />
          </div>

          {/* Chain Filter */}
          <div className="w-full md:w-48">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-2">
              CHAIN
            </label>
            <select
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value)}
              className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--status-online)] focus:outline-none transition-colors"
            >
              <option value="all">All Chains</option>
              <option value="base">Base</option>
              <option value="optimism">Optimism</option>
              <option value="unichain">Unichain</option>
              <option value="world">World Chain</option>
              <option value="ink">Ink</option>
              <option value="mode">Mode</option>
              <option value="zora">Zora</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-48">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-2">
              SORT BY
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--status-online)] focus:outline-none transition-colors"
            >
              <option value="volume_24h">24h Volume</option>
              <option value="price_change_24h">Price Change</option>
              <option value="market_cap">Market Cap</option>
            </select>
          </div>
        </div>
      </div>

      {/* Token Table */}
      <div className="terminal-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--terminal-border)] flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
            Token List
          </h2>
          <span className="text-[10px] text-[var(--text-muted)]">
            {tokens.length} RESULTS
          </span>
        </div>

        {isLoading && (
          <div className="p-8 text-center text-[var(--text-tertiary)]">
            <div className="inline-block w-6 h-6 border-2 border-[var(--terminal-border)] border-t-[var(--status-online)] rounded-full animate-spin" />
            <p className="mt-2 text-xs">Loading tokens...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <span className="status-dot critical" />
            <p className="mt-2 text-xs text-[var(--status-critical)]">Failed to load tokens</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TOKEN</th>
                  <th>CHAIN</th>
                  <th>PRICE</th>
                  <th>24H CHANGE</th>
                  <th>VOLUME</th>
                  <th>MARKET CAP</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr 
                    key={token.id}
                    className="animate-slide-in-left cursor-pointer"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[var(--terminal-elevated)] flex items-center justify-center text-[10px] font-bold">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-[var(--text-primary)] font-medium">{token.symbol}</div>
                          <div className="text-[10px] text-[var(--text-muted)] truncate max-w-32">
                            {token.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 bg-[var(--terminal-elevated)] text-[10px] uppercase">
                        {token.chain.slug}
                      </span>
                    </td>
                    <td className="font-mono">
                      {token.price_usd ? `$${token.price_usd.toFixed(token.price_usd < 1 ? 6 : 2)}` : '--'}
                    </td>
                    <td className={`font-mono ${
                      token.price_change_24h && token.price_change_24h > 0 
                        ? 'text-[var(--status-online)]' 
                        : token.price_change_24h && token.price_change_24h < 0 
                          ? 'text-[var(--status-critical)]' 
                          : ''
                    }`}>
                      {token.price_change_24h 
                        ? `${token.price_change_24h > 0 ? '+' : ''}${token.price_change_24h.toFixed(2)}%` 
                        : '--'}
                    </td>
                    <td className="font-mono">
                      {token.volume_24h ? formatCurrency(token.volume_24h) : '--'}
                    </td>
                    <td className="font-mono">
                      {token.market_cap ? formatCurrency(token.market_cap) : '--'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {token.has_liquidity && (
                          <span className="status-dot online" title="Has liquidity" />
                        )}
                        {token.is_verified && (
                          <span className="text-[10px] text-[var(--status-info)]">✓</span>
                        )}
                        {token.is_interop_ready && (
                          <span className="text-[10px] px-1 bg-[var(--accent-optimism)]/20 text-[var(--accent-optimism)]">
                            INTEROP
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatCurrency(num: number): string {
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K';
  return '$' + num.toFixed(2);
}
