import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🌟 Superchain Intent Layer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tell us what you want to achieve in DeFi, we'll make it happen
          </p>
          
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
            🚧 Beta Version - Testing Phase
          </div>
        </div>

        {/* Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Intent Layer - NEW */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Intent Layer (NEW)
              </h2>
              <p className="text-gray-600 mb-6">
                Simply tell us what you want: "Earn 15% on my ETH" and we'll find the best strategy
              </p>
              
              <div className="space-y-3">
                <Link href="/intent-demo">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                    🚀 Try Intent Demo
                  </button>
                </Link>
                
                <div className="text-sm text-gray-500">
                  Natural language DeFi strategies
                </div>
              </div>
            </div>
          </div>

          {/* Token Scanner - OLD */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Token Scanner
              </h2>
              <p className="text-gray-600 mb-6">
                Analyze token security and risk across multiple chains
              </p>
              
              <div className="space-y-3">
                <Link href="/tools/scanner">
                  <button className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-medium transition-colors">
                    🔍 Token Scanner
                  </button>
                </Link>
                
                <div className="text-sm text-gray-500">
                  Security analysis & risk assessment
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Intents */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            💡 Example Intents You Can Try
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "I want to earn 15% on my $10k ETH",
              "Safest way to earn on USDC, low risk",
              "Find arbitrage opportunities over $500",
              "Bridge 1000 USDC to Base network",
              "Best yield farming for $50k portfolio",
              "Hedge my ETH against market crash"
            ].map((intent, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                <div className="text-sm text-gray-700">
                  "{intent}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
            <p className="text-sm text-gray-600">
              Advanced natural language processing understands your DeFi goals
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-3">🔗</div>
            <h4 className="font-semibold text-gray-900 mb-2">Cross-Chain</h4>
            <p className="text-sm text-gray-600">
              Optimizes strategies across entire Superchain ecosystem
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure</h4>
            <p className="text-sm text-gray-600">
              Built-in risk analysis and MEV protection
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-green-50 text-green-800 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Intent Layer in Development - Token Scanner Still Available
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Built for Superchain • Powered by AI • Open Source
          </p>
        </div>
      </div>
    </div>
  );
}
