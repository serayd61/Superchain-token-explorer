'use client';

import { useState, useEffect } from 'react';
import { Fuel, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GasData {
  chain: string;
  gasPrice: number;
  baseFee: number;
  priorityFee: number;
  l1SecurityFee?: number;
  timestamp: number;
}

interface ChainGasMetrics {
  chain: string;
  current: GasData;
  average24h: number;
  savings: number;
  isOpStack: boolean;
}

export default function GasMetrics() {
  const [gasMetrics, setGasMetrics] = useState<ChainGasMetrics[]>([]);
  const [historicalData, setHistoricalData] = useState<GasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState('all');

  useEffect(() => {
    const mockData: ChainGasMetrics[] = [
      {
        chain: 'ethereum',
        current: {
          chain: 'ethereum',
          gasPrice: 30,
          baseFee: 25,
          priorityFee: 5,
          timestamp: Date.now()
        },
        average24h: 35,
        savings: 0,
        isOpStack: false
      },
      {
        chain: 'base',
        current: {
          chain: 'base',
          gasPrice: 0.05,
          baseFee: 0.03,
          priorityFee: 0.02,
          l1SecurityFee: 0.15,
          timestamp: Date.now()
        },
        average24h: 0.06,
        savings: 99.8,
        isOpStack: true
      },
      {
        chain: 'optimism',
        current: {
          chain: 'optimism',
          gasPrice: 0.08,
          baseFee: 0.05,
          priorityFee: 0.03,
          l1SecurityFee: 0.20,
          timestamp: Date.now()
        },
        average24h: 0.09,
        savings: 99.7,
        isOpStack: true
      },
      {
        chain: 'arbitrum',
        current: {
          chain: 'arbitrum',
          gasPrice: 0.10,
          baseFee: 0.08,
          priorityFee: 0.02,
          timestamp: Date.now()
        },
        average24h: 0.12,
        savings: 99.6,
        isOpStack: false
      }
    ];

    const historical: GasData[] = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      mockData.forEach(metric => {
        historical.push({
          chain: metric.chain,
          gasPrice: metric.current.gasPrice * (1 + (Math.random() - 0.5) * 0.3),
          baseFee: metric.current.baseFee * (1 + (Math.random() - 0.5) * 0.3),
          priorityFee: metric.current.priorityFee,
          l1SecurityFee: metric.current.l1SecurityFee,
          timestamp: now - i * 3600000
        });
      });
    }

    setGasMetrics(mockData);
    setHistoricalData(historical);
    setLoading(false);
  }, []);

  const formatGasPrice = (price: number) => {
    if (price < 1) return `${(price * 1000).toFixed(2)} mGwei`;
    return `${price.toFixed(2)} Gwei`;
  };

  const getChainColor = (chain: string) => {
    const colors: { [key: string]: string } = {
      ethereum: '#627EEA',
      base: '#0052FF',
      optimism: '#FF0420',
      arbitrum: '#2D374B'
    };
    return colors[chain] || '#666';
  };

  const filteredHistoricalData = selectedChain === 'all' 
    ? historicalData 
    : historicalData.filter(d => d.chain === selectedChain);

  const chartData = filteredHistoricalData.reduce((acc: any[], curr) => {
    const hour = new Date(curr.timestamp).getHours();
    const existing = acc.find(d => d.hour === hour);
    
    if (existing) {
      existing[curr.chain] = curr.gasPrice;
    } else {
      acc.push({
        hour: `${hour}:00`,
        [curr.chain]: curr.gasPrice
      });
    }
    
    return acc;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Fuel className="w-6 h-6" />
          Gas Metrics Comparison
        </h2>
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Chains</option>
          {gasMetrics.map(metric => (
            <option key={metric.chain} value={metric.chain}>
              {metric.chain.charAt(0).toUpperCase() + metric.chain.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {gasMetrics.map((metric) => (
              <div
                key={metric.chain}
                className={`rounded-lg p-4 border ${
                  metric.isOpStack ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{metric.chain}</h3>
                  {metric.isOpStack && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      OP Stack
                    </span>
                  )}
                </div>
                
                <div className="text-2xl font-bold mb-1" style={{ color: getChainColor(metric.chain) }}>
                  {formatGasPrice(metric.current.gasPrice)}
                </div>
                
                {metric.current.l1SecurityFee && (
                  <p className="text-xs text-gray-600 mb-1">
                    + {formatGasPrice(metric.current.l1SecurityFee)} L1 fee
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">24h avg:</span>
                  <span>{formatGasPrice(metric.average24h)}</span>
                </div>
                
                {metric.savings > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-green-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">{metric.savings.toFixed(1)}% cheaper</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">24-Hour Gas Price History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis tickFormatter={(value) => `${value} Gwei`} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(3)} Gwei`} />
                  {(selectedChain === 'all' ? gasMetrics : gasMetrics.filter(m => m.chain === selectedChain)).map((metric) => (
                    <Line
                      key={metric.chain}
                      type="monotone"
                      dataKey={metric.chain}
                      stroke={getChainColor(metric.chain)}
                      strokeWidth={2}
                      dot={false}
                      name={metric.chain.charAt(0).toUpperCase() + metric.chain.slice(1)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600" />
              OP Stack Gas Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">99%+ Gas Savings</p>
                  <p className="text-gray-600">Compared to Ethereum mainnet transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Predictable Fees</p>
                  <p className="text-gray-600">Stable gas prices with minimal fluctuation</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
