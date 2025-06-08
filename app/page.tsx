import TokenScanner from '@/components/TokenScanner';
import SuperchainDashboard from '@/components/superchain/SuperchainDashboard';
import CrossChainTokenTracker from '@/components/superchain/CrossChainTokenTracker';

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

          {/* Superchain Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-red-100">
              <div className="text-2xl font-bold text-red-600">7+</div>
              <div className="text-sm text-gray-600">OP Stack Chains</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-600">∞</div>
              <div className="text-sm text-gray-600">Tokens Tracked</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">⚡</div>
              <div className="text-sm text-gray-600">Real-time</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">🆓</div>
              <div className="text-sm text-gray-600">Open Source</div>
            </div>
          </div>
        </div>
        
        {/* Main Scanner Component */}
        <TokenScanner />
        
        {/* Yeni Superchain Dashboard */}
        <div className="mt-8">
          <SuperchainDashboard />
        </div>

        {/* Cross-Chain Token Tracker */}
        <CrossChainTokenTracker />
        
        {/* Features Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              🌐 Powered by the <span className="text-red-600">Superchain</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* OP Stack Chains */}
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                <div className="text-4xl mb-3">🔴</div>
                <h3 className="font-semibold text-gray-800 mb-2">OP Stack Chains</h3>
                <p className="text-sm text-gray-600 mb-3">Base, OP Mainnet, Mode, Zora, Fraxtal, World Chain, Lisk</p>
                <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                  Superchain Native
                </span>
              </div>

              {/* LP Detection */}
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-4xl mb-3">💧</div>
                <h3 className="font-semibold text-gray-800 mb-2">LP Detection</h3>
                <p className="text-sm text-gray-600 mb-3">Uniswap V2 & V3, DEX aggregation across chains</p>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  Multi-DEX
                </span>
              </div>

              {/* Real-time Analytics */}
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="font-semibold text-gray-800 mb-2">Real-time Data</h3>
                <p className="text-sm text-gray-600 mb-3">Live price feeds, volume tracking, liquidity monitoring</p>
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  DexScreener API
                </span>
              </div>

              {/* Developer Tools */}
              <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Developer Tools</h3>
                <p className="text-sm text-gray-600 mb-3">REST API, CSV exports, webhook notifications</p>
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  Open Source
                </span>
              </div>
            </div>

            {/* Superchain Ecosystem */}
            <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-lg p-6 border border-red-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🏗️ Building on the Superchain
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-800">🟢 OP Stack Native</div>
                  <div className="text-gray-600">Built specifically for Optimism's Superchain ecosystem</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-800">🔗 Cross-Chain Ready</div>
                  <div className="text-gray-600">Seamlessly works across all OP Stack chains</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-800">🚀 Community Driven</div>
                  <div className="text-gray-600">Contributing to Superchain growth and adoption</div>
                </div>
              </div>
            </div>

            {/* Grant Program CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg text-white">
              <h3 className="text-xl font-semibold mb-2">
                🎯 Supported by Optimism Ecosystem
              </h3>
              <p className="text-red-100 mb-4">
                This project is built to support the Superchain ecosystem and apply for OP grants through the OP Atlas program.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="https://github.com/ethereum-optimism/ecosystem-contributions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  📚 Learn About OP Grants
                </a>
                <a 
                  href="https://app.optimism.io/retropgf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-300 transition-colors"
                >
                  🏆 Explore RetroPGF
                </a>
              </div>
            </div>
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
