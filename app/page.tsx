'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

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

interface NavItem {
  id: string;
  label: string;
  href?: string;
  action?: string;
  icon: React.ReactNode;
  status?: 'online' | 'warning' | 'beta';
  badge?: string | number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

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

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', href: '/', icon: <GridIcon />, status: 'online' },
  { id: 'tokens', label: 'TOKEN EXPLORER', href: '/tokens', icon: <ScanIcon />, status: 'online' },
  { id: 'chains', label: 'CHAIN METRICS', action: 'chains', icon: <ChainIcon />, status: 'online' },
  { id: 'analytics', label: 'ANALYTICS', action: 'analytics', icon: <ChartIcon />, status: 'online' },
  { id: 'interop', label: 'INTEROP TRACKER', action: 'interop', icon: <BridgeIcon />, status: 'beta', badge: 'BETA' },
  { id: 'docs', label: 'API DOCS', href: '/docs', icon: <CodeIcon /> },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SuperchainTerminal() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Time update
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      setActiveSection(item.action);
    }
    closeSidebar();
  };

  // Close sidebar on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, closeSidebar]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-[#e8eaed] font-mono">
      {/* ═══════════════════════════════════════════════════════════════════
          SIDEBAR OVERLAY
      ═══════════════════════════════════════════════════════════════════ */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════════════════════════════ */}
      <aside 
        className={`fixed top-0 left-0 w-72 h-full bg-[#12151a] border-r border-[#2a3040] z-50 transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#2a3040]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff0420] to-[#0052ff] flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <div>
                <div className="text-[10px] text-[#5f6368] uppercase tracking-widest">Superchain</div>
                <div className="text-sm font-semibold">Terminal v2.0</div>
              </div>
            </div>
            <button 
              onClick={closeSidebar}
              className="w-8 h-8 flex items-center justify-center text-[#5f6368] hover:text-white hover:bg-[#1a1e25] transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="px-4 py-3 border-b border-[#2a3040] bg-[#1a1e25]">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#00d26a] shadow-[0_0_10px_rgba(0,210,106,0.5)]" />
            <span className="text-[#00d26a] uppercase tracking-wider">System Operational</span>
            <span className="text-[#3c4043] ml-auto">19 CHAINS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item, index) => {
              const isActive = activeSection === item.id || (item.id === 'dashboard' && activeSection === 'dashboard');
              
              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => handleNavClick(item)}
                      className={`flex items-center gap-3 px-3 py-3 text-xs tracking-wide transition-all relative group ${
                        isActive 
                          ? 'bg-[#1a1e25] text-white border-l-2 border-[#00d26a]' 
                          : 'text-[#9aa0a6] hover:bg-[#1a1e25] hover:text-white border-l-2 border-transparent'
                      }`}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-[#00d26a]' : 'text-[#5f6368] group-hover:text-[#9aa0a6]'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.status === 'online' && <span className="w-2 h-2 rounded-full bg-[#00d26a]" />}
                      {item.status === 'beta' && <span className="px-1.5 py-0.5 text-[9px] bg-[#2a3040] text-[#5f6368]">BETA</span>}
                      {typeof item.badge === 'number' && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-[#ff4444] text-white">{item.badge}</span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-xs tracking-wide transition-all relative group ${
                        isActive 
                          ? 'bg-[#1a1e25] text-white border-l-2 border-[#00d26a]' 
                          : 'text-[#9aa0a6] hover:bg-[#1a1e25] hover:text-white border-l-2 border-transparent'
                      }`}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-[#00d26a]' : 'text-[#5f6368] group-hover:text-[#9aa0a6]'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.status === 'online' && <span className="w-2 h-2 rounded-full bg-[#00d26a]" />}
                      {item.status === 'beta' && <span className="px-1.5 py-0.5 text-[9px] bg-[#2a3040] text-[#5f6368]">BETA</span>}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2a3040] bg-[#1a1e25]">
          <div className="text-[10px] text-[#3c4043] space-y-1">
            <div className="flex justify-between">
              <span>LAST SYNC</span>
              <span className="text-[#5f6368]">{overview?.last_updated ? 'Just now' : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span>API STATUS</span>
              <span className="text-[#00d26a]">{error ? 'ERROR' : 'HEALTHY'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="h-14 bg-[#12151a] border-b border-[#2a3040] flex items-center justify-between px-4 sticky top-0 z-30">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Button */}
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 border border-[#2a3040] hover:border-[#00d26a] hover:bg-[rgba(0,210,106,0.05)] transition-all group"
            aria-label="Open menu"
          >
            <span className={`block w-5 h-0.5 bg-[#9aa0a6] group-hover:bg-[#00d26a] transition-all ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#9aa0a6] group-hover:bg-[#00d26a] transition-all ${isSidebarOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#9aa0a6] group-hover:bg-[#00d26a] transition-all ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Logo */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#ff0420] to-[#0052ff] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">SC</span>
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">SUPERCHAIN TERMINAL</span>
              <span className="text-[10px] text-[#3c4043] ml-2">v2.0</span>
            </div>
          </div>
        </div>

        {/* Center: Status Indicators */}
        <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-wider">
          <StatusIndicator label="API" status={error ? 'offline' : 'online'} />
          <StatusIndicator label="RPC" status="online" />
          <StatusIndicator label="DATA" status="online" />
          <div className="h-4 w-px bg-[#2a3040]" />
          <div className="flex items-center gap-2 text-[#5f6368]">
            <span>CHAINS</span>
            <span className="text-[#00d26a] font-mono">{overview?.active_chains || 19}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5f6368]">
            <span>TOKENS</span>
            <span className="text-white font-mono">{overview?.total_tokens?.toLocaleString() || '--'}</span>
          </div>
        </div>

        {/* Right: Time + Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <div className="text-[10px] text-[#3c4043] uppercase tracking-wider">SYSTEM TIME</div>
            <div className="text-xs font-mono text-[#9aa0a6]">{currentTime}</div>
          </div>
          <Link 
            href="/tokens"
            className="px-4 py-2 bg-gradient-to-r from-[#ff0420] to-[#0052ff] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            EXPLORE TOKENS
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <main className="p-4 md:p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {activeSection === 'dashboard' && 'DASHBOARD'}
              {activeSection === 'chains' && 'CHAIN METRICS'}
              {activeSection === 'analytics' && 'ANALYTICS'}
              {activeSection === 'interop' && 'INTEROP TRACKER'}
            </h1>
            <p className="text-xs text-[#5f6368] mt-1 uppercase tracking-wider">
              Real-time Superchain ecosystem overview • 19 Networks
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00d26a] shadow-[0_0_10px_rgba(0,210,106,0.5)]" />
            <span className="text-[#00d26a]">LIVE</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#12151a] border border-[#2a3040] p-4 animate-pulse">
                <div className="h-3 w-16 bg-[#2a3040] mb-2" />
                <div className="h-6 w-24 bg-[#2a3040]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#12151a] border border-[#ff4444] border-l-4 p-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#ff4444] shadow-[0_0_10px_rgba(255,68,68,0.5)]" />
              <div>
                <div className="text-sm text-[#ff4444]">CONNECTION ERROR</div>
                <div className="text-xs text-[#5f6368]">Unable to fetch data from API - Check if backend is running</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {overview && activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard label="TOTAL CHAINS" value={overview.total_chains.toString()} subValue={`${overview.active_chains} active`} />
              <MetricCard label="TOTAL TOKENS" value={formatNumber(overview.total_tokens)} subValue="tracked" />
              <MetricCard label="24H VOLUME" value={formatCurrency(overview.total_volume_24h)} change={12.5} />
              <MetricCard label="TOTAL TVL" value={formatCurrency(overview.total_tvl)} change={-2.3} />
              <MetricCard label="INTEROP TOKENS" value={overview.interop_ready_tokens.toString()} subValue="cross-chain" status="online" />
              <MetricCard label="DATA LATENCY" value="~2.4s" subValue="avg response" status="online" />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chain Performance Table */}
              <div className="lg:col-span-2 bg-[#12151a] border border-[#2a3040]">
                <div className="px-4 py-3 border-b border-[#2a3040] flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-wider text-[#5f6368]">Chain Performance</h2>
                  <span className="text-[10px] text-[#3c4043]">SORTED BY TVL</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#1a1e25]">
                        <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#5f6368] font-medium">Chain</th>
                        <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#5f6368] font-medium">Tokens</th>
                        <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#5f6368] font-medium">24H Volume</th>
                        <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#5f6368] font-medium">TVL</th>
                        <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#5f6368] font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.chains
                        .sort((a, b) => b.total_tvl - a.total_tvl)
                        .slice(0, 10)
                        .map((chain) => (
                          <tr key={chain.slug} className="border-b border-[#2a3040] hover:bg-[rgba(0,210,106,0.03)] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3" style={{ backgroundColor: CHAIN_COLORS[chain.slug] || '#666' }} />
                                <span className="text-white">{chain.name}</span>
                                <span className="text-[10px] text-[#3c4043]">#{chain.chain_id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[#9aa0a6]">{chain.token_count.toLocaleString()}</td>
                            <td className="py-3 px-4 font-mono text-[#9aa0a6]">{formatCurrency(chain.total_volume_24h)}</td>
                            <td className="py-3 px-4 font-mono text-[#9aa0a6]">{formatCurrency(chain.total_tvl)}</td>
                            <td className="py-3 px-4">
                              <span className={`w-2 h-2 rounded-full inline-block ${chain.is_active ? 'bg-[#00d26a]' : 'bg-[#5f6368]'}`} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-[#12151a] border border-[#2a3040] flex flex-col">
                <div className="px-4 py-3 border-b border-[#2a3040]">
                  <h2 className="text-xs uppercase tracking-wider text-[#5f6368]">System Activity</h2>
                </div>
                <div className="flex-1 overflow-y-auto max-h-96">
                  <ActivityFeed />
                </div>
              </div>
            </div>

            {/* Chain Grid */}
            <div className="bg-[#12151a] border border-[#2a3040]">
              <div className="px-4 py-3 border-b border-[#2a3040]">
                <h2 className="text-xs uppercase tracking-wider text-[#5f6368]">Network Status Grid</h2>
              </div>
              <div className="p-4 grid grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-2">
                {overview.chains.map((chain) => (
                  <ChainTile key={chain.slug} chain={chain} />
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/tokens" className="bg-[#12151a] border border-[#2a3040] p-4 hover:border-[#00d26a] transition-colors group">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-semibold group-hover:text-[#00d26a] transition-colors">Token Explorer</div>
                <div className="text-[10px] text-[#5f6368]">Search & analyze tokens</div>
              </Link>
              <Link href="/docs" className="bg-[#12151a] border border-[#2a3040] p-4 hover:border-[#00b8d4] transition-colors group">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm font-semibold group-hover:text-[#00b8d4] transition-colors">API Documentation</div>
                <div className="text-[10px] text-[#5f6368]">Developer resources</div>
              </Link>
              <a href="https://atlas.optimism.io" target="_blank" rel="noopener noreferrer" className="bg-[#12151a] border border-[#2a3040] p-4 hover:border-[#ff0420] transition-colors group">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm font-semibold group-hover:text-[#ff0420] transition-colors">Optimism Atlas</div>
                <div className="text-[10px] text-[#5f6368]">Growth Grants</div>
              </a>
              <a href="https://github.com/serayd61/Superchain-token-explorer" target="_blank" rel="noopener noreferrer" className="bg-[#12151a] border border-[#2a3040] p-4 hover:border-white transition-colors group">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-semibold group-hover:text-white transition-colors">GitHub</div>
                <div className="text-[10px] text-[#5f6368]">Open source</div>
              </a>
            </div>
          </div>
        )}

        {/* Chains Section */}
        {overview && activeSection === 'chains' && (
          <ChainsSection chains={overview.chains} />
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <div className="bg-[#12151a] border border-[#2a3040] p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">Analytics Coming Soon</h2>
            <p className="text-[#5f6368]">Historical trends and comparative analytics</p>
          </div>
        )}

        {/* Interop Section */}
        {activeSection === 'interop' && (
          <div className="bg-[#12151a] border border-[#2a3040] p-8 text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-xl font-semibold mb-2">Interop Tracker (Beta)</h2>
            <p className="text-[#5f6368]">SuperchainERC20 token tracking</p>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="h-8 bg-[#12151a] border-t border-[#2a3040] flex items-center justify-between px-4 text-[10px] text-[#3c4043]">
        <div className="flex items-center gap-4">
          <span>SUPERCHAIN TOKEN EXPLORER</span>
          <span className="text-[#2a3040]">|</span>
          <span>19 CHAINS ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>OPTIMISM ATLAS ELIGIBLE</span>
          <span className="text-[#2a3040]">|</span>
          <a href="https://atlas.optimism.io" target="_blank" rel="noopener noreferrer" className="text-[#ff0420] hover:underline">
            GROWTH GRANTS
          </a>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StatusIndicator({ label, status }: { label: string; status: 'online' | 'degraded' | 'offline' }) {
  const colors = {
    online: '#00d26a',
    degraded: '#ffc107',
    offline: '#ff4444',
  };
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[status], boxShadow: status === 'online' ? '0 0 10px rgba(0,210,106,0.5)' : undefined }} />
      <span className="text-[#5f6368]">{label}</span>
    </div>
  );
}

function MetricCard({ label, value, subValue, change, status }: { label: string; value: string; subValue?: string; change?: number; status?: 'online' | 'warning' | 'critical' }) {
  return (
    <div className={`bg-[#12151a] border border-[#2a3040] p-4 relative overflow-hidden ${status === 'critical' ? 'border-l-[#ff4444]' : ''}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${status === 'online' ? 'bg-[#00d26a]' : status === 'warning' ? 'bg-[#ffc107]' : status === 'critical' ? 'bg-[#ff4444]' : 'bg-[#00d26a]'}`} />
      <div className="text-[10px] uppercase tracking-wider text-[#5f6368] mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {subValue && <div className="text-[10px] text-[#5f6368] mt-1">{subValue}</div>}
      {change !== undefined && (
        <div className={`text-[11px] mt-1 ${change >= 0 ? 'text-[#00d26a]' : 'text-[#ff4444]'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function ChainTile({ chain }: { chain: ChainMetric }) {
  const color = CHAIN_COLORS[chain.slug] || '#666';
  return (
    <div className="aspect-square border border-[#2a3040] p-2 flex flex-col items-center justify-center hover:border-[#3d4860] transition-colors cursor-pointer group" title={`${chain.name} - ${chain.token_count} tokens`}>
      <div className="w-4 h-4 mb-1 transition-transform group-hover:scale-110" style={{ backgroundColor: color, boxShadow: chain.is_active ? `0 0 10px ${color}40` : undefined }} />
      <div className="text-[8px] text-[#5f6368] uppercase truncate w-full text-center">{chain.slug}</div>
      <div className="text-[9px] font-mono text-[#3c4043]">{chain.token_count}</div>
    </div>
  );
}

function ActivityFeed() {
  const activities = [
    { message: 'New token detected on Base', time: '12s ago', status: 'info' },
    { message: 'Chain sync completed: Optimism', time: '45s ago', status: 'success' },
    { message: 'High volume spike on Unichain', time: '2m ago', status: 'warning' },
    { message: 'Interop token verified: USDC', time: '5m ago', status: 'success' },
    { message: 'Price feed updated: 847 tokens', time: '8m ago', status: 'info' },
    { message: 'API rate limit reset', time: '15m ago', status: 'info' },
  ];
  const statusColors = { info: '#00b8d4', success: '#00d26a', warning: '#ffc107', error: '#ff4444' };

  return (
    <div className="divide-y divide-[#2a3040]">
      {activities.map((activity, index) => (
        <div key={index} className="px-4 py-3 hover:bg-[#1a1e25] transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[activity.status as keyof typeof statusColors] }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#9aa0a6] truncate">{activity.message}</div>
              <div className="text-[10px] text-[#3c4043] mt-0.5">{activity.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChainsSection({ chains }: { chains: ChainMetric[] }) {
  return (
    <div className="space-y-6">
      {/* Tier Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((tier) => {
          const tierChains = chains.filter(c => c.priority === tier);
          return (
            <MetricCard key={tier} label={`TIER ${tier}`} value={tierChains.length.toString()} subValue={tier === 1 ? 'Primary' : tier === 2 ? 'Growing' : tier === 3 ? 'Emerging' : 'New'} />
          );
        })}
      </div>

      {/* Chain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chains.map((chain) => (
          <div key={chain.slug} className="bg-[#12151a] border border-[#2a3040] p-4 hover:border-[#3d4860] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: CHAIN_COLORS[chain.slug] || '#666' }}>
                  <span className="text-white text-[10px] font-bold">{chain.slug.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">{chain.name}</div>
                  <div className="text-[10px] text-[#3c4043]">ID: {chain.chain_id}</div>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${chain.is_active ? 'bg-[#00d26a]' : 'bg-[#5f6368]'}`} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[#3c4043]">TOKENS</div>
                <div className="text-[#9aa0a6] font-mono">{chain.token_count}</div>
              </div>
              <div>
                <div className="text-[#3c4043]">TIER</div>
                <div className="text-[#9aa0a6] font-mono">{chain.priority}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" />
      <rect x="9" y="1" width="6" height="6" />
      <rect x="1" y="9" width="6" height="6" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11L14 14" />
    </svg>
  );
}

function ChainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="4" cy="4" r="2" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="4" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 4H10M4 6V10M12 6V10M6 12H10" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 14V2M1 14H15M4 10L7 6L10 8L14 3" />
    </svg>
  );
}

function BridgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8H6M10 8H15" />
      <circle cx="8" cy="8" r="2" />
      <path d="M3 5V11M13 5V11" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4L1 8L5 12M11 4L15 8L11 12M9 2L7 14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 1L13 13M13 1L1 13" />
    </svg>
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
