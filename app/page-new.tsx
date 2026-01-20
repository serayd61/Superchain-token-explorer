'use client';

import { useTrendingTokens } from '@/lib/hooks/useTokens';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function HomePage() {
  const { data: trendingTokens, isLoading, error } = useTrendingTokens(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Superchain Token Explorer
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover and track tokens across the Optimism Superchain ecosystem.
            Explore Base, Optimism, Mode, Zora, and more.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/tokens"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
            >
              Explore Tokens
            </Link>
          </div>
        </div>

        {/* Trending Tokens Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">Trending Tokens</h2>
          
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading trending tokens...</p>
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-400">Error loading tokens: {error.message}</p>
              </CardContent>
            </Card>
          )}

          {trendingTokens && trendingTokens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTokens.map((token) => (
                <Link key={token.id} href={`/tokens/${token.id}`}>
                  <Card className="hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{token.symbol}</CardTitle>
                          <CardDescription>{token.name}</CardDescription>
                        </div>
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {token.chain.slug}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price</span>
                          <span className="font-semibold">
                            {token.price_usd
                              ? `$${token.price_usd.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">24h Volume</span>
                          <span className="font-semibold">
                            {token.volume_24h
                              ? `$${(token.volume_24h / 1e6).toFixed(2)}M`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Market Cap</span>
                          <span className="font-semibold">
                            {token.market_cap
                              ? `$${(token.market_cap / 1e6).toFixed(2)}M`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        {token.is_verified && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            ✓ Verified
                          </span>
                        )}
                        {token.is_trending && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {trendingTokens && trendingTokens.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-400 text-center">No trending tokens found. Check back later!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Explore All Tokens</CardTitle>
              <CardDescription>Browse the complete token directory</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/tokens"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All Tokens →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Chains</CardTitle>
              <CardDescription>Base, Optimism, Mode, Zora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">Base</span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">Optimism</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">Mode</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">Zora</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Data</CardTitle>
              <CardDescription>Live prices and market data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Data is updated every 15 minutes from on-chain sources and market APIs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
