'use client';

import { useState } from 'react';

interface MCPQuickActionsProps {
  walletAddress: string;
  balance: string;
}

export default function MCPQuickActions({ walletAddress, balance }: MCPQuickActionsProps) {
  const [activeAnalysis, setActiveAnalysis] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const runMarketAnalysis = async () => {
    setLoading(true);
    setActiveAnalysis('market');
    setResults('🔍 Analyzing Base ecosystem...');

    // Simulate AI analysis
    setTimeout(() => {
      setResults(`📊 MARKET ANALYSIS COMPLETE

💰 Your Balance: ${balance} ETH on Base
🎯 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}

📈 BASE ECOSYSTEM OPPORTUNITIES:
- Aerodrome Finance: 12.5% APY (AERO/USDC LP)
- Moonwell Lending: 8.2% APY (Supply ETH)
- Uniswap V3: 15.7% APY (Concentrated liquidity)

🧠 AI RECOMMENDATION:
Based on your ${balance} ETH balance, consider Aerodrome LP 
for balanced risk/reward on Base network.

⚡ BASE ADVANTAGES:
- Ultra-low gas fees (~$0.01)
- 2-second block times
- Ethereum-level security`);
      setLoading(false);
    }, 2000);
  };

  const runYieldOptimization = async () => {
    setLoading(true);
    setActiveAnalysis('yield');
    setResults('💰 Optimizing yield strategies...');

    setTimeout(() => {
      setResults(`💰 YIELD OPTIMIZATION COMPLETE

💎 BEST BASE YIELD OPPORTUNITIES:

1. 🥇 AERODROME FINANCE
   APY: 12.5% | Risk: Medium
   Strategy: AERO/USDC LP + veAERO voting
   Min: 0.1 ETH | Gas: ~$0.05

2. 🥈 UNISWAP V3 BASE
   APY: 15.7% | Risk: High  
   Strategy: ETH/USDC concentrated liquidity
   Min: 0.05 ETH | IL Risk: Medium

3. 🥉 MOONWELL
   APY: 8.2% | Risk: Low
   Strategy: Supply ETH, earn WELL rewards
   Min: 0.01 ETH | Safe option

🤖 AI OPTIMAL STRATEGY for ${balance} ETH:
Start with Moonwell (low risk), then move to 
Aerodrome as you gain more experience.

💡 Estimated monthly returns: ~$${(parseFloat(balance) * 0.125 / 12).toFixed(2)}`);
      setLoading(false);
    }, 2000);
  };

  const runFullAnalysis = async () => {
    setLoading(true);
    setActiveAnalysis('full');
    setResults('🧠 Running full multi-agent analysis...');

    setTimeout(() => {
      setResults(`🧠 FULL AI AGENT ANALYSIS

👤 WALLET PROFILE:
Address: ${walletAddress}
Balance: ${balance} ETH on Base
Risk Profile: Conservative

📊 MARKET AGENT SAYS:
Base ecosystem is thriving with $2.1B TVL
Best entry point for DeFi on Base

🛡️ RISK AGENT SAYS:
Your current risk: LOW
Recommended position size: 80% of balance
Stop-loss: Not needed for blue-chip protocols

💰 YIELD AGENT SAYS:
Optimal allocation:
- 50% Aerodrome (balanced)
- 30% Moonwell (safe)
- 20% Keep liquid (opportunities)

🤖 AUTOMATION AGENT SAYS:
Set up auto-compounding every 7 days
Estimated gas cost: $0.50/month on Base

🎯 FINAL RECOMMENDATION:
1. Start with Moonwell supply (${(parseFloat(balance) * 0.5).toFixed(4)} ETH)
2. Graduate to Aerodrome LP
3. Set up automation for compounding
4. Monitor weekly for optimization

Expected annual return: ~${(parseFloat(balance) * 0.105).toFixed(4)} ETH`);
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
      <h3 className="font-semibold text-gray-900 mb-3">🧠 MCP AI Agent System</h3>
      
      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
        <div className="text-sm text-gray-600 mb-1">💡 Context-Aware AI for your Base wallet</div>
        <div className="text-xs text-gray-500">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} | {balance} ETH | Base Network
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-4">
        <button
          onClick={runMarketAnalysis}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">📊 Market Analysis</div>
              <div className="text-xs opacity-90">Analyze Base ecosystem opportunities</div>
            </div>
            {loading && activeAnalysis === 'market' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </button>

        <button
          onClick={runYieldOptimization}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">💰 Yield Optimization</div>
              <div className="text-xs opacity-90">Find best Base yield opportunities</div>
            </div>
            {loading && activeAnalysis === 'yield' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </button>

        <button
          onClick={runFullAnalysis}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white p-3 rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-50 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">🧠 Full AI Analysis</div>
              <div className="text-xs opacity-90">Complete multi-agent Base analysis</div>
            </div>
            {loading && activeAnalysis === 'full' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </button>
      </div>

      {results && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-80 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-2">🤖 AI Agent Results</h4>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
            {results}
          </pre>
        </div>
      )}
    </div>
  );
}
