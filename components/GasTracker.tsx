'use client';

import React, { useState, useEffect } from 'react';

export default function GasTracker() {
  const [gasData, setGasData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchGasData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gas-prices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch gas prices');
      }
      
      const data = await response.json();
      setGasData(data);
    } catch (err: any) {
      console.error('Error fetching gas data:', err);
      setError('Unable to fetch gas prices. Please try again.');
      
      // Fallback to mock data for demo
      setGasData({
        success: true,
        timestamp: new Date().toISOString(),
        chains: {
          ethereum: {
            fast: '25.50 Gwei',
            average: '20.00 Gwei',
            slow: '15.00 Gwei',
            status: 'active'
          },
          polygon: {
            fast: '35.00 Gwei',
            average: '30.00 Gwei',
            slow: '25.00 Gwei',
            status: 'active'
          },
          base: {
            average: '0.001 Gwei',
            status: 'active',
            note: 'L2 - Ultra Low Fees'
          },
          optimism: {
            average: '0.005 Gwei',
            status: 'active',
            note: 'L2 - Low Fees'
          },
          arbitrum: {
            average: '0.01 Gwei',
            status: 'active',
            note: 'L2 - Low Fees'
          }
        },
        recommendations: '🎯 Best Choice: Base'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchGasData, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getChainIcon = (chain: string) => {
    const icons: Record<string, string> = {
      ethereum: '🔷',
      polygon: '🟣',
      arbitrum: '🔵',
      optimism: '🔴',
      base: '🟦'
    };
    return icons[chain.toLowerCase()] || '⛓️';
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: 'from-blue-500 to-blue-600',
      polygon: 'from-purple-500 to-purple-600',
      arbitrum: 'from-blue-400 to-blue-500',
      optimism: 'from-red-500 to-red-600',
      base: 'from-blue-600 to-blue-700'
    };
    return colors[chain.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ⛽ Multi-Chain Gas Tracker
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Real-time gas prices across all major chains
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-all ${
                autoRefresh 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </button>
            <button
              onClick={fetchGasData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 rounded-b-2xl p-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        {loading && !gasData ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Fetching gas prices...</p>
          </div>
        ) : gasData ? (
          <>
            {/* Gas Prices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {gasData.chains && Object.entries(gasData.chains).map(([chain, data]: [string, any]) => (
                <div
                  key={chain}
                  className={`bg-gradient-to-r ${getChainColor(chain)} p-0.5 rounded-xl`}
                >
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {getChainIcon(chain)}
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                      </h3>
                      {data.status === 'active' ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                          ERROR
                        </span>
                      )}
                    </div>
                    
                    {data.status === 'active' ? (
                      <div className="space-y-2 text-sm">
                        {data.fast && (
                          <div className="flex justify-between text-gray-300">
                            <span>🚀 Fast:</span>
                            <span className="font-mono">{data.fast}</span>
                          </div>
                        )}
                        {data.average && (
                          <div className="flex justify-between text-gray-300">
                            <span>⚡ Average:</span>
                            <span className="font-mono">{data.average}</span>
                          </div>
                        )}
                        {data.slow && (
                          <div className="flex justify-between text-gray-300">
                            <span>🐢 Slow:</span>
                            <span className="font-mono">{data.slow}</span>
                          </div>
                        )}
                        {data.note && (
                          <div className="text-xs text-gray-400 italic mt-2">
                            {data.note}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">{data.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {gasData.recommendations && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-white">
                <p className="text-lg font-semibold text-center">
                  {gasData.recommendations}
                </p>
              </div>
            )}

            {/* Last Updated */}
            {gasData.timestamp && (
              <p className="text-center text-gray-500 text-sm mt-4">
                Last updated: {new Date(gasData.timestamp).toLocaleString()}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
