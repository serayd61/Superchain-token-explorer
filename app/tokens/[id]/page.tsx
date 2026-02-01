'use client';

import { useToken, usePriceHistory } from '@/lib/hooks/useTokens';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatPrice, formatLargeNumber, formatPercentage, getPriceChangeColor } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = parseInt(params.id as string);
  const [priceRange, setPriceRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  const { data: token, isLoading: tokenLoading, error: tokenError, dataUpdatedAt } = useToken(tokenId);
  const { data: priceHistory, isLoading: historyLoading } = usePriceHistory(tokenId, priceRange);

  // Flash effect when price changes
  useEffect(() => {
    if (token?.price_usd && lastPrice !== null) {
      if (token.price_usd > lastPrice) {
        setPriceFlash('up');
      } else if (token.price_usd < lastPrice) {
        setPriceFlash('down');
      }
      const timer = setTimeout(() => setPriceFlash(null), 1000);
      return () => clearTimeout(timer);
    }
    if (token?.price_usd) {
      setLastPrice(token.price_usd);
    }
  }, [token?.price_usd, lastPrice]);

  // Format chart data
  const chartData = priceHistory?.data.map((point) => ({
    time: format(new Date(point.timestamp), priceRange === '24h' ? 'HH:mm' : 'MMM dd'),
    price: point.price_usd,
    volume: point.volume_24h,
  })) || [];

  // Format last updated time
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null;

  if (tokenLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading token...</p>
        </div>
      </div>
    );
  }

  if (tokenError || !token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-400">Token not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get price flash class
  const getPriceFlashClass = () => {
    if (priceFlash === 'up') return 'animate-pulse text-green-400';
    if (priceFlash === 'down') return 'animate-pulse text-red-400';
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{token.name}</h1>
            <p className="text-gray-400">{token.symbol} on {token.chain.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {token.has_liquidity && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                Liquid
              </span>
            )}
            {token.is_verified && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                Verified
              </span>
            )}
            {token.is_trending && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                Trending
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 font-mono">
            {token.address}
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Main Price Display */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Price</p>
              <p className={`text-4xl font-bold font-mono ${getPriceFlashClass()}`}>
                {formatPrice(token.price_usd)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">24h Change</p>
              <p className={`text-2xl font-bold font-mono ${getPriceChangeColor(token.price_change_24h)}`}>
                {formatPercentage(token.price_change_24h)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>24h Volume</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {formatLargeNumber(token.volume_24h)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Market Cap</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {formatLargeNumber(token.market_cap)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Liquidity</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {token.liquidity_usd
                ? formatLargeNumber(token.liquidity_usd)
                : token.has_liquidity
                ? 'Available'
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Safety Score</CardDescription>
            <CardTitle className="text-2xl">
              {token.safety_score !== null && token.safety_score !== undefined
                ? `${token.safety_score}/100`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Price Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price History</CardTitle>
              <CardDescription>Historical price data (auto-updates every minute)</CardDescription>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPriceRange('24h')}
                className={`px-3 py-1 rounded ${
                  priceRange === '24h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setPriceRange('7d')}
                className={`px-3 py-1 rounded ${
                  priceRange === '7d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setPriceRange('30d')}
                className={`px-3 py-1 rounded ${
                  priceRange === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                30d
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No price data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Symbol</span>
              <span className="font-semibold">{token.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="font-semibold">{token.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Decimals</span>
              <span className="font-semibold">{token.decimals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chain</span>
              <span className="font-semibold">{token.chain.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chain ID</span>
              <span className="font-semibold">{token.chain.chain_id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 mb-1">Contract Address</span>
              <span className="font-mono text-sm break-all">{token.address}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Has Liquidity</span>
              <span className={token.has_liquidity ? 'text-green-400' : 'text-red-400'}>
                {token.has_liquidity ? 'Yes' : 'No'}
              </span>
            </div>
            {token.risk_level && (
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level</span>
                <span className={`font-semibold ${
                  token.risk_level === 'low' ? 'text-green-400' :
                  token.risk_level === 'medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {token.risk_level.charAt(0).toUpperCase() + token.risk_level.slice(1)}
                </span>
              </div>
            )}
            {token.created_at_on_chain && (
              <div className="flex justify-between">
                <span className="text-gray-400">Deployed</span>
                <span className="font-semibold">
                  {format(new Date(token.created_at_on_chain), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">First Seen</span>
              <span className="font-semibold">
                {format(new Date(token.created_at), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Updated</span>
              <span className="font-semibold">
                {format(new Date(token.updated_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
