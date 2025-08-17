'use client';

import React, { useState } from 'react';

interface UserIntent {
  originalText: string;
  detectedLanguage?: string;
  translatedText?: string;
  intentType: string;
  parameters: any;
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
  riskAssessment: {
    score: number;
    factors: string[];
    warnings: string[];
  };
  estimatedGas: string;
  timeToExecute: string;
}

interface ParseResult {
  success: boolean;
  intent?: UserIntent;
  error?: string;
  metadata?: any;
}

export default function BeautifulIntentTestPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);

  const examplePrompts = [
    {
      lang: '🇺🇸',
      text: "I want to earn 15% on my $10k ETH",
      description: "English - High yield request"
    },
    {
      lang: '🇹🇷', 
      text: "bana en yüksek faiz getiren güvenli defi projeleri bul",
      description: "Turkish - Safe high yield search"
    },
    {
      lang: '🇩🇪',
      text: "finde mir die sichersten DeFi-Projekte mit hoher Rendite", 
      description: "German - Secure high return projects"
    },
    {
      lang: '🇫🇷',
      text: "trouve-moi les meilleurs projets DeFi avec un bon rendement",
      description: "French - Best DeFi projects with good returns"
    }
  ];

  const parseIntent = async (testInput?: string) => {
    const inputToUse = testInput || input;
    if (!inputToUse.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/intent/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: inputToUse, advanced: true })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getIntentTypeIcon = (type: string) => {
    const icons = {
      yield: '💰',
      swap: '🔄', 
      bridge: '🌉',
      arbitrage: '⚡',
      hedge: '🛡️',
      portfolio: '📊',
      unknown: '❓'
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  const getLanguageFlag = (lang: string) => {
    const flags = {
      turkish: '🇹🇷',
      german: '🇩🇪',
      french: '🇫🇷', 
      english: '🇺🇸'
    };
    return flags[lang as keyof typeof flags] || '🌍';
  };

  const getNetworkIcon = (network: string) => {
    const icons = {
      base: '🔵',
      optimism: '🔴', 
      arbitrum: '🟠',
      polygon: '🟣',
      ethereum: '⚪'
    };
    return icons[network.toLowerCase() as keyof typeof icons] || '🌐';
  };

  const getProtocolInfo = (protocolName: string, network: string) => {
    const protocols: Record<string, any> = {
      'Aerodrome': {
        logo: 'https://aerodrome.finance/images/logo.png',
        dappUrl: 'https://aerodrome.finance',
        analyticsUrl: 'https://defillama.com/protocol/aerodrome',
        description: 'Leading DEX on Base with ve(3,3) tokenomics and concentrated liquidity.',
        risks: 'Impermanent loss, smart contract risk, new protocol'
      },
      'Velodrome': {
        logo: 'https://app.velodrome.finance/logo.svg',
        dappUrl: 'https://app.velodrome.finance',
        analyticsUrl: 'https://defillama.com/protocol/velodrome',
        description: 'Next-generation AMM that combines the best of Curve and Solidly.',
        risks: 'Impermanent loss, ve(3,3) tokenomics complexity'
      },
      'Camelot': {
        logo: 'https://app.camelot.exchange/images/logo.svg',
        dappUrl: 'https://app.camelot.exchange',
        analyticsUrl: 'https://defillama.com/protocol/camelot',
        description: 'Arbitrum native DEX with innovative features and community focus.',
        risks: 'High APY volatility, impermanent loss, concentrated liquidity'
      },
      'Moonwell': {
        logo: 'https://moonwell.fi/logo.png', 
        dappUrl: 'https://moonwell.fi',
        analyticsUrl: 'https://defillama.com/protocol/moonwell-artemis',
        description: 'Decentralized lending and borrowing protocol optimized for Base.',
        risks: 'Liquidation risk, interest rate volatility'
      },
      'Compound': {
        logo: 'https://compound.finance/images/compound-mark.svg',
        dappUrl: 'https://app.compound.finance',
        analyticsUrl: 'https://defillama.com/protocol/compound-v3',
        description: 'Established lending protocol with institutional-grade security.',
        risks: 'Liquidation risk, governance risk'
      },
      'Aave': {
        logo: 'https://aave.com/favicon.ico',
        dappUrl: 'https://app.aave.com',
        analyticsUrl: 'https://defillama.com/protocol/aave-v3',
        description: 'Leading decentralized lending protocol with advanced features.',
        risks: 'Liquidation risk, borrowing costs'
      },
      'Uniswap': {
        logo: 'https://app.uniswap.org/favicon.ico',
        dappUrl: 'https://app.uniswap.org',
        analyticsUrl: 'https://defillama.com/protocol/uniswap-v3',
        description: 'Most popular decentralized exchange with concentrated liquidity.',
        risks: 'Impermanent loss, MEV exposure'
      }
    };

    const defaultProtocol = {
      logo: `https://ui-avatars.com/api/?name=${protocolName}&background=0066cc&color=fff&size=48`,
      dappUrl: `https://www.google.com/search?q=${protocolName}+${network}+defi+protocol`,
      analyticsUrl: `https://defillama.com/protocol/${protocolName.toLowerCase()}`,
      description: `DeFi protocol on ${network} network offering various financial services.`,
      risks: 'Smart contract risk, protocol risk, market volatility'
    };

    return protocols[protocolName] || defaultProtocol;
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-50';
    if (score <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              ← Superchain Intent Layer
            </a>
            <div className="text-sm text-gray-500">
              🌍 Multilingual Test Interface
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 AI Intent Parser
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Express your DeFi goals in natural language. Our AI understands English, Turkish, German, and French.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Tell us what you want to achieve</h2>
          
          <div className="space-y-6">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., I want to earn 15% on my ETH with moderate risk..."
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none text-lg"
              maxLength={500}
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {input.length}/500 characters
              </span>
              <button
                onClick={() => parseIntent()}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🚀 Parse Intent
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Try these examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(example.text);
                  parseIntent(example.text);
                }}
                disabled={loading}
                className="p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 disabled:opacity-50 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{example.lang}</span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                      "{example.text}"
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {example.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">Analysis Results</h3>

            {result.success && result.intent ? (
              <div className="space-y-6">
                {/* Intent Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">
                      {getIntentTypeIcon(result.intent.intentType)}
                    </span>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 capitalize">
                        {result.intent.intentType} Strategy
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        {result.intent.detectedLanguage && (
                          <span className="text-sm bg-white px-3 py-1 rounded-full">
                            {getLanguageFlag(result.intent.detectedLanguage)} {result.intent.detectedLanguage}
                          </span>
                        )}
                        <span className={`text-sm font-medium ${getConfidenceColor(result.intent.confidence)}`}>
                          {(result.intent.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{result.intent.reasoning}</p>
                </div>

                {/* Parameters */}
                {Object.keys(result.intent.parameters).length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Detected Parameters:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(result.intent.parameters).map(([key, value]) => (
                        value !== undefined && value !== null && (
                          <div key={key} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="font-medium text-gray-900">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations with Protocol Links */}
                {result.intent.suggestedActions.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">💡 Recommended Protocols:</h5>
                    <div className="space-y-4">
                      {result.intent.suggestedActions.map((action, index) => {
                        // Extract protocol info from action text
                        const protocolMatch = action.match(/(\w+)\s+on\s+(\w+):\s+([\d.]+)%\s+APY/);
                        
                        if (protocolMatch) {
                          const [, protocolName, network, apy] = protocolMatch;
                          const protocolInfo = getProtocolInfo(protocolName, network);
                          
                          return (
                            <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-300 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <img 
                                    src={protocolInfo.logo} 
                                    alt={protocolName}
                                    className="w-12 h-12 rounded-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${protocolName}&background=0066cc&color=fff&size=48`;
                                    }}
                                  />
                                  <div>
                                    <h6 className="font-bold text-lg text-gray-900">{protocolName}</h6>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span className="bg-white px-2 py-1 rounded-full border">
                                        {getNetworkIcon(network)} {network}
                                      </span>
                                      <span className="text-green-600 font-semibold">{apy}% APY</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  {protocolInfo.dappUrl && (
                                    <a
                                      href={protocolInfo.dappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                      🚀 Use Protocol
                                    </a>
                                  )}
                                  {protocolInfo.analyticsUrl && (
                                    <a
                                      href={protocolInfo.analyticsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                      📊 Analytics
                                    </a>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-4 text-sm text-gray-700">
                                {protocolInfo.description}
                              </div>
                              
                              {protocolInfo.risks && (
                                <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2">
                                  ⚠️ <strong>Risks:</strong> {protocolInfo.risks}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          // Fallback for non-protocol suggestions
                          return (
                            <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <span className="text-blue-600 mt-1">💡</span>
                              <span className="text-gray-700">{action}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">🛡️ Risk Assessment:</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.intent.riskAssessment.score)}`}>
                        Risk Score: {result.intent.riskAssessment.score}/10
                      </span>
                      <span className="text-sm text-gray-600">
                        Gas: {result.intent.estimatedGas} • Time: {result.intent.timeToExecute}
                      </span>
                    </div>
                    
                    {result.intent.riskAssessment.factors.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Risk Factors: </span>
                        <span className="text-sm text-gray-600">
                          {result.intent.riskAssessment.factors.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {result.intent.riskAssessment.warnings.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Warnings: </span>
                        <span className="text-sm text-gray-600">
                          {result.intent.riskAssessment.warnings.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {result.metadata && (
                  <div className="text-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Processed in {result.metadata.processingTime}ms • 
                      Version {result.metadata.version} • 
                      {result.metadata.supportedLanguages?.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            🌟 Powered by Superchain Intent Layer • Making DeFi accessible through natural language
          </p>
        </div>
      </div>
    </div>
  );
}
