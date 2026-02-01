'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ChainInfo {
  slug: string;
  name: string;
  chain_id: number;
  is_active: boolean;
  priority: number;
  tvl_rank: number;
  explorer_url: string;
  has_dex: boolean;
  dex_types: string[];
}

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

export default function ChainsPage() {
  const { data, isLoading, error } = useQuery<{ total: number; chains: ChainInfo[] }>({
    queryKey: ['chains'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/superchain/chains`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const chains = data?.chains || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            CHAIN METRICS
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">
            All 19 Optimism Atlas eligible networks
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-[var(--status-online)]">{chains.length}</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Networks</div>
        </div>
      </div>

      {/* Tier Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((tier) => {
          const tierChains = chains.filter(c => c.priority === tier);
          return (
            <div key={tier} className="metric-card">
              <div className="metric-label">TIER {tier}</div>
              <div className="metric-value">{tierChains.length}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
                {tier === 1 ? 'Primary' : tier === 2 ? 'Growing' : tier === 3 ? 'Emerging' : 'New'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chain Grid */}
      <div className="terminal-surface">
        <div className="px-4 py-3 border-b border-[var(--terminal-border)]">
          <h2 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
            Network Status
          </h2>
        </div>

        {isLoading && (
          <div className="p-8 text-center text-[var(--text-tertiary)]">
            <div className="inline-block w-6 h-6 border-2 border-[var(--terminal-border)] border-t-[var(--status-online)] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <span className="status-dot critical" />
            <p className="mt-2 text-xs text-[var(--status-critical)]">Failed to load chains</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--terminal-border)]">
            {chains.map((chain, index) => (
              <ChainCard key={chain.slug} chain={chain} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChainCard({ chain, index }: { chain: ChainInfo; index: number }) {
  const color = CHAIN_COLORS[chain.slug] || '#666';
  
  return (
    <div 
      className="bg-[var(--terminal-surface)] p-4 hover:bg-[var(--terminal-elevated)] transition-colors animate-slide-in-left"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="text-white text-[10px] font-bold">
              {chain.slug.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{chain.name}</div>
            <div className="text-[10px] text-[var(--text-muted)]">ID: {chain.chain_id}</div>
          </div>
        </div>
        <span className={`status-dot ${chain.is_active ? 'online' : 'offline'}`} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-[var(--text-muted)]">TIER</div>
          <div className="text-[var(--text-secondary)] font-mono">{chain.priority}</div>
        </div>
        <div>
          <div className="text-[var(--text-muted)]">TVL RANK</div>
          <div className="text-[var(--text-secondary)] font-mono">#{chain.tvl_rank}</div>
        </div>
        <div>
          <div className="text-[var(--text-muted)]">DEX</div>
          <div className="text-[var(--text-secondary)]">
            {chain.has_dex ? (
              <span className="text-[var(--status-online)]">Active</span>
            ) : (
              <span className="text-[var(--text-muted)]">--</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-[var(--text-muted)]">STATUS</div>
          <div className={chain.is_active ? 'text-[var(--status-online)]' : 'text-[var(--text-muted)]'}>
            {chain.is_active ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {chain.dex_types.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--terminal-border)]">
          <div className="flex flex-wrap gap-1">
            {chain.dex_types.slice(0, 3).map((dex) => (
              <span 
                key={dex} 
                className="px-1.5 py-0.5 bg-[var(--terminal-bg)] text-[9px] text-[var(--text-tertiary)] uppercase"
              >
                {dex.replace('_factory', '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {chain.explorer_url && (
        <a 
          href={chain.explorer_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-[10px] text-[var(--status-info)] hover:underline truncate"
        >
          {chain.explorer_url.replace('https://', '')}
        </a>
      )}
    </div>
  );
}
