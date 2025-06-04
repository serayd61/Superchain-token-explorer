import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Check, X, Info } from 'lucide-react';

interface SafetyCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  severity: 'high' | 'medium' | 'low';
  details?: string;
}

interface TokenSafetyProps {
  contractAddress: string;
  chain: string;
}

export default function TokenSafetyAnalyzer({ contractAddress, chain }: TokenSafetyProps) {
  const [checks, setChecks] = useState<SafetyCheck[]>([
    {
      name: 'Contract Verification',
      description: 'Source code verified on explorer',
      status: 'checking',
      severity: 'high'
    },
    {
      name: 'Ownership Status',
      description: 'Contract ownership renounced or safe',
      status: 'checking',
      severity: 'high'
    },
    {
      name: 'Honeypot Detection',
      description: 'Can sell tokens after buying',
      status: 'checking',
      severity: 'high'
    },
    {
      name: 'Tax Analysis',
      description: 'Buy/sell tax within reasonable limits',
      status: 'checking',
      severity: 'medium'
    },
    {
      name: 'Liquidity Lock',
      description: 'Liquidity locked for investor protection',
      status: 'checking',
      severity: 'medium'
    },
    {
      name: 'Holder Distribution',
      description: 'No single wallet holds majority',
      status: 'checking',
      severity: 'medium'
    },
    {
      name: 'Trading Activity',
      description: 'Natural trading patterns detected',
      status: 'checking',
      severity: 'low'
    }
  ]);

  const [overallScore, setOverallScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeSafety();
  }, [contractAddress, chain]);

  const analyzeSafety = async () => {
    setLoading(true);
    
    try {
      // Simulate API calls - replace with actual implementation
      const response = await fetch(`/api/analyze-token?address=${contractAddress}&chain=${chain}`);
      const data = await response.json();
      
      // For demo purposes, let's simulate some results
      const simulatedChecks: SafetyCheck[] = [
        {
          name: 'Contract Verification',
          description: 'Source code verified on explorer',
          status: Math.random() > 0.3 ? 'pass' : 'fail',
          severity: 'high',
          details: 'Verified on BaseScan'
        },
        {
          name: 'Ownership Status',
          description: 'Contract ownership renounced or safe',
          status: Math.random() > 0.5 ? 'pass' : 'warning',
          severity: 'high',
          details: 'Owner can modify contract'
        },
        {
          name: 'Honeypot Detection',
          description: 'Can sell tokens after buying',
          status: Math.random() > 0.2 ? 'pass' : 'fail',
          severity: 'high',
          details: 'No selling restrictions found'
        },
        {
          name: 'Tax Analysis',
          description: 'Buy/sell tax within reasonable limits',
          status: Math.random() > 0.4 ? 'pass' : 'warning',
          severity: 'medium',
          details: 'Buy: 5%, Sell: 5%'
        },
        {
          name: 'Liquidity Lock',
          description: 'Liquidity locked for investor protection',
          status: Math.random() > 0.6 ? 'pass' : 'fail',
          severity: 'medium',
          details: 'No liquidity lock detected'
        },
        {
          name: 'Holder Distribution',
          description: 'No single wallet holds majority',
          status: Math.random() > 0.5 ? 'pass' : 'warning',
          severity: 'medium',
          details: 'Top holder: 15%'
        },
        {
          name: 'Trading Activity',
          description: 'Natural trading patterns detected',
          status: 'pass',
          severity: 'low',
          details: 'Organic trading detected'
        }
      ];
      
      setChecks(simulatedChecks);
      
      // Calculate overall score
      const score = calculateScore(simulatedChecks);
      setOverallScore(score);
      
    } catch (error) {
      console.error('Safety analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (checks: SafetyCheck[]): number => {
    let totalScore = 0;
    let maxScore = 0;
    
    checks.forEach(check => {
      const weight = check.severity === 'high' ? 3 : check.severity === 'medium' ? 2 : 1;
      maxScore += weight;
      
      if (check.status === 'pass') {
        totalScore += weight;
      } else if (check.status === 'warning') {
        totalScore += weight * 0.5;
      }
    });
    
    return Math.round((totalScore / maxScore) * 100);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Very Safe';
    if (score >= 60) return 'Moderate Risk';
    if (score >= 40) return 'High Risk';
    return 'Very High Risk';
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Token Safety Analysis
        </h3>
        
        {!loading && (
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}/100
            </div>
            <div className="text-sm text-gray-600">{getScoreLabel(overallScore)}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {checks.map((check, index) => (
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

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to interpret this score:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>80-100:</strong> Generally safe, but always DYOR</li>
              <li>• <strong>60-79:</strong> Some concerns, proceed with caution</li>
              <li>• <strong>40-59:</strong> Significant risks detected</li>
              <li>• <strong>0-39:</strong> High risk, consider avoiding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}