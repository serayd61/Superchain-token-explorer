'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

interface ChainMetrics {
  chain: string;
  blockNumber: number;
  isOpStack: boolean;
}

export default function SuperchainDashboard() {
  const [metrics, setMetrics] = useState<ChainMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/superchain/metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const opStackChains = metrics.filter(m => m.isOpStack);
  const totalBlocks = metrics.reduce((sum, m) => sum + m.blockNumber, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🌐 Superchain Live Metrics
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">OP Stack Chains</p>
                  <p className="text-2xl font-bold">{opStackChains.length}</p>
                </div>
                <Activity className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Chains</p>
                  <p className="text-2xl font-bold">{metrics.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <Zap className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Blocks</p>
                  <p className="text-2xl font-bold">{(totalBlocks / 1000000).toFixed(1)}M</p>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Chain Status</h3>
            {metrics.map((metric) => (
              <div key={metric.chain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${metric.isOpStack ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="font-medium capitalize">{metric.chain}</span>
                  {metric.isOpStack && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      OP Stack
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Block #{metric.blockNumber.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
