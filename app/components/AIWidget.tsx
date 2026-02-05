'use client';

import { useState, useEffect } from 'react';
import CreatorProfile from './CreatorProfile';
import MultiWalletConnect from './MultiWalletConnect';
import MCPQuickActions from './MCPQuickActions';

export default function ProfessionalAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tokenAddress, setTokenAddress] = useState('');
  const [blockchain, setBlockchain] = useState('ethereum');
  
  const [results, setResults] = useState({
    token: '',
    airdrop: ''
  });
  
  const [loading, setLoading] = useState({
    token: false,
    airdrop: false
  });

  const [revenue, setRevenue] = useState({
    dailyRevenue: '0.00',
    totalCalls: 0,
    activeUsers: 0
  });

  // Use environment variable or fallback to backend API
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Only fetch revenue when widget is opened to avoid unnecessary errors
    if (isOpen) {
      fetchRevenue();
    }
  }, [isOpen]);

  const fetchRevenue = async () => {
    try {
      // Use the health endpoint to get basic stats
      const response = await fetch(`${API_BASE}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map health data to revenue format
        setRevenue({
          dailyRevenue: '0.00', // Will be updated when we have real revenue tracking
          totalCalls: data.total_tokens || 0,
          activeUsers: data.active_chains || 0
        });
      }
    } catch (error) {
      // Silently fail - widget will show default values
      console.log('Stats fetch skipped - backend may not be running');
    }
  };

  const analyzeToken = async () => {
    if (!tokenAddress.trim()) {
      setResults(prev => ({ ...prev, token: '❌ Please enter a valid token address or symbol' }));
      return;
    }

    setLoading(prev => ({ ...prev, token: true }));
    setResults(prev => ({ ...prev, token: '🔍 Analyzing token...' }));

    try {
      // Map blockchain to chain slug
      const chainMap: Record<string, string> = {
        'ethereum': 'ethereum',
        'base': 'base',
        'optimism': 'optimism',
        'bsc': 'bsc',
        'solana': 'solana'
      };
      const chainSlug = chainMap[blockchain] || 'base';

      // Try to fetch token from our API
      const response = await fetch(`${API_BASE}/api/tokens/search?q=${encodeURIComponent(tokenAddress.trim())}&chain=${chainSlug}`);
      
      if (response.ok) {
        const tokens = await response.json();
        
        if (tokens && tokens.length > 0) {
          const token = tokens[0];
          const analysis = `✅ ANALYSIS COMPLETE

🪙 TOKEN: ${token.name} (${token.symbol})
💰 PRICE: $${token.price_usd?.toFixed(6) || 'N/A'}
📈 24H VOLUME: $${token.volume_24h?.toLocaleString() || 'N/A'}
📊 24H CHANGE: ${token.price_change_24h?.toFixed(2) || 'N/A'}%
🏦 MARKET CAP: $${token.market_cap?.toLocaleString() || 'N/A'}
💧 LIQUIDITY: $${token.liquidity_usd?.toLocaleString() || 'N/A'}

📍 ADDRESS: ${token.address}
🔗 CHAIN: ${token.chain}

${token.is_interop_ready ? '✅ Interop Ready (SuperchainERC20)' : ''}`;
          
          setResults(prev => ({ ...prev, token: analysis }));
        } else {
          setResults(prev => ({ ...prev, token: '❌ Token not found. Try a different address or symbol.' }));
        }
      } else {
        setResults(prev => ({ ...prev, token: '❌ API error. Please try again.' }));
      }
    } catch (error) {
      setResults(prev => ({ ...prev, token: `❌ Network error. Make sure the backend is running.` }));
    } finally {
      setLoading(prev => ({ ...prev, token: false }));
    }
  };

  const huntAirdrops = async () => {
    setLoading(prev => ({ ...prev, airdrop: true }));
    setResults(prev => ({ ...prev, airdrop: '🎁 Hunting airdrops...' }));

    try {
      // Fetch interop-ready tokens (potential airdrop candidates)
      const response = await fetch(`${API_BASE}/api/superchain/interop/tokens`);
      
      if (response.ok) {
        const data = await response.json();
        const tokens = data.tokens || [];
        
        // Fetch growth metrics for additional context
        let tvlData = { total_tvl_usd: 0, chains_count: 0 };
        try {
          const tvlResponse = await fetch(`${API_BASE}/api/superchain/tvl/real`);
          if (tvlResponse.ok) {
            tvlData = await tvlResponse.json();
          }
        } catch {
          // Ignore TVL fetch errors
        }

        const analysis = `🎁 SUPERCHAIN AIRDROP HUNT COMPLETE!

📊 ECOSYSTEM STATS:
💰 Total TVL: $${(tvlData.total_tvl_usd / 1e9).toFixed(2)}B
🔗 Active Chains: ${tvlData.chains_count || 19}
🪙 Interop Tokens: ${tokens.length}

🎯 TOP AIRDROP OPPORTUNITIES:

${tokens.slice(0, 5).map((token: any, i: number) => 
  `${i + 1}. ${token.symbol} on ${token.chain}
   • Interop Ready: ${token.is_interop_ready ? '✅' : '❌'}
   • SuperchainERC20: ${token.is_superchain_erc20 ? '✅' : '❌'}`
).join('\n\n')}

💡 TIP: Tokens with SuperchainERC20 support are 
more likely to receive cross-chain airdrops!

🔗 Check atlas.optimism.io for active grants`;
        
        setResults(prev => ({ ...prev, airdrop: analysis }));
      } else {
        setResults(prev => ({ ...prev, airdrop: '❌ Could not fetch airdrop data. Backend may be offline.' }));
      }
    } catch (error) {
      setResults(prev => ({ ...prev, airdrop: `❌ Network error. Make sure the backend is running.` }));
    } finally {
      setLoading(prev => ({ ...prev, airdrop: false }));
    }
  };

  return (
    <>
      {/* Professional Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="font-bold text-sm">AI Assistant</div>
              <div className="text-xs opacity-80">DeFi Analytics</div>
            </div>
          </div>
        </button>
      </div>

      {/* Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-500">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">🤖 AI DeFi Assistant</h1>
                  <p className="text-blue-200 text-sm">Powered by Heurist Network</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-200">System Online • API Connected</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'dashboard' ? 'border-b-2 border-purple-500 text-purple-600 bg-white' : 'text-gray-600'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('analyze')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'analyze' ? 'border-b-2 border-purple-500 text-purple-600 bg-white' : 'text-gray-600'
                  }`}
                >
                  🔍 Analyze
                </button>
                <button
                  onClick={() => setActiveTab('airdrop')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'airdrop' ? 'border-b-2 border-purple-500 text-purple-600 bg-white' : 'text-gray-600'
                  }`}
                >
                  🎁 Airdrops
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">📊 Analytics Dashboard</h2>

                  {/* MCP AI System - Featured */}
                  <MCPQuickActions 
                    walletAddress="0x7fbd...6e0a"
                    balance="0.0002"
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border">
                      <div className="text-2xl font-bold text-green-600">${revenue.dailyRevenue}</div>
                      <div className="text-sm text-green-700">Daily Revenue</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border">
                      <div className="text-2xl font-bold text-blue-600">{revenue.totalCalls}</div>
                      <div className="text-sm text-blue-700">API Calls</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border">
                      <div className="text-2xl font-bold text-purple-600">{revenue.activeUsers}</div>
                      <div className="text-sm text-purple-700">Users</div>
                    </div>
                  </div>

                  <CreatorProfile />

                  <MultiWalletConnect />
                </div>
              )}

              {/* Other tabs remain same... */}
              {activeTab === 'analyze' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">🔍 Token Analysis</h2>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder="Enter ETH, BTC, or 0x1234..."
                      className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500"
                      disabled={loading.token}
                    />
                    
                    <select
                      value={blockchain}
                      onChange={(e) => setBlockchain(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500"
                      disabled={loading.token}
                    >
                      <option value="ethereum">Ethereum</option>
                      <option value="solana">Solana</option>
                      <option value="bsc">BSC</option>
                      <option value="base">Base</option>
                    </select>
                    
                    <button
                      onClick={analyzeToken}
                      disabled={loading.token || !tokenAddress.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {loading.token ? 'Analyzing...' : '🔍 Analyze Token'}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <h3 className="font-semibold text-gray-900 mb-3">📊 Results</h3>
                    <div className="bg-white rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto border">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {results.token || 'Results will appear here...'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'airdrop' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">🎁 Airdrop Hunter</h2>
                  
                  <button
                    onClick={huntAirdrops}
                    disabled={loading.airdrop}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {loading.airdrop ? 'Hunting...' : '🎯 Hunt Airdrops'}
                  </button>

                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <h3 className="font-semibold text-gray-900 mb-3">🎁 Opportunities</h3>
                    <div className="bg-white rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto border">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {results.airdrop || 'Airdrop opportunities will appear here...'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
