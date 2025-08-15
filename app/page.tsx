// app/page.tsx
"use client";

import { useState } from "react";

import ChainSelector from "@/components/ChainSelector";
import DeployerLeaderboard from "@/components/DeployerLeaderboard";
import NotificationSettings from "@/components/NotificationSettings";
import PriceAlerts from "@/components/PriceAlerts";
import TokenSafetyAnalyzer from "@/components/TokenSafetyAnalyzer";
import TokenScanner from "@/components/TokenScanner";
import TokenTable from "@/components/TokenTable";

import SuperchainDashboard from "@/components/superchain/SuperchainDashboard";
import CrossChainTokenTracker from "@/components/superchain/CrossChainTokenTracker";

// Sample data for TokenTable component
const sampleTokens = [
  {
    chain: "base",
    block: 12345678,
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    from: "0xabcdef1234567890abcdef1234567890abcdef12",
    timestamp: new Date().toISOString(),
    lp_status: "YES",
    price_chart: [1, 1.2, 0.8, 1.5, 1.3, 1.1, 1.4] as number[]
  },
  {
    chain: "optimism", 
    block: 87654321,
    hash: "0x9876543210fedcba9876543210fedcba98765432",
    from: "0x9876543210fedcba9876543210fedcba98765432",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    lp_status: "NO",
    price_chart: "none" as "none"
  }
];

export default function Home() {
  // Keep the selected chain here and pass it to ChainSelector
  const [selectedChain, setSelectedChain] = useState<string>("base");

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto py-8 space-y-12">
        {/* ── Hero / Header ───────────────────────────────────────────── */}
        <section className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            🚀 <span className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              Superchain
            </span>{" "}
            Token Explorer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Track new token deployments and on-chain activity across the Optimism Superchain ecosystem.
          </p>
        </section>

        {/* ── Superchain Dashboard + Cross-Chain Tracker ──────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Superchain Overview</h2>
          <div className="grid grid-cols-1 gap-6">
            <SuperchainDashboard />
            <CrossChainTokenTracker />
          </div>
        </section>

        {/* ── Chain Selector + Token Scanner ──────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Scanner</h2>
          <div className="grid grid-cols-1 gap-6">
            {/* ✅ Pass required props */}
            <ChainSelector
              selectedChain={selectedChain}
              onChainChange={setSelectedChain}
            />

            {/* TokenScanner doesn't need chain prop based on the component code */}
            <TokenScanner />
          </div>
        </section>

        {/* ── Token Table / Listings ──────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Tokens</h2>
          <TokenTable tokens={sampleTokens} />
        </section>

        {/* ── Safety Analyzer ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Token Safety Analyzer</h2>
          {/* TokenSafetyAnalyzer needs props, so let's provide sample data */}
          <TokenSafetyAnalyzer
            contractAddress="0x1234567890abcdef1234567890abcdef12345678"
            chain={selectedChain}
            tokenSymbol="SAMPLE"
            tokenName="Sample Token"
          />
        </section>

        {/* ── Alerts + Notifications ──────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Alerts & Notifications</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceAlerts />
            <NotificationSettings />
          </div>
        </section>

        {/* ── Deployer Leaderboard ────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Top Deployers</h2>
          {/* DeployerLeaderboard expects tokens array, pass empty array for now */}
          <DeployerLeaderboard tokens={[]} isLoading={false} />
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="pt-6 text-center text-gray-500 text-sm">
          <p>Proudly building on the Superchain • OP Stack</p>
        </footer>
      </div>
    </main>
  );
}
