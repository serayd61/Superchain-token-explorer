// app/page.tsx  (or pages/index.tsx)
import ChainSelector from '@/components/ChainSelector';
import DeployerLeaderboard from '@/components/DeployerLeaderboard';
import NotificationSettings from '@/components/NotificationSettings';
import PriceAlerts from '@/components/PriceAlerts';
import TokenSafetyAnalyzer from '@/components/TokenSafetyAnalyzer';
import TokenScanner from '@/components/TokenScanner';
import TokenTable from '@/components/TokenTable';

// If these live under /components/superchain/ as you showed:
import SuperchainDashboard from '@/components/superchain/SuperchainDashboard';
import CrossChainTokenTracker from '@/components/superchain/CrossChainTokenTracker';

export default function Home() {
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
            <ChainSelector />
            <TokenScanner />
          </div>
        </section>

        {/* ── Token Table / Listings ──────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Tokens</h2>
          <TokenTable />
        </section>

        {/* ── Safety Analyzer ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Token Safety Analyzer</h2>
          <TokenSafetyAnalyzer />
        </section>

        {/* ── Alerts + Notifications ──────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Alerts & Notifications</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceAlerts />             {/* uses localStorage; client-safe */}
            <NotificationSettings />
          </div>
        </section>

        {/* ── Deployer Leaderboard ────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Top Deployers</h2>
          <DeployerLeaderboard />
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="pt-6 text-center text-gray-500 text-sm">
          <p>Proudly building on the Superchain • OP Stack</p>
        </footer>
      </div>
    </main>
  );
}
