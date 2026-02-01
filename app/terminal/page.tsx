'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ChainMetric {
  slug: string;
  name: string;
  chain_id: number;
  token_count: number;
  total_volume_24h: number;
  total_tvl: number;
  is_active: boolean;
  priority: number;
}

interface SuperchainOverview {
  total_chains: number;
  active_chains: number;
  total_tokens: number;
  total_volume_24h: number;
  total_tvl: number;
  interop_ready_tokens: number;
  chains: ChainMetric[];
  last_updated: string;
}

// Chain accent colors
const CHAIN_COLORS: Record<string, string> = {
  base: '#0052ff',
  optimism: '#ff0420',
  unichain: '#ff007a',
  world: '#00d4aa',
  ink: '#9945ff',
  soneium: '#ffffff',
  mode: '#dffe00',
  zora: '#5b5bd6',
  lisk: '#0d47a1',
  bob: '#f7931a',
  swell: '#00a3ff',
  mint: '#00ff88',
  shape: '#ff6b6b',
  metal: '#c0c0c0',
  polynomial: '#7b61ff',
  superseed: '#00ff00',
  race: '#ff4500',
  arena_z: '#ffd700',
  epic: '#8b5cf6',
};

export default function TerminalDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch superchain overview
  const { data: overview, isLoading, error } = useQuery<SuperchainOverview>({
    queryKey: ['superchain-overview'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/superchain/overview`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 30000,
    retry: 3,
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            DASHBOARD
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">
            Real-time Superchain ecosystem overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="status-dot online" />
          <span className="text-[var(--status-online)]">LIVE</span>
          <span className="text-[var(--text-muted)] ml-2">
            Updated {overview?.last_updated ? new Date(overview.last_updated).toLocaleTimeString() : '--'}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="metric-card animate-pulse">
              <div className="h-3 w-16 bg-[var(--terminal-border)] mb-2" />
              <div className="h-6 w-24 bg-[var(--terminal-border)]" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="metric-card critical">
          <div className="flex items-center gap-3">
            <span className="status-dot critical" />
            <div>
              <div className="text-sm text-[var(--status-critical)]">CONNECTION ERROR</div>
              <div className="text-xs text-[var(--text-tertiary)]">Unable to fetch data from API</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Metrics Grid */}
      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
            <MetricCard 
              label="TOTAL CHAINS" 
              value={overview.total_chains.toString()} 
              subValue={`${overview.active_chains} active`}
            />
            <MetricCard 
              label="TOTAL TOKENS" 
              value={formatNumber(overview.total_tokens)} 
              subValue="tracked"
            />
            <MetricCard 
              label="24H VOLUME" 
              value={formatCurrency(overview.total_volume_24h)} 
              change={12.5}
            />
            <MetricCard 
              label="TOTAL TVL" 
              value={formatCurrency(overview.total_tvl)} 
              change={-2.3}
            />
            <MetricCard 
              label="INTEROP TOKENS" 
              value={overview.interop_ready_tokens.toString()} 
              subValue="cross-chain"
              status="online"
            />
            <MetricCard 
              label="DATA LATENCY" 
              value="~2.4s" 
              subValue="avg response"
              status="online"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chain Performance Table */}
            <div className="lg:col-span-2 terminal-surface">
              <div className="px-4 py-3 border-b border-[var(--terminal-border)] flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                  Chain Performance
                </h2>
                <span className="text-[10px] text-[var(--text-muted)]">
                  SORTED BY TVL
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>CHAIN</th>
                      <th>TOKENS</th>
                      <th>24H VOLUME</th>
                      <th>TVL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.chains
                      .sort((a, b) => b.total_tvl - a.total_tvl)
                      .slice(0, 10)
                      .map((chain, index) => (
                        <tr 
                          key={chain.slug}
                          className="animate-slide-in-left"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2"
                                style={{ backgroundColor: CHAIN_COLORS[chain.slug] || '#666' }}
                              />
                              <span className="text-[var(--text-primary)]">{chain.name}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                #{chain.chain_id}
                              </span>
                            </div>
                          </td>
                          <td className="font-mono">{chain.token_count.toLocaleString()}</td>
                          <td className="font-mono">{formatCurrency(chain.total_volume_24h)}</td>
                          <td className="font-mono">{formatCurrency(chain.total_tvl)}</td>
                          <td>
                            <span className={`status-dot ${chain.is_active ? 'online' : 'offline'}`} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column - Activity Feed */}
            <div className="terminal-surface flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--terminal-border)]">
                <h2 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                  System Activity
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto max-h-96">
                <ActivityFeed />
              </div>
            </div>
          </div>

          {/* Chain Grid Visualization */}
          <div className="terminal-surface">
            <div className="px-4 py-3 border-b border-[var(--terminal-border)]">
              <h2 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                Network Status Grid
              </h2>
            </div>
            <div className="p-4 grid grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-2">
              {overview.chains.map((chain) => (
                <ChainStatusTile key={chain.slug} chain={chain} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function MetricCard({ 
  label, 
  value, 
  subValue, 
  change, 
  status 
}: { 
  label: string; 
  value: string; 
  subValue?: string;
  change?: number;
  status?: 'online' | 'warning' | 'critical';
}) {
  return (
    <div className={`metric-card ${status || ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {subValue && (
        <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{subValue}</div>
      )}
      {change !== undefined && (
        <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function ChainStatusTile({ chain }: { chain: ChainMetric }) {
  const color = CHAIN_COLORS[chain.slug] || '#666';
  
  return (
    <div 
      className="aspect-square border border-[var(--terminal-border)] p-2 flex flex-col items-center justify-center hover:border-[var(--terminal-border-active)] transition-colors cursor-pointer group"
      title={`${chain.name} - ${chain.token_count} tokens`}
    >
      <div 
        className="w-3 h-3 mb-1 transition-transform group-hover:scale-110"
        style={{ 
          backgroundColor: color,
          boxShadow: chain.is_active ? `0 0 10px ${color}40` : undefined
        }}
      />
      <div className="text-[8px] text-[var(--text-tertiary)] uppercase truncate w-full text-center">
        {chain.slug}
      </div>
      <div className="text-[9px] font-mono text-[var(--text-muted)]">
        {chain.token_count}
      </div>
    </div>
  );
}

function ActivityFeed() {
  const activities = [
    { type: 'token', message: 'New token detected on Base', time: '12s ago', status: 'info' },
    { type: 'sync', message: 'Chain sync completed: Optimism', time: '45s ago', status: 'success' },
    { type: 'alert', message: 'High volume spike on Unichain', time: '2m ago', status: 'warning' },
    { type: 'token', message: 'Interop token verified: USDC', time: '5m ago', status: 'success' },
    { type: 'sync', message: 'Price feed updated: 847 tokens', time: '8m ago', status: 'info' },
    { type: 'system', message: 'API rate limit reset', time: '15m ago', status: 'info' },
    { type: 'alert', message: 'New chain added: Swell', time: '1h ago', status: 'success' },
  ];

  const statusColors = {
    info: 'var(--status-info)',
    success: 'var(--status-online)',
    warning: 'var(--status-warning)',
    error: 'var(--status-critical)',
  };

  return (
    <div className="divide-y divide-[var(--terminal-border)]">
      {activities.map((activity, index) => (
        <div 
          key={index} 
          className="px-4 py-3 hover:bg-[var(--terminal-elevated)] transition-colors animate-slide-in-left"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusColors[activity.status as keyof typeof statusColors] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[var(--text-secondary)] truncate">
                {activity.message}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {activity.time}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K';
  return '$' + num.toFixed(2);
}
