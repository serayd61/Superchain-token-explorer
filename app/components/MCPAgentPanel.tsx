'use client';

import { useState } from 'react';
// import { mcpOrchestrator } from '../lib/mcpAgents';

interface MCPAgentPanelProps {
  walletAddress: string;
  balance: string;
  connectedWallet: string;
}

export default function MCPAgentPanel({ walletAddress, balance, connectedWallet }: MCPAgentPanelProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const context = {
    walletAddress,
    balance,
    connectedWallet,
    networkId: 'base-mainnet'
  };

  const workflows = [
    {
      id: 'market-analysis',
      name: '📊 Market Analysis',
      description: 'Analyze Base ecosystem opportunities',
      agents: ['market-analysis'],
      color: 'blue'
    },
    {
      id: 'risk-assessment',
      name: '🛡️ Risk Assessment', 
      description: 'Evaluate portfolio risks',
      agents: ['risk-management'],
      color: 'red'
    },
    {
      id: 'yield-optimization',
      name: '💰 Yield Optimization',
      description: 'Find best yield opportunities',
      agents: ['yield-optimization'],
      color: 'green'
    },
    {
      id: 'full-analysis',
      name: '🧠 Full AI Analysis',
      description: 'Complete multi-agent analysis',
      agents: ['market-analysis', 'risk-management', 'yield-optimization'],
      color: 'purple'
    }
  ];

  const executeWorkflow = async (workflow: any) => {
    setLoading(true);
    setActiveWorkflow(workflow.id);
    setResults(null);

    try {
      // Mock result for now
      const result = { 
        success: true,
        analysis: `${workflow.name} completed for wallet ${walletAddress.slice(0, 6)}...`,
        recommendations: ['Feature coming soon', 'Connect with real MCP agents']
      };
      setResults(result);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setResults({ error: 'Workflow execution failed' });
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      red: 'from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
      green: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      purple: 'from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">🧠 MCP AI Agent System</h3>
      
      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
        <div className="text-sm text-gray-600 mb-2">💡 Context-Aware AI for your Base wallet:</div>
        <div className="text-xs text-gray-500">
          Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} | 
          Balance: {balance} ETH | Network: Base
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-4">
        {workflows.map((workflow) => (
          <button
            key={workflow.id}
            onClick={() => executeWorkflow(workflow)}
            disabled={loading}
            className={`w-full bg-gradient-to-r ${getColorClasses(workflow.color)} text-white p-3 rounded-lg font-medium transition-all disabled:opacity-50 text-left`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{workflow.name}</div>
                <div className="text-xs opacity-90">{workflow.description}</div>
              </div>
              {loading && activeWorkflow === workflow.id && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {results && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-3">🤖 AI Agent Results</h4>
          
          {results.error ? (
            <div className="text-red-600">❌ {results.error}</div>
          ) : (
            <div className="space-y-4">
              {results.results?.map((result: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-medium text-sm mb-2">🤖 {result.agent}</div>
                  
                  {result.analysis && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Price:</strong> {result.analysis.price} 
                        <span className="ml-2 text-green-600">{result.analysis.priceChange24h}</span>
                      </div>
                      <div className="text-sm">
                        <strong>Recommendation:</strong> {result.analysis.recommendation}
                      </div>
                      {result.analysis.baseEcosystem && (
                        <div className="text-xs text-gray-600">
                          Base Ecosystem: Aerodrome {result.analysis.baseEcosystem.aerodromeAPY} APY
                        </div>
                      )}
                    </div>
                  )}

                  {result.riskAnalysis && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Risk Score:</strong> {result.riskAnalysis.riskScore}/10 
                        <span className="ml-2">({result.riskAnalysis.overallRisk})</span>
                      </div>
                      <div className="text-xs">
                        {result.riskAnalysis.recommendations?.slice(0, 2).map((rec: string, i: number) => (
                          <div key={i}>{rec}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.yieldOpportunities && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">💰 Top Yield Opportunities:</div>
                      {Object.entries(result.yieldOpportunities).slice(0, 2).map(([key, opportunity]: [string, any]) => (
                        <div key={key} className="text-xs bg-green-50 p-2 rounded border">
                          <strong>{opportunity.protocol}:</strong> {opportunity.apy} APY
                          <div className="text-gray-600">{opportunity.strategy}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {results.summary && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="font-medium text-sm text-blue-900 mb-1">📋 AI Summary</div>
                  <div className="text-xs text-blue-700">
                    Analyzed by {results.summary.totalAgents} agents | 
                    Confidence: {results.summary.confidence}% |
                    Risk: {results.summary.overallRisk}
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
