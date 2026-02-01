'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<'online' | 'degraded' | 'offline'>('online');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[var(--terminal-surface)] border-b border-[var(--terminal-border)] flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className={`hamburger ${isSidebarOpen ? 'active' : ''}`}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isSidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo / Title */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[var(--accent-optimism)] to-[var(--accent-base)] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">SC</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              SUPERCHAIN TERMINAL
            </span>
          </div>
          <div className="h-4 w-px bg-[var(--terminal-border)]" />
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
            v2.0.0
          </span>
        </div>
      </div>

      {/* Center Section - System Status Bar */}
      <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-wider">
        <StatusIndicator 
          label="API" 
          status={systemStatus} 
        />
        <StatusIndicator 
          label="RPC" 
          status="online" 
        />
        <StatusIndicator 
          label="DATA" 
          status="online" 
        />
        <div className="h-4 w-px bg-[var(--terminal-border)]" />
        <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
          <span>CHAINS</span>
          <span className="text-[var(--status-online)] font-mono">19</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
          <span>TOKENS</span>
          <span className="text-[var(--text-primary)] font-mono">12,847</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Time Display */}
        <div className="hidden lg:block text-right">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            SYSTEM TIME
          </div>
          <div className="text-xs font-mono text-[var(--text-secondary)]">
            {currentTime}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button 
            className="w-8 h-8 flex items-center justify-center border border-[var(--terminal-border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--terminal-border-active)] transition-colors"
            aria-label="Refresh data"
          >
            <RefreshIcon />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center border border-[var(--terminal-border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--terminal-border-active)] transition-colors relative"
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--status-critical)] text-white text-[9px] flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function StatusIndicator({ label, status }: { label: string; status: 'online' | 'degraded' | 'offline' }) {
  const statusColors = {
    online: 'var(--status-online)',
    degraded: 'var(--status-warning)',
    offline: 'var(--status-critical)',
  };

  return (
    <div className="flex items-center gap-2">
      <span 
        className="w-2 h-2 rounded-full"
        style={{ 
          backgroundColor: statusColors[status],
          boxShadow: status === 'online' ? 'var(--glow-green)' : undefined 
        }}
      />
      <span className="text-[var(--text-tertiary)]">{label}</span>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 7C1 3.7 3.7 1 7 1C9.4 1 11.5 2.4 12.5 4.5" />
      <path d="M13 7C13 10.3 10.3 13 7 13C4.6 13 2.5 11.6 1.5 9.5" />
      <path d="M12 1V5H8" />
      <path d="M2 13V9H6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 1C4.8 1 3 3 3 5V9L1 11H13L11 9V5C11 3 9.2 1 7 1Z" />
      <path d="M5 11V12C5 13.1 5.9 14 7 14C8.1 14 9 13.1 9 12V11" />
    </svg>
  );
}
