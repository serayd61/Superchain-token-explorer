import TokenScanner from '@/components/TokenScanner';
import SuperchainDashboard from '@/components/superchain/SuperchainDashboard';
import CrossChainTokenTracker from '@/components/superchain/CrossChainTokenTracker';
import PriceAlerts from '@/components/PriceAlerts';  // ✅ PriceAlerts import edildi

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Superchain</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">OP Stack</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            🚀 <span className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">Superchain</span> Token Explorer
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover new token deployments across the <strong>Optimism Superchain</strong> ecosystem. 
            Monitor liquidity pools, track prices, and analyze smart contracts in real-time across 
            <span className="text-red-600 font-semibold"> Base, OP Mainnet, Mode, Zora</span> and more!
          </p>
        </div>
        
        {/* Main Scanner Component */}
        <TokenScanner />
        
        {/* Yeni Superchain Dashboard */}
        <div className="mt-8">
          <SuperchainDashboard />
        </div>

        {/* Cross-Chain Token Tracker */}
        <CrossChainTokenTracker />

        {/* ✅ Price Alerts Section */}
        <div className="mt-12">
          <PriceAlerts />
        </div>
        
        {/* Features Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              🌐 Powered by the <span className="text-red-600">Superchain</span>
            </h2>
            
            {/* ... diğer feature kartları aynı kalıyor ... */}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Proudly building on the Superchain</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <p>Contributing to the future of decentralized applications across OP Stack chains</p>
        </div>
      </div>
    </main>
  );
}
