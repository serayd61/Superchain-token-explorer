'use client';

import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  response?: string;
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  'Tokens': [
    {
      method: 'GET',
      path: '/api/tokens',
      description: 'List all tokens with filtering and pagination',
      params: [
        { name: 'chain', type: 'string', description: 'Filter by chain slug (e.g., base, optimism)' },
        { name: 'search', type: 'string', description: 'Search by token name or symbol' },
        { name: 'sort', type: 'string', description: 'Sort field: volume_24h, price_change_24h, market_cap' },
        { name: 'limit', type: 'integer', description: 'Number of results (default: 20)' },
        { name: 'offset', type: 'integer', description: 'Pagination offset' },
      ],
      response: '{ items: Token[], total: number, limit: number, offset: number, has_more: boolean }',
    },
    {
      method: 'GET',
      path: '/api/tokens/trending',
      description: 'Get trending tokens by 24h volume',
      params: [
        { name: 'limit', type: 'integer', description: 'Number of results (default: 20)' },
      ],
      response: 'Token[]',
    },
    {
      method: 'GET',
      path: '/api/tokens/{token_id}',
      description: 'Get detailed information about a specific token',
      params: [
        { name: 'token_id', type: 'integer', description: 'Token ID', required: true },
      ],
      response: 'Token',
    },
    {
      method: 'GET',
      path: '/api/tokens/{token_id}/price-history',
      description: 'Get price history for a token',
      params: [
        { name: 'token_id', type: 'integer', description: 'Token ID', required: true },
        { name: 'range', type: 'string', description: '24h, 7d, or 30d (default: 24h)' },
      ],
      response: '{ token_id: number, range: string, data: PricePoint[] }',
    },
  ],
  'Chains': [
    {
      method: 'GET',
      path: '/api/chains',
      description: 'List all supported chains',
      response: 'Chain[]',
    },
  ],
  'Superchain': [
    {
      method: 'GET',
      path: '/api/superchain/overview',
      description: 'Get overview of all 19 Superchain networks',
      response: '{ total_chains, active_chains, total_tokens, total_volume_24h, total_tvl, chains: ChainStats[] }',
    },
    {
      method: 'GET',
      path: '/api/superchain/chains',
      description: 'Get detailed list of all supported Superchain networks',
      response: '{ total: number, chains: ChainInfo[] }',
    },
    {
      method: 'GET',
      path: '/api/superchain/interop/tokens',
      description: 'Get list of interop-ready tokens (SuperchainERC20)',
      response: '{ total: number, tokens: InteropToken[] }',
    },
    {
      method: 'GET',
      path: '/api/superchain/interop/check/{chain_slug}/{token_address}',
      description: 'Check if a token implements SuperchainERC20 interface',
      params: [
        { name: 'chain_slug', type: 'string', description: 'Chain slug (e.g., base)', required: true },
        { name: 'token_address', type: 'string', description: 'Token contract address', required: true },
      ],
      response: '{ is_superchain_erc20: boolean, interop_score: number, ... }',
    },
    {
      method: 'GET',
      path: '/api/superchain/cross-chain/{symbol}',
      description: 'Find the same token across different Superchain networks',
      params: [
        { name: 'symbol', type: 'string', description: 'Token symbol (e.g., USDC)', required: true },
        { name: 'source_chain', type: 'string', description: 'Source chain slug' },
      ],
      response: '{ symbol, cross_chain_addresses: {}, price_comparison: {} }',
    },
    {
      method: 'GET',
      path: '/api/superchain/tvl',
      description: 'Get TVL breakdown across all Superchain networks',
      response: '{ total_tvl_usd: number, chains: TVLData[] }',
    },
    {
      method: 'GET',
      path: '/api/superchain/stats',
      description: 'Get quick statistics about Superchain support',
      response: '{ total_chains, active_chains, tier_1_chains, ... }',
    },
  ],
  'Health': [
    {
      method: 'GET',
      path: '/health',
      description: 'Health check endpoint',
      response: '{ status: "healthy", timestamp: string }',
    },
  ],
};

const SUPPORTED_CHAINS = [
  { name: 'Base', slug: 'base', chainId: 8453, tier: 1 },
  { name: 'OP Mainnet', slug: 'optimism', chainId: 10, tier: 1 },
  { name: 'Unichain', slug: 'unichain', chainId: 130, tier: 2 },
  { name: 'World Chain', slug: 'world', chainId: 480, tier: 2 },
  { name: 'Ink', slug: 'ink', chainId: 57073, tier: 2 },
  { name: 'Soneium', slug: 'soneium', chainId: 1868, tier: 2 },
  { name: 'Mode', slug: 'mode', chainId: 34443, tier: 2 },
  { name: 'Zora', slug: 'zora', chainId: 7777777, tier: 3 },
  { name: 'Lisk', slug: 'lisk', chainId: 1135, tier: 3 },
  { name: 'BOB', slug: 'bob', chainId: 60808, tier: 3 },
  { name: 'Swell', slug: 'swell', chainId: 1923, tier: 3 },
  { name: 'Mint', slug: 'mint', chainId: 185, tier: 3 },
  { name: 'Shape', slug: 'shape', chainId: 360, tier: 3 },
  { name: 'Metal L2', slug: 'metal', chainId: 1750, tier: 4 },
  { name: 'Polynomial', slug: 'polynomial', chainId: 8008, tier: 4 },
  { name: 'Superseed', slug: 'superseed', chainId: 5330, tier: 4 },
  { name: 'RACE', slug: 'race', chainId: 6805, tier: 4 },
  { name: 'Arena-Z', slug: 'arena_z', chainId: 7897, tier: 4 },
  { name: 'Epic', slug: 'epic', chainId: 183, tier: 4 },
];

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded text-xs font-mono border ${methodColors[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <code className="text-sm text-gray-300">{endpoint.path}</code>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
          <p className="text-gray-300 mb-4">{endpoint.description}</p>
          
          {endpoint.params && endpoint.params.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Parameters</h4>
              <div className="space-y-2">
                {endpoint.params.map((param) => (
                  <div key={param.name} className="flex items-start space-x-2 text-sm">
                    <code className="px-2 py-0.5 bg-gray-800 rounded text-blue-400">{param.name}</code>
                    <span className="text-gray-500">({param.type})</span>
                    {param.required && <span className="text-red-400 text-xs">required</span>}
                    <span className="text-gray-400">- {param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {endpoint.response && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Response</h4>
              <code className="block p-3 bg-gray-800 rounded text-sm text-green-400 overflow-x-auto">
                {endpoint.response}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'chains' | 'quickstart'>('quickstart');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-gray-400">
            Superchain Token Explorer API - Access token data across 19 Optimism Atlas eligible chains
          </p>
        </div>
      </header>
      
      {/* Navigation */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'quickstart' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Quick Start
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'api' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              API Reference
            </button>
            <button
              onClick={() => setActiveTab('chains')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'chains' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Supported Chains
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Quick Start */}
        {activeTab === 'quickstart' && (
          <div className="max-w-4xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="text-gray-300 mb-4">
                The Superchain Token Explorer API provides access to token data across all 19 Optimism Atlas eligible chains.
                No authentication required for read endpoints.
              </p>
              
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="text-blue-400">{API_BASE_URL}</code>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-4">Example: Get Tokens on Base</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">curl</div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-green-400">
{`curl "${API_BASE_URL}/api/tokens?chain=base&limit=10"`}
                  </code>
                </pre>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-4">Example: Get Superchain Overview</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">curl</div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-green-400">
{`curl "${API_BASE_URL}/api/superchain/overview"`}
                  </code>
                </pre>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-4">Example: Check Interop Status</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">curl</div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-green-400">
{`curl "${API_BASE_URL}/api/superchain/interop/check/base/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`}
                  </code>
                </pre>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-4">Rate Limits</h3>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                <ul className="space-y-2 text-gray-300">
                  <li>• No authentication required</li>
                  <li>• 100 requests per minute per IP</li>
                  <li>• Data refreshes every 30 seconds</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-4">OpenAPI Spec</h3>
              <p className="text-gray-300 mb-4">
                Full OpenAPI documentation is available at:
              </p>
              <a 
                href={`${API_BASE_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Swagger UI
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </section>
          </div>
        )}
        
        {/* API Reference */}
        {activeTab === 'api' && (
          <div className="space-y-8">
            {Object.entries(ENDPOINTS).map(([category, endpoints]) => (
              <section key={category}>
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                <div className="space-y-3">
                  {endpoints.map((endpoint, index) => (
                    <EndpointCard key={index} endpoint={endpoint} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        
        {/* Supported Chains */}
        {activeTab === 'chains' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300">
                All 19 chains eligible for <a href="https://atlas.optimism.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Optimism Atlas</a> grants are supported.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Chain</th>
                    <th className="text-left py-3 px-4">Slug</th>
                    <th className="text-left py-3 px-4">Chain ID</th>
                    <th className="text-left py-3 px-4">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <tr key={chain.slug} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{chain.name}</td>
                      <td className="py-3 px-4">
                        <code className="px-2 py-1 bg-gray-800 rounded text-blue-400">{chain.slug}</code>
                      </td>
                      <td className="py-3 px-4 font-mono">{chain.chainId}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          chain.tier === 1 ? 'bg-green-500/20 text-green-400' :
                          chain.tier === 2 ? 'bg-blue-500/20 text-blue-400' :
                          chain.tier === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          Tier {chain.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 p-6 text-center text-gray-400">
        <p>
          Built for <a href="https://atlas.optimism.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Optimism Atlas</a> Growth Grants
        </p>
      </footer>
    </div>
  );
}
