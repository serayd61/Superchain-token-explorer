'use client';

import { useState, lazy, Suspense } from 'react';
import DeployerLeaderboard from './DeployerLeaderboard';
import { CHAINS } from '@/lib/chains';

// Lazy load the safety analyzer to improve initial load time
const TokenSafetyAnalyzer = lazy(() => import('./TokenSafetyAnalyzer'));

export interface TokenContract {
  chain: string;
  chain_id: number;
  is_op_stack: boolean;
  block: number;
  hash: string;
  deployer: string;
  contract_address: string;
  timestamp: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: number;
  };
  lp_info: {
    v2: boolean;
    v3: boolean;
    status: string;
  };
  dex_data?: {
    price_usd: string;
    volume_24h: string;
    liquidity: string;
    dex: string;
  };
  explorer_url: string;
}

interface ScanResult {
  success: boolean;
  chain: string;
  blocks_scanned: number;
  scan_time: string;
  summary: {
    total_contracts: number;
    lp_contracts: number;
    success_rate: number;
  };
  results: TokenContract[];
  error?: string;
}

export default function TokenScanner() {
  const [selectedChain, setSelectedChain] = useState('base');
  const [blockCount, setBlockCount] = useState(10);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opStackOnly, setOpStackOnly] = useState(false);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenContract | null>(null);
  const [showSafetyAnalyzer, setShowSafetyAnalyzer] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const selectedChainData = CHAINS.find(chain => chain.id === selectedChain);
  const opStackChains = CHAINS.filter(chain => chain.isOpStack);
  const otherChains = CHAINS.filter(chain => !chain.isOpStack);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/scan?chain=${selectedChain}&blocks=${blockCount}&opStackOnly=${opStackOnly}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ScanResult = await response.json();
      
      if (data.success) {
        setScanResults(data);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🌐 Multi-Chain Token Scanner</h2>
        
        <div className="flex flex-wrap gap-4 items-end mb-6">
          {/* Chain Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Blockchain
            </label>
            <button
              onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
              disabled={isScanning}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                transition-colors duration-200
              `}
            >
              <span className="text-xl">{selectedChainData?.icon}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedChainData?.displayName}</span>
                {selectedChainData?.isOpStack && (
                  <span className="text-xs text-green-600 font-medium">OP Stack</span>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${chainDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {chainDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {/* OP Stack Section */}
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-700">Superchain (OP Stack)</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {opStackChains.length} chains
                    </span>
                  </div>
                  {opStackChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSelectedChain(chain.id);
                        setChainDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md
                        ${selectedChain === chain.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700'}
                        transition-colors duration-150
                      `}
                    >
                      <span className="text-lg">{chain.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{chain.displayName}</div>
                        <div className="text-xs text-green-600">OP Stack</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Other Chains Section */}
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-700">Other Chains</span>
                  </div>
                  {otherChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSelectedChain(chain.id);
                        setChainDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md
                        ${selectedChain === chain.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700'}
                        transition-colors duration-150
                      `}
                    >
                      <span className="text-lg">{chain.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{chain.displayName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Blocks Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blocks to Scan
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={blockCount}
              onChange={(e) => setBlockCount(parseInt(e.target.value) || 10)}
              disabled={isScanning}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* OP Stack Filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="opStackOnly"
              checked={opStackOnly}
              onChange={(e) => setOpStackOnly(e.target.checked)}
              disabled={isScanning}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="opStackOnly" className="text-sm font-medium text-gray-700">
              OP Stack Only
            </label>
          </div>
          
          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${isScanning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } text-white
            `}
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scanning...
              </span>
            ) : (
              '🔍 Start Scan'
            )}
          </button>
          
          {/* Analytics Button */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {scanResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{scanResults.summary.total_contracts}</div>
              <div className="text-sm text-gray-600">Total Contracts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{scanResults.summary.lp_contracts}</div>
              <div className="text-sm text-gray-600">With LP</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{scanResults.summary.success_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{scanResults.blocks_scanned}</div>
              <div className="text-sm text-gray-600">Blocks Scanned</div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics && scanResults && (
          <div className="mb-6">
            <DeployerLeaderboard 
              tokens={scanResults.results || []} 
              isLoading={isScanning}
              showCharts={true}
            />
          </div>
        )}
      </div>

      {/* Results Table */}
      {scanResults && scanResults.results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Token Deployments on {scanResults.chain.charAt(0).toUpperCase() + scanResults.chain.slice(1)}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LP Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Safety</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scanResults.results.map((token, index) => (
                  <tr key={token.hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{token.metadata.symbol}</div>
                        <div className="text-sm text-gray-500">{token.metadata.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {token.is_op_stack && (
                          <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            OP
                          </span>
                        )}
                        <span className="text-sm text-gray-600">{token.chain}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={token.explorer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 hover:text-blue-800"
                      >
                        {token.contract_address.slice(0, 6)}...{token.contract_address.slice(-4)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${token.lp_info.status === 'YES' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {token.lp_info.status === 'YES' ? '✅ Has LP' : '❌ No LP'}
                      </span>
                      {token.lp_info.status === 'YES' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {token.lp_info.v2 && 'V2'} {token.lp_info.v3 && 'V3'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {token.dex_data?.price_usd ? `$${parseFloat(token.dex_data.price_usd).toFixed(8)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(token.metadata.total_supply)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(token.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedToken(token);
                          setShowSafetyAnalyzer(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {scanResults && scanResults.results.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts Found</h3>
          <p className="text-gray-500">
            No new contract deployments found in the last {blockCount} blocks on {selectedChain}.
            Try increasing the block count or selecting a different chain.
          </p>
        </div>
      )}

      {/* Safety Analyzer Modal */}
      {showSafetyAnalyzer && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Token Safety Analysis</h2>
              <button
                onClick={() => {
                  setShowSafetyAnalyzer(false);
                  setSelectedToken(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }>
                <TokenSafetyAnalyzer
                  contractAddress={selectedToken.contract_address}
                  chain={selectedToken.chain}
                  tokenSymbol={selectedToken.metadata.symbol}
                  tokenName={selectedToken.metadata.name}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
