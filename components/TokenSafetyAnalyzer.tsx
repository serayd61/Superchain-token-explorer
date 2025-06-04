import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Check, X, Info, RefreshCw } from 'lucide-react';

interface SafetyCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  severity: 'high' | 'medium' | 'low';
  details?: string;
}

interface TokenSafetyAnalysis {
  contractAddress: string;
  chain: string;
  checks: SafetyCheck[];
  overallScore: number;
  riskLevel: 'very-high' | 'high' | 'moderate' | 'low';
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  };
}

interface TokenSafetyProps {
  contractAddress: string;
  chain: string;
  tokenSymbol?: string;
  tokenName?: string;
}

export default function TokenSafetyAnalyzer({ contractAddress, chain, tokenSymbol, tokenName }: TokenSafetyProps) {
  const [analysis, setAnalysis] = useState<TokenSafetyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeSafety();
  }, [contractAddress, chain]);

  const analyzeSafety = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analyze-token?address=${contractAddress}&chain=${chain}`);
      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Safety analysis error:', error);
      setError('Failed to analyze token safety');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'Low Risk';
      case 'moderate': return 'Moderate Risk';
      case 'high': return 'High Risk';
      case 'very-high': return 'Very High Risk';
      default: return 'Unknown Risk';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <X className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 animate-spin" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very-high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Analysis Error</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={analyzeSafety}
            className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Token Safety Analysis
        </h3>
        
        {!loading && analysis && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}/100
              </div>
              <div className={`text-sm px-3 py-1 rounded-full border ${getRiskLevelColor(analysis.riskLevel)}`}>
                {getScoreLabel(analysis.riskLevel)}
              </div>
            </div>
            <button
              onClick={analyzeSafety}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh analysis"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : analysis ? (
        <>
          {/* Token Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{analysis.metadata.name}</span>
                <span className="text-gray-500 ml-2">({analysis.metadata.symbol})</span>
              </div>
              <div className="text-gray-600">
                Supply: {Number(analysis.metadata.totalSupply).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Safety Checks */}
          <div className="space-y-3">
            {analysis.checks.map((check, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  check.status === 'checking' ? 'border-gray-200' :
                  check.status === 'pass' ? 'border-green-200 bg-green-50' :
                  check.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <h4 className="font-medium text-gray-800">{check.name}</h4>
                        <p className="text-sm text-gray-600">{check.description}</p>
                        {check.details && check.status !== 'checking' && (
                          <p className="text-xs text-gray-500 mt-1">{check.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      check.severity === 'high' ? 'bg-red-100 text-red-700' :
                      check.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {check.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Risk Assessment Summary:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Score {analysis.overallScore}/100:</strong> {getScoreLabel(analysis.riskLevel)}</li>
                  <li>• Higher scores indicate safer tokens</li>
                  <li>• Always do your own research (DYOR)</li>
                  <li>• This analysis is not financial advice</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
