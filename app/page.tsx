import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🌟 Superchain Intent Layer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tell us what you want to achieve in DeFi, we'll make it happen
          </p>
          
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            🚀 MVP Ready - Intent Parser Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Intent Layer (NEW)
              </h2>
              <p className="text-gray-600 mb-6">
                Simply tell us: "Earn 15% on my ETH" and we'll find the best strategy
              </p>
              
              <div className="space-y-3">
                <Link href="/intent-test">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium">
                    🚀 Try Intent Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>

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
                <a href="/old-scanner" className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-medium">
                  🔍 Token Scanner
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            💡 Try These Examples
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "I want to earn 15% on my $10k ETH",
              "Safest way to earn on USDC",
              "Find arbitrage opportunities",
              "Best yield farming strategy"
            ].map((intent, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  "{intent}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
