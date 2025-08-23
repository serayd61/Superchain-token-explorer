'use client';
import { useState, useCallback } from 'react';

interface AdvancedTokenScannerProps {
  onScanComplete?: (results: any) => void;
}

interface ScanRequest {
  address: string;
  chain: string;
  scanDepth: 'basic' | 'deep' | 'comprehensive';
  includeHolders: boolean;
  includeTransactions: boolean;
  includeRisk: boolean;
}

export default function AdvancedTokenScanner({ onScanComplete }: AdvancedTokenScannerProps) {
  const [scanRequest, setScanRequest] = useState<ScanRequest>({
    address: '',
    chain: 'optimism',
    scanDepth: 'comprehensive',
    includeHolders: true,
    includeTransactions: true,
    includeRisk: true
  });
  const [scanResults, setScanResults] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [batchAddresses, setBatchAddresses] = useState('');
  const [batchResults, setBatchResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  const handleSingleScan = async () => {
    if (!scanRequest.address.trim()) return;
    
    setIsScanning(true);
    try {
      const response = await fetch('/api/token-explorer/advanced-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanRequest),
      });
      
      const data = await response.json();
      if (data.success) {
        setScanResults(data);
        onScanComplete?.(data);
      }
    } catch (error) {
      console.error('Token scan failed:', error);
    }
    setIsScanning(false);
  };

  const handleBatchScan = async () => {
    const addresses = batchAddresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
    if (addresses.length === 0) return;
    
    setIsScanning(true);
    try {
      const response = await fetch(`/api/token-explorer/advanced-scan?addresses=${addresses.join(',')}&chain=${scanRequest.chain}`);
      const data = await response.json();
      
      if (data.success) {
        setBatchResults(data);
      }
    } catch (error) {
      console.error('Batch scan failed:', error);
    }
    setIsScanning(false);
  };

  const chains = [
    { id: 'optimism', name: 'Optimism', icon: '🔴' },
    { id: 'base', name: 'Base', icon: '🔵' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
    { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
    { id: 'polygon', name: 'Polygon', icon: '💜' },
  ];

  const scanDepths = [
    { id: 'basic', name: 'Basic', description: 'Price, market cap, basic info', time: '~5s' },
    { id: 'deep', name: 'Deep', description: 'Includes liquidity, risk factors', time: '~15s' },
    { id: 'comprehensive', name: 'Comprehensive', description: 'Full analysis with AI insights', time: '~30s' }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
          <span className="text-2xl">🔍</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Token Scanner</h2>
          <p className="text-gray-400">AI-powered comprehensive token analysis</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-900/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'single' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🎯 Single Token Scan
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'batch' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 Batch Analysis
        </button>
      </div>

      {/* Single Token Tab */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
              <input
                type="text"
                value={scanRequest.address}
                onChange={(e) => setScanRequest(prev => ({ ...prev, address: e.target.value }))}
                placeholder="0x4200000000000000000000000000000000000042"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chain</label>
              <select
                value={scanRequest.chain}
                onChange={(e) => setScanRequest(prev => ({ ...prev, chain: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">Scan Depth</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scanDepths.map((depth) => (
                <button
                  key={depth.id}
                  onClick={() => setScanRequest(prev => ({ ...prev, scanDepth: depth.id as any }))}
                  className={`p-4 rounded-lg border transition-all ${
                    scanRequest.scanDepth === depth.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <h4 className="font-semibold mb-1">{depth.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{depth.description}</p>
                  <p className="text-xs text-green-400">{depth.time}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">Additional Options</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <input
                  type="checkbox"
                  checked={scanRequest.includeHolders}
                  onChange={(e) => setScanRequest(prev => ({ ...prev, includeHolders: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">📊 Holder Analysis</span>
              </label>
              
              <label className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <input
                  type="checkbox"
                  checked={scanRequest.includeTransactions}
                  onChange={(e) => setScanRequest(prev => ({ ...prev, includeTransactions: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">📈 Transaction Data</span>
              </label>
              
              <label className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <input
                  type="checkbox"
                  checked={scanRequest.includeRisk}
                  onChange={(e) => setScanRequest(prev => ({ ...prev, includeRisk: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">⚠️ Risk Assessment</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSingleScan}
            disabled={isScanning || !scanRequest.address.trim()}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              isScanning || !scanRequest.address.trim()
                ? 'bg-gray-600/50 text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {isScanning ? 'Scanning Token...' : '🔍 Start Advanced Scan'}
          </button>

          {/* Single Scan Results */}
          {scanResults && (
            <div className="mt-8 space-y-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Token Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{scanResults.analysis?.marketData?.price}</p>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className={`text-xs mt-1 ${
                      scanResults.analysis?.marketData?.priceChange24h?.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {scanResults.analysis?.marketData?.priceChange24h}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{scanResults.analysis?.marketData?.marketCap}</p>
                    <p className="text-sm text-gray-400">Market Cap</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{scanResults.analysis?.marketData?.volume24h}</p>
                    <p className="text-sm text-gray-400">24h Volume</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{scanResults.analysis?.marketData?.holders}</p>
                    <p className="text-sm text-gray-400">Holders</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">📊 Basic Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{scanResults.analysis?.basicInfo?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white">{scanResults.analysis?.basicInfo?.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Decimals:</span>
                        <span className="text-white">{scanResults.analysis?.basicInfo?.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white">{scanResults.analysis?.basicInfo?.totalSupply}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Verified:</span>
                        <span className={scanResults.analysis?.basicInfo?.verified ? 'text-green-400' : 'text-red-400'}>
                          {scanResults.analysis?.basicInfo?.verified ? '✓ Yes' : '✗ No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">⚠️ Risk Assessment</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Overall Risk:</span>
                        <span className={`font-semibold ${
                          scanResults.analysis?.riskAssessment?.riskLevel === 'low' ? 'text-green-400' :
                          scanResults.analysis?.riskAssessment?.riskLevel === 'medium' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {scanResults.analysis?.riskAssessment?.overallScore}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            scanResults.analysis?.riskAssessment?.riskLevel === 'low' ? 'bg-green-400' :
                            scanResults.analysis?.riskAssessment?.riskLevel === 'medium' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${(scanResults.analysis?.riskAssessment?.overallScore || 0) * 10}%` }}
                        ></div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-green-400">✓ Green Flags:</p>
                        {scanResults.analysis?.riskAssessment?.greenFlags?.map((flag: string, index: number) => (
                          <p key={index} className="text-xs text-gray-400">• {flag}</p>
                        ))}
                      </div>
                      
                      {scanResults.analysis?.riskAssessment?.redFlags?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-red-400">⚠️ Red Flags:</p>
                          {scanResults.analysis?.riskAssessment?.redFlags?.map((flag: string, index: number) => (
                            <p key={index} className="text-xs text-gray-400">• {flag}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Liquidity Analysis */}
              {scanResults.analysis?.liquidityAnalysis && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">💧</span>
                    Liquidity Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3">💰 Total Liquidity</h4>
                      <p className="text-2xl font-bold text-blue-400 mb-4">
                        {scanResults.analysis.liquidityAnalysis.totalLiquidity}
                      </p>
                      
                      <h5 className="font-semibold text-white mb-2">📊 Distribution</h5>
                      <div className="space-y-2 text-sm">
                        {Object.entries(scanResults.analysis.liquidityAnalysis.liquidityDistribution).map(([dex, percentage]) => (
                          <div key={dex} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{dex}:</span>
                            <span className="text-white">{percentage as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">🔄 Major Pairs</h4>
                      <div className="space-y-3">
                        {scanResults.analysis.liquidityAnalysis.majorPairs?.slice(0, 3).map((pair: any, index: number) => (
                          <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-white">{pair.pair}</span>
                              <span className="text-sm text-blue-400">{pair.dex}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Liquidity:</span>
                                <span className="text-white ml-1">{pair.liquidity}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Volume:</span>
                                <span className="text-white ml-1">{pair.volume24h}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DeFi Integration */}
              {scanResults.analysis?.defiIntegration && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🔄</span>
                    DeFi Integration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3">🏛️ Supported Protocols</h4>
                      <div className="space-y-2">
                        {scanResults.analysis.defiIntegration.protocols?.map((protocol: any, index: number) => (
                          <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-white">{protocol.name}</span>
                              <span className="text-sm text-blue-400">{protocol.category}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">APY:</span>
                                <span className="text-green-400 ml-1">{protocol.apy}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">TVL:</span>
                                <span className="text-white ml-1">{protocol.tvl}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">🌾 Yield Opportunities</h4>
                      <div className="space-y-2">
                        {scanResults.analysis.defiIntegration.yieldOpportunities?.slice(0, 3).map((opportunity: any, index: number) => (
                          <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-white text-sm">{opportunity.platform}</span>
                              <span className="text-green-400 font-semibold text-sm">{opportunity.apy}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-1">{opportunity.strategy}</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Risk: {opportunity.riskScore}/10</span>
                              <span className="text-gray-500">TVL: {opportunity.tvl}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Predictions */}
              {scanResults.analysis?.predictions && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🔮</span>
                    AI Price Predictions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">{scanResults.analysis.predictions.priceTargets.short.target}</p>
                      <p className="text-sm text-gray-400">Short Term (1-3 months)</p>
                      <p className="text-xs text-gray-500">Probability: {scanResults.analysis.predictions.priceTargets.short.probability}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-400">{scanResults.analysis.predictions.priceTargets.medium.target}</p>
                      <p className="text-sm text-gray-400">Medium Term (3-12 months)</p>
                      <p className="text-xs text-gray-500">Probability: {scanResults.analysis.predictions.priceTargets.medium.probability}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-400">{scanResults.analysis.predictions.priceTargets.long.target}</p>
                      <p className="text-sm text-gray-400">Long Term (1+ years)</p>
                      <p className="text-xs text-gray-500">Probability: {scanResults.analysis.predictions.priceTargets.long.probability}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-3">📈 Catalysts</h4>
                      <ul className="space-y-1 text-sm">
                        {scanResults.analysis.predictions.catalysts?.map((catalyst: string, index: number) => (
                          <li key={index} className="text-gray-300">• {catalyst}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-400 mb-3">⚠️ Risks</h4>
                      <ul className="space-y-1 text-sm">
                        {scanResults.analysis.predictions.risks?.map((risk: string, index: number) => (
                          <li key={index} className="text-gray-300">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-3">🚀 Opportunities</h4>
                      <ul className="space-y-1 text-sm">
                        {scanResults.analysis.predictions.opportunities?.map((opportunity: string, index: number) => (
                          <li key={index} className="text-gray-300">• {opportunity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Batch Analysis Tab */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Token Addresses (one per line)</label>
            <textarea
              value={batchAddresses}
              onChange={(e) => setBatchAddresses(e.target.value)}
              placeholder={`0x4200000000000000000000000000000000000042\n0x4200000000000000000000000000000000000006\n0x94b008aA00579c1307B0EF2c499aD98a8ce58e58`}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm resize-none h-32"
            />
            <p className="text-xs text-gray-500 mt-2">Maximum 10 addresses per batch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chain</label>
              <select
                value={scanRequest.chain}
                onChange={(e) => setScanRequest(prev => ({ ...prev, chain: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleBatchScan}
            disabled={isScanning || !batchAddresses.trim()}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              isScanning || !batchAddresses.trim()
                ? 'bg-gray-600/50 text-gray-400'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {isScanning ? 'Analyzing Tokens...' : '📊 Start Batch Analysis'}
          </button>

          {/* Batch Results */}
          {batchResults && (
            <div className="mt-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Batch Analysis Results ({batchResults.totalAnalyzed} tokens)
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {batchResults.results?.map((result: any, index: number) => (
                    <div key={index} className={`rounded-lg p-4 border ${
                      result.success 
                        ? 'bg-green-900/20 border-green-600/30' 
                        : 'bg-red-900/20 border-red-600/30'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-mono text-sm text-gray-300">{result.address}</p>
                          {result.success && result.data && (
                            <p className="text-white font-semibold">
                              {result.data.basicInfo?.name} ({result.data.basicInfo?.symbol})
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.success ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>

                      {result.success && result.data && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="text-white ml-2">{result.data.marketData?.price}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Market Cap:</span>
                            <span className="text-white ml-2">{result.data.marketData?.marketCap}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Risk:</span>
                            <span className={`ml-2 ${
                              result.data.riskLevel === 'low' ? 'text-green-400' :
                              result.data.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {result.data.riskScore}/10
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">24h Change:</span>
                            <span className={`ml-2 ${
                              result.data.marketData?.priceChange24h?.startsWith('+') ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {result.data.marketData?.priceChange24h}
                            </span>
                          </div>
                        </div>
                      )}

                      {!result.success && (
                        <p className="text-red-400 text-sm">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}