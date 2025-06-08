'use client';

import { useState } from 'react';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';

interface CrossChainDeployment {
  chain: string;
  address: string;
  hasLiquidity: boolean;
  holders: number;
  volume24h: number;
}

interface CrossChainToken {
  symbol: string;
  name: string;
  deployments: CrossChainDeployment[];
  totalLiquidity: number;
  riskScore: number;
}

export default function CrossChainTokenTracker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [crossChainTokens] = useState<CrossChainToken[]>([
    {
      symbol: 'MULTI',
      name: 'MultiChain Token',
      deployments: [
        { chain: 'Base', address: '0x123...abc', hasLiquidity: true, holders: 1250, volume24h: 125000 },
        { chain: 'OP Mainnet', address: '0x456...def', hasLiquidity: true, holders: 890, volume24h: 98000 },
        { chain: 'Mode', address: '0x789...ghi', hasLiquidity: false, holders: 0, volume24h: 0 },
      ],
      totalLiquidity: 2500000,
      riskScore: 75,
    },
    {
      symbol: 'SUPER',
      name: 'Superchain Token',
      deployments: [
        { chain: 'Base', address: '0xabc...123', hasLiquidity: true, holders: 3450, volume24h: 450000 },
        { chain: 'Zora', address: '0xdef...456', hasLiquidity: true, holders: 1200, volume24h: 67000 },
      ],
      totalLiquidity: 5600000,
      riskScore: 85,
    },
  ]);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTokens = crossChainTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🔗 Cross-Chain Token Tracker
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredTokens.map((token, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{token.symbol}</h3>
                <p className="text-gray-600">{token.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Safety Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(token.riskScore)}`}>
                  {token.riskScore}/100
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {token.deployments.map((deployment, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    deployment.hasLiquidity
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{deployment.chain}</span>
                    {deployment.hasLiquidity ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    {deployment.address.slice(0, 6)}...{deployment.address.slice(-4)}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{deployment.holders} holders</span>
                    <span>${(deployment.volume24h / 1000).toFixed(1)}k vol</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total Liquidity: <span className="font-semibold">${(token.totalLiquidity / 1000000).toFixed(2)}M</span>
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
