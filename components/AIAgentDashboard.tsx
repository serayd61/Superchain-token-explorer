'use client';
import { useState, useEffect } from 'react';

interface AIAgentDashboardProps {
  onStrategySelect?: (strategy: any) => void;
}

interface StrategyRequest {
  userGoal: string;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  portfolioSize: number;
  chains: string[];
}

export default function AIAgentDashboard({ onStrategySelect }: AIAgentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'risk' | 'optimize'>('strategy');
  const [isLoading, setIsLoading] = useState(false);
  const [strategyRequest, setStrategyRequest] = useState<StrategyRequest>({
    userGoal: '',
    riskTolerance: 'medium',
    timeHorizon: 'medium',
    portfolioSize: 10000,
    chains: ['Optimism', 'Base']
  });
  const [strategyResults, setStrategyResults] = useState<any>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  const handleStrategyGeneration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strategyRequest),
      });
      
      const data = await response.json();
      if (data.success) {
        setStrategyResults(data);
      }
    } catch (error) {
      console.error('Strategy generation failed:', error);
    }
    setIsLoading(false);
  };

  const handleRiskAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent/risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocols: ['Velodrome', 'Synthetix', 'Aave'],
          positions: [
            {
              protocol: 'Velodrome',
              chain: 'Optimism',
              amount: 5000,
              asset: 'OP/ETH',
              duration: 30
            },
            {
              protocol: 'Aave V3',
              chain: 'Optimism',
              amount: 3000,
              asset: 'USDC',
              duration: 60
            }
          ],
          totalValue: 8000
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setRiskAnalysis(data);
      }
    } catch (error) {
      console.error('Risk analysis failed:', error);
    }
    setIsLoading(false);
  };

  const handlePortfolioOptimization = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/yield-aggregator/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioSize: strategyRequest.portfolioSize,
          riskTolerance: strategyRequest.riskTolerance === 'low' ? 'conservative' : 
                        strategyRequest.riskTolerance === 'high' ? 'aggressive' : 'moderate',
          timeHorizon: strategyRequest.timeHorizon,
          preferredChains: strategyRequest.chains,
          constraints: {
            maxSinglePosition: 35,
            minLiquidity: 1000000,
            requireAudited: true
          }
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setOptimizationResults(data);
      }
    } catch (error) {
      console.error('Portfolio optimization failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI DeFi Agent</h2>
          <p className="text-gray-400">Intelligent strategy optimization and risk management</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-900/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'strategy' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🎯 Strategy Generator
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'risk' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚠️ Risk Analysis
        </button>
        <button
          onClick={() => setActiveTab('optimize')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'optimize' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 Portfolio Optimizer
        </button>
      </div>

      {/* Strategy Generator Tab */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Investment Goal</label>
              <textarea
                value={strategyRequest.userGoal}
                onChange={(e) => setStrategyRequest(prev => ({ ...prev, userGoal: e.target.value }))}
                placeholder="e.g., I want to earn 15% APY on my ETH with medium risk tolerance"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none h-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Size ($)</label>
              <input
                type="number"
                value={strategyRequest.portfolioSize}
                onChange={(e) => setStrategyRequest(prev => ({ ...prev, portfolioSize: Number(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
              <select
                value={strategyRequest.riskTolerance}
                onChange={(e) => setStrategyRequest(prev => ({ ...prev, riskTolerance: e.target.value as any }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="low">Low Risk (Conservative)</option>
                <option value="medium">Medium Risk (Balanced)</option>
                <option value="high">High Risk (Aggressive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Horizon</label>
              <select
                value={strategyRequest.timeHorizon}
                onChange={(e) => setStrategyRequest(prev => ({ ...prev, timeHorizon: e.target.value as any }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="short">Short Term (&lt; 3 months)</option>
                <option value="medium">Medium Term (3-12 months)</option>
                <option value="long">Long Term (&gt; 12 months)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Chains</label>
              <div className="space-y-2">
                {['Optimism', 'Base', 'Arbitrum', 'Ethereum'].map((chain) => (
                  <label key={chain} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={strategyRequest.chains.includes(chain)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStrategyRequest(prev => ({ ...prev, chains: [...prev.chains, chain] }));
                        } else {
                          setStrategyRequest(prev => ({ ...prev, chains: prev.chains.filter(c => c !== chain) }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">{chain}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStrategyGeneration}
            disabled={isLoading || !strategyRequest.userGoal}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              isLoading || !strategyRequest.userGoal
                ? 'bg-gray-600/50 text-gray-400'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Generating Strategies...' : '🎯 Generate AI Strategies'}
          </button>

          {/* Strategy Results */}
          {strategyResults && (
            <div className="mt-8 space-y-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">📊 Recommended Strategies</h3>
                <div className="grid grid-cols-1 gap-4">
                  {strategyResults.strategies?.slice(0, 3).map((strategy: any, index: number) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4 border border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-white">{strategy.name}</h4>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            strategy.riskLevel === 'low' ? 'bg-green-600/20 text-green-400' :
                            strategy.riskLevel === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {strategy.riskLevel.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                            {strategy.expectedAPY}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{strategy.description}</p>
                      <div className="text-sm text-gray-300">
                        <p><span className="text-gray-500">Protocol:</span> {strategy.protocol}</p>
                        <p><span className="text-gray-500">Chain:</span> {strategy.chain}</p>
                        <p><span className="text-gray-500">TVL:</span> {strategy.tvl}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">🎯 Portfolio Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{strategyResults.totalExpectedAPY}</p>
                    <p className="text-sm text-gray-500">Expected APY</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{strategyResults.riskScore}/10</p>
                    <p className="text-sm text-gray-500">Risk Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{strategyResults.diversificationScore}/10</p>
                    <p className="text-sm text-gray-500">Diversification</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{strategyResults.strategies?.length || 0}</p>
                    <p className="text-sm text-gray-500">Strategies</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Analysis Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">🔍 Advanced Risk Analysis</h3>
            <p className="text-gray-400 mb-6">Analyze your DeFi positions with AI-powered risk assessment</p>
            
            <button
              onClick={handleRiskAnalysis}
              disabled={isLoading}
              className={`px-8 py-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-gray-600/50 text-gray-400'
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
              }`}
            >
              {isLoading ? 'Analyzing Risks...' : '⚠️ Analyze Portfolio Risk'}
            </button>
          </div>

          {riskAnalysis && (
            <div className="mt-8 space-y-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">🎯 Risk Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{riskAnalysis.analysis?.overallRiskScore}/10</p>
                    <p className="text-sm text-gray-500">Overall Risk</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      riskAnalysis.analysis?.riskLevel === 'low' ? 'text-green-400' :
                      riskAnalysis.analysis?.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {riskAnalysis.analysis?.riskLevel?.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">Risk Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{riskAnalysis.alerts?.length || 0}</p>
                    <p className="text-sm text-gray-500">Active Alerts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{riskAnalysis.hedgeStrategies?.length || 0}</p>
                    <p className="text-sm text-gray-500">Hedge Options</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">🚨 Risk Factors</h4>
                    <div className="space-y-2">
                      {riskAnalysis.analysis?.riskFactors?.map((factor: any, index: number) => (
                        <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-white text-sm">{factor.category}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              factor.severity === 'low' ? 'bg-green-600/20 text-green-400' :
                              factor.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-red-600/20 text-red-400'
                            }`}>
                              {factor.score}/10
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">🛡️ Hedge Strategies</h4>
                    <div className="space-y-2">
                      {riskAnalysis.hedgeStrategies?.map((hedge: any, index: number) => (
                        <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-white text-sm">{hedge.type}</span>
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                              {hedge.effectiveness}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{hedge.description}</p>
                          <p className="text-xs text-green-400">Cost: {hedge.cost}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Optimizer Tab */}
      {activeTab === 'optimize' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">🔄 Portfolio Optimization</h3>
            <p className="text-gray-400 mb-6">AI-powered yield optimization across multiple protocols</p>
            
            <button
              onClick={handlePortfolioOptimization}
              disabled={isLoading}
              className={`px-8 py-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-gray-600/50 text-gray-400'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Optimizing Portfolio...' : '📊 Optimize Portfolio'}
            </button>
          </div>

          {optimizationResults && (
            <div className="mt-8 space-y-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">🎯 Optimized Portfolio</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{optimizationResults.portfolio?.totalAPY}%</p>
                    <p className="text-sm text-gray-500">Total APY</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{optimizationResults.portfolio?.riskScore}/10</p>
                    <p className="text-sm text-gray-500">Risk Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{optimizationResults.portfolio?.diversificationScore}/10</p>
                    <p className="text-sm text-gray-500">Diversification</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{optimizationResults.portfolio?.allocations?.length || 0}</p>
                    <p className="text-sm text-gray-500">Positions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">💰 Allocation Breakdown</h4>
                  {optimizationResults.portfolio?.allocations?.map((allocation: any, index: number) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4 border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-white">{allocation.opportunity.protocol}</h5>
                          <p className="text-sm text-gray-400">{allocation.opportunity.strategy}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">${allocation.allocation.toLocaleString()}</p>
                          <p className="text-sm text-gray-400">{allocation.percentage}%</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">APY:</span>
                          <span className="text-green-400 ml-2">{allocation.opportunity.apy}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Chain:</span>
                          <span className="text-white ml-2">{allocation.opportunity.chain}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Risk:</span>
                          <span className={`ml-2 ${
                            allocation.opportunity.riskScore <= 4 ? 'text-green-400' :
                            allocation.opportunity.riskScore <= 7 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {allocation.opportunity.riskScore}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {optimizationResults.alternativeStrategies && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">🔄 Alternative Strategies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {optimizationResults.alternativeStrategies.map((alt: any, index: number) => (
                      <div key={index} className="bg-black/30 rounded-lg p-4 border border-gray-600">
                        <h4 className="font-semibold text-white mb-2">{alt.name}</h4>
                        <p className="text-sm text-gray-400 mb-3">{alt.description}</p>
                        <div className="text-sm">
                          <p className="text-green-400">APY: {alt.estimatedAPY.toFixed(1)}%</p>
                          <p className="text-blue-400">Risk: {alt.riskScore.toFixed(1)}/10</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}