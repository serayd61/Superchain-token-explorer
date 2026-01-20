'use client';

import { useState } from 'react';
import { useTokens, useChains } from '@/lib/hooks/useTokens';
import { TokenListQuery } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function TokensPage() {
  const [query, setQuery] = useState<TokenListQuery>({
    chain: undefined,
    search: '',
    sort: 'volume_24h',
    limit: 20,
    offset: 0,
  });

  const { data: tokensData, isLoading, error } = useTokens(query);
  const { data: chains } = useChains();

  const handleChainChange = (chainSlug: string | undefined) => {
    setQuery({ ...query, chain: chainSlug, offset: 0 });
  };

  const handleSearchChange = (search: string) => {
    setQuery({ ...query, search: search || undefined, offset: 0 });
  };

  const handleSortChange = (sort: string) => {
    setQuery({ ...query, sort, offset: 0 });
  };

  const handlePageChange = (newOffset: number) => {
    setQuery({ ...query, offset: newOffset });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Token Explorer</h1>
        <p className="text-gray-400">Explore tokens across the Superchain ecosystem</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chain Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Chain</label>
              <select
                value={query.chain || ''}
                onChange={(e) => handleChainChange(e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="">All Chains</option>
                {chains?.map((chain) => (
                  <option key={chain.id} value={chain.slug}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or symbol..."
                value={query.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={query.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              >
                <option value="volume_24h">24h Volume</option>
                <option value="price_change_24h">24h Price Change</option>
                <option value="market_cap">Market Cap</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tokens Table */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading tokens...</p>
        </div>
      )}

      {error && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-red-400">Error loading tokens: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {tokensData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Tokens ({tokensData.total})
              </CardTitle>
              <CardDescription>
                Showing {tokensData.offset + 1} - {Math.min(tokensData.offset + tokensData.limit, tokensData.total)} of {tokensData.total}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Token</th>
                      <th className="text-left py-3 px-4">Chain</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">24h Volume</th>
                      <th className="text-right py-3 px-4">Market Cap</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokensData.items.map((token) => (
                      <tr
                        key={token.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <Link
                            href={`/tokens/${token.id}`}
                            className="flex items-center space-x-3 hover:text-blue-400 transition-colors"
                          >
                            <div>
                              <div className="font-semibold">{token.symbol}</div>
                              <div className="text-sm text-gray-400">{token.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-gray-700 rounded text-sm">
                            {token.chain.slug}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {token.price_usd ? `$${token.price_usd.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {token.volume_24h ? `$${(token.volume_24h / 1e6).toFixed(2)}M` : '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {token.market_cap ? `$${(token.market_cap / 1e6).toFixed(2)}M` : '-'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {token.is_verified && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                Verified
                              </span>
                            )}
                            {token.is_trending && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                Trending
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {tokensData.total > tokensData.limit && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button
                onClick={() => handlePageChange(Math.max(0, query.offset - query.limit!))}
                disabled={query.offset === 0}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-gray-400">
                Page {Math.floor(query.offset / query.limit!) + 1} of {Math.ceil(tokensData.total / tokensData.limit!)}
              </span>
              <Button
                onClick={() => handlePageChange(query.offset + query.limit!)}
                disabled={!tokensData.has_more}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
