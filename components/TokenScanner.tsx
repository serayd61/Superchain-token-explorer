'use client';

import { useState, lazy, Suspense } from 'react';
import DeployerLeaderboard from './DeployerLeaderboard';

// Lazy load the safety analyzer
const TokenSafetyAnalyzer = lazy(() => import('./TokenSafetyAnalyzer'));

interface ChainOption {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  isOpStack: boolean;
}

const CHAINS: ChainOption[] = [
  {
    id: 'base',
    name: 'base',
    displayName: 'Base',
    color: 'bg-blue-500',
    icon: '🔵',
    isOpStack: true
  },
  {
    id: 'optimism',
    name: 'optimism',
    displayName: 'OP Mainnet',
    color: 'bg-red-500',
    icon: '🔴',
    isOpStack: true
  },
  {
    id: 'mode',
    name: 'mode',
    displayName: 'Mode',
    color: 'bg-green-500',
    icon: '🟢',
    isOpStack: true
  },
  {
    id: 'zora',
    name: 'zora',
    displayName: 'Zora',
    color: 'bg-purple-500',
    icon: '🟣',
    isOpStack: true
  },
  {
    id: 'ethereum',
    name: 'ethereum',
    displayName: 'Ethereum',
    color: 'bg-gray-700',
    icon: '⟠',
    isOpStack: false
  },
  {
    id: 'arbitrum',
    name: 'arbitrum',
    displayName: 'Arbitrum',
    color: 'bg-blue-600',
    icon: '🔷',
    isOpStack: false
  },
  {
    id: 'polygon',
    name: 'polygon',
    displayName: 'Polygon',
    color: 'bg-purple-600',
    icon: '🟣',
    isOpStack: false
  }
];

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
      console.log(`🔍 Starting scan on ${selectedChain} for ${blockCount} blocks...`);
      
      const response = await fetch(
        `/api/scan?chain=${selectedChain}&blocks=${blockCount}&opStackOnly=${opStackOnly}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data: ScanResult = await response.json();
      console.log('📊 Scan data received:', data);
      
      if (data.success) {
        setScanResults(data);
        console.log(`✅ Scan successful: ${data.summary.total_contracts} contracts found`);
      } else {
        setError(data.error || 'Scan failed');
        console.error('❌ Scan failed:', data.error);
      }
    } catch (err) {
      console.error('💥 Scan error:', err);
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
    <div className="space-y-6">
      {/* Scanner Controls */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          🌐 Multi-Chain Token Scanner
        </h2>
        
        <div className="flex flex-wrap gap-4 items-end mb-6">
          {/* Chain Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Blockchain
            </label>
            <button
              onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
              disabled={isScanning}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-lg
                hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white
                ${isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                transition-colors duration-200
              `}
            >
              <span className="text-xl">{selectedChainData?.icon}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium text-white">{selectedChainData?.displayName}</span>
                {selectedChainData?.isOpStack && (
                  <span className="text-xs text-green-400 font-medium">OP Stack</span>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${chainDropdownOpen ? 'rotate-180' : ''} text-white`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {chainDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {/* OP Stack Section */}
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-200">Superchain (OP Stack)</span>
                    <span className="text-xs bg-green-100/20 text-green-300 px-2 py-0.5 rounded-full">
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
                        w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/10 rounded-md
                        ${selectedChain === chain.id ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'text-gray-200'}
                        transition-colors duration-150
                      `}
                    >
                      <span className="text-lg">{chain.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{chain.displayName}</div>
                        <div className="text-xs text-green-400">OP Stack</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/10 my-1"></div>

                {/* Other Chains Section */}
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-200">Other Chains</span>
                  </div>
                  {otherChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSelectedChain(chain.id);
                        setChainDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/10 rounded-md
                        ${selectedChain === chain.id ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'text-gray-200'}
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blocks to Scan
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={blockCount}
              onChange={(e) => setBlockCount(parseInt(e.target.value) || 10)}
              disabled={isScanning}
              className="px-3 py-2 border border-white/20 bg-white/10 backdrop-blur-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-white placeholder-gray-400"
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
            <label htmlFor="opStackOnly" className="text-sm font-medium text-gray-300">
              OP Stack Only
            </label>
          </div>
          
          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2
              ${isScanning 
                ? 'bg-gray-500/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              } text-white
            `}
          >
            {isScanning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scanning...
              </>
            ) : (
              <>
                🔍 Start Scan
              </>
            )}
          </button>
          
          {/* Analytics Button */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 bg-purple-600/50 hover:bg-purple-600/70 text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-300 font-medium">Error: {error}</span>
            </div>
            <div className="mt-2 text-red-200 text-sm">
              💡 Common issues: RPC connection, API rate limits, or network problems
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
            <div className="text-blue-300 text-sm">
              🔧 Debug Info: Chain={selectedChain}, Blocks={blockCount}, OpStackOnly={opStackOnly}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {scanResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
              <div className="text-2xl font-bold text-blue-300">{scanResults.summary.total_contracts}</div>
              <div className="text-sm text-gray-300">Total Contracts</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
              <div className="text-2xl font-bold text-green-300">{scanResults.summary.lp_contracts}</div>
              <div className="text-sm text-gray-300">With LP</div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
              <div className="text-2xl font-bold text-purple-300">{scanResults.summary.success_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-300">Success Rate</div>
            </div>
            <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-400/30">
              <div className="text-2xl font-bold text-orange-300">{scanResults.blocks_scanned}</div>
              <div className="text-sm text-gray-300">Blocks Scanned</div>
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">
              Recent Token Deployments on {scanResults.chain.charAt(0).toUpperCase() + scanResults.chain.slice(1)}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LP Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supply</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {scanResults.results.map((token, index) => (
                  <tr key={token.hash} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{token.metadata.symbol}</div>
                        <div className="text-sm text-gray-300">{token.metadata.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {token.is_op_stack && (
                          <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-300">
                            OP
                          </span>
                        )}
                        <span className="text-sm text-gray-300">{token.chain}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={token.explorer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-400 hover:text-blue-300"
                      >
                        {token.contract_address.slice(0, 6)}...{token.contract_address.slice(-4)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${token.lp_info.status === 'YES' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                        }
                      `}>
                        {token.lp_info.status === 'YES' ? '✅ Has LP' : '❌ No LP'}
                      </span>
                      {token.lp_info.status === 'YES' && (
                        <div className="text-xs text-gray-400 mt-1">
                          {token.lp_info.v2 && 'V2'} {token.lp_info.v3 && 'V3'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {token.dex_data?.price_usd ? `$${parseFloat(token.dex_data.price_usd).toFixed(8)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatNumber(token.metadata.total_supply)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatTimeAgo(token.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedToken(token);
                          setShowSafetyAnalyzer(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-white mb-2">No Contracts Found</h3>
          <p className="text-gray-300">
            No new contract deployments found in the last {blockCount} blocks on {selectedChain}.
            Try increasing the block count or selecting a different chain.
          </p>
        </div>
      )}

      {/* Safety Analyzer Modal */}
      {showSafetyAnalyzer && selectedToken && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/10 backdrop-blur-lg border-b border-white/20 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Token Safety Analysis</h2>
              <button
                onClick={() => {
                  setShowSafetyAnalyzer(false);
                  setSelectedToken(null);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
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
