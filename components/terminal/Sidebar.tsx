'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  status?: 'online' | 'warning' | 'critical' | 'offline';
  badge?: string | number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'DASHBOARD',
    href: '/terminal',
    icon: <GridIcon />,
    status: 'online',
  },
  {
    id: 'tokens',
    label: 'TOKEN SCANNER',
    href: '/terminal/tokens',
    icon: <ScanIcon />,
    status: 'online',
    badge: 'LIVE',
  },
  {
    id: 'chains',
    label: 'CHAIN METRICS',
    href: '/terminal/chains',
    icon: <ChainIcon />,
    status: 'online',
  },
  {
    id: 'analytics',
    label: 'ANALYTICS',
    href: '/terminal/analytics',
    icon: <ChartIcon />,
    status: 'online',
  },
  {
    id: 'interop',
    label: 'INTEROP TRACKER',
    href: '/terminal/interop',
    icon: <BridgeIcon />,
    status: 'warning',
    badge: 'BETA',
  },
  {
    id: 'alerts',
    label: 'ALERTS',
    href: '/terminal/alerts',
    icon: <BellIcon />,
    badge: 3,
  },
  {
    id: 'api',
    label: 'API ACCESS',
    href: '/docs',
    icon: <CodeIcon />,
  },
  {
    id: 'settings',
    label: 'SETTINGS',
    href: '/terminal/settings',
    icon: <GearIcon />,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus inside sidebar when open
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector('a, button');
      (firstFocusable as HTMLElement)?.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--terminal-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--accent-optimism)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <div>
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                  Superchain
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Terminal v2.0
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--terminal-elevated)] transition-colors"
              aria-label="Close navigation"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="px-4 py-3 border-b border-[var(--terminal-border)] bg-[var(--terminal-elevated)]">
          <div className="flex items-center gap-2 text-xs">
            <span className="status-dot online" />
            <span className="text-[var(--status-online)]">SYSTEM OPERATIONAL</span>
            <span className="text-[var(--text-muted)] ml-auto">19 CHAINS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href !== '/terminal' && pathname?.startsWith(item.href));
              
              return (
                <li 
                  key={item.id}
                  className="animate-slide-in-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide
                      transition-all duration-150 relative group
                      ${isActive 
                        ? 'bg-[var(--terminal-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--status-online)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--terminal-elevated)] hover:text-[var(--text-primary)] border-l-2 border-transparent'
                      }
                    `}
                  >
                    {/* Icon */}
                    <span className={`
                      w-5 h-5 flex items-center justify-center
                      ${isActive ? 'text-[var(--status-online)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}
                    `}>
                      {item.icon}
                    </span>
                    
                    {/* Label */}
                    <span className="flex-1">{item.label}</span>
                    
                    {/* Status indicator */}
                    {item.status && (
                      <span className={`status-dot ${item.status}`} />
                    )}
                    
                    {/* Badge */}
                    {item.badge && (
                      <span className={`
                        px-1.5 py-0.5 text-[10px] font-medium
                        ${typeof item.badge === 'number' 
                          ? 'bg-[var(--status-critical)] text-white' 
                          : 'bg-[var(--terminal-border)] text-[var(--text-tertiary)]'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--terminal-border)] bg-[var(--terminal-elevated)]">
          <div className="text-[10px] text-[var(--text-muted)] space-y-1">
            <div className="flex justify-between">
              <span>LAST SYNC</span>
              <span className="text-[var(--text-tertiary)]">12s ago</span>
            </div>
            <div className="flex justify-between">
              <span>DATA LATENCY</span>
              <span className="text-[var(--status-online)]">~2.4s</span>
            </div>
            <div className="flex justify-between">
              <span>API STATUS</span>
              <span className="text-[var(--status-online)]">HEALTHY</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ICONS — Minimal, geometric, industrial style
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
      <path d="M7 4V10" />
      <path d="M4 7H10" />
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
      <path d="M6 4H10" />
      <path d="M4 6V10" />
      <path d="M12 6V10" />
      <path d="M6 12H10" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 14V2" />
      <path d="M1 14H15" />
      <path d="M4 10L7 6L10 8L14 3" />
    </svg>
  );
}

function BridgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8H6" />
      <path d="M10 8H15" />
      <circle cx="8" cy="8" r="2" />
      <path d="M3 5V11" />
      <path d="M13 5V11" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2C5.5 2 4 4 4 6V10L2 12H14L12 10V6C12 4 10.5 2 8 2Z" />
      <path d="M6 12V13C6 14.1 6.9 15 8 15C9.1 15 10 14.1 10 13V12" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4L1 8L5 12" />
      <path d="M11 4L15 8L11 12" />
      <path d="M9 2L7 14" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.5 2.5L4 4M12 12L13.5 13.5M2.5 13.5L4 12M12 4L13.5 2.5" />
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
