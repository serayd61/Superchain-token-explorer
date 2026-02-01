'use client';

import { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export default function TerminalLayout({ children }: TerminalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--terminal-bg)]">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
        
        {/* Footer Status Bar */}
        <footer className="h-8 bg-[var(--terminal-surface)] border-t border-[var(--terminal-border)] flex items-center justify-between px-4 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-4">
            <span>SUPERCHAIN TOKEN EXPLORER</span>
            <span className="text-[var(--terminal-border)]">|</span>
            <span>19 CHAINS ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>OPTIMISM ATLAS ELIGIBLE</span>
            <span className="text-[var(--terminal-border)]">|</span>
            <a 
              href="https://atlas.optimism.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--accent-optimism)] hover:underline"
            >
              GROWTH GRANTS
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
