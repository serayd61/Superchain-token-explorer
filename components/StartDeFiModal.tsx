'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import {
  ArrowUpDown,
  Zap,
  TrendingUp,
  Shield,
  Coins,
  Activity,
  DollarSign,
  Target,
  Lock,
  Unlock,
  ExternalLink,
  X,
  ChevronRight
} from 'lucide-react';

interface StartDeFiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeFiOpportunity {
  protocol: string;
  category: 'swap' | 'yield' | 'bridge' | 'stake' | 'lend' | 'leverage';
  apy?: string;
  tvl: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  minAmount?: string;
  chains: string[];
  icon: string;
  action: string;
  features: string[];
}

export default function StartDeFiModal({ isOpen, onClose }: StartDeFiModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<DeFiOpportunity | null>(null);
  const [userBalance, setUserBalance] = useState('0.0');

  const opportunities: DeFiOpportunity[] = [
    {
      protocol: 'Superchain DeFi Dashboard',
      category: 'yield',
      apy: '12.5%',
      tvl: '$12.8B',
      riskLevel: 'Low',
      description: 'Your personal DeFi analytics dashboard with live protocol data and advanced insights',
      minAmount: 'Free',
      chains: ['Base', 'Optimism', 'Arbitrum', 'Ethereum', 'Polygon'],
      icon: '📊',
      action: 'Open Dashboard',
      features: ['Live Data', 'Multi-Chain', 'Analytics', 'Real-time APY']
    },    // Swap Opportunities
    {
      protocol: 'Aerodrome',
      category: 'swap',
      tvl: '$2.8B',
      riskLevel: 'Low',
      description: 'Base\'s leading DEX with the best prices and deepest liquidity',
      minAmount: '0.001 ETH',
      chains: ['Base'],
      icon: '🔵',
      action: 'Swap Tokens',
      features: ['Best Prices', 'Low Slippage', 'Native Base', 'Gas Efficient']
    },
    {
      protocol: 'Uniswap V3',
      category: 'swap',
      tvl: '$4.2B',
      riskLevel: 'Low',
      description: 'Industry-leading AMM with concentrated liquidity',
      minAmount: '0.001 ETH',
      chains: ['Base', 'Ethereum', 'Arbitrum'],
      icon: '🦄',
      action: 'Trade on Uniswap',
      features: ['Concentrated Liquidity', 'Multi-Chain', 'Advanced Features']
    },

    // Yield Opportunities
    {
      protocol: 'Compound V3',
      category: 'yield',
      apy: '8.2%',
      tvl: '$1.4B',
      riskLevel: 'Low',
      description: 'Earn yield by supplying assets to secure lending protocol',
      minAmount: '10 USDC',
      chains: ['Base'],
      icon: '🏦',
      action: 'Supply Assets',
      features: ['Battle-Tested', 'Autonomous Interest', 'Collateral Enabled']
    },
    {
      protocol: 'Aave V3',
      category: 'yield',
      apy: '6.8%',
      tvl: '$4.2B',
      riskLevel: 'Low',
      description: 'World\'s most trusted lending protocol with advanced features',
      minAmount: '1 USDC',
      chains: ['Base', 'Ethereum', 'Arbitrum', 'Polygon'],
      icon: '👻',
      action: 'Lend & Earn',
      features: ['Flash Loans', 'Isolation Mode', 'eMode', 'Multi-Chain']
    },
    {
      protocol: 'Velodrome V2',
      category: 'yield',
      apy: '25.4%',
      tvl: '$180M',
      riskLevel: 'Medium',
      description: 'High-yield liquidity mining with vote-escrowed rewards',
      minAmount: '0.1 ETH',
      chains: ['Optimism'],
      icon: '🏃',
      action: 'Provide Liquidity',
      features: ['High APY', 'Vote Rewards', 'Bribes', 'veLDO']
    },

    // Bridge Opportunities
    {
      protocol: 'Base Bridge',
      category: 'bridge',
      tvl: '$850M',
      riskLevel: 'Low',
      description: 'Official Coinbase bridge with institutional security',
      minAmount: '0.005 ETH',
      chains: ['Ethereum', 'Base'],
      icon: '🌉',
      action: 'Bridge to Base',
      features: ['Official Bridge', 'Fast Finality', 'Low Fees', 'Secure']
    },
    {
      protocol: 'Stargate',
      category: 'bridge',
      tvl: '$420M',
      riskLevel: 'Medium',
      description: 'Cross-chain liquidity protocol with unified liquidity',
      minAmount: '1 USDC',
      chains: ['Ethereum', 'Base', 'Arbitrum', 'Polygon', 'Optimism'],
      icon: '🌟',
      action: 'Cross-Chain Transfer',
      features: ['Unified Liquidity', 'Multi-Chain', 'Instant Settlement']
    },

    // Staking Opportunities
    {
      protocol: 'Coinbase cbETH',
      category: 'stake',
      apy: '3.8%',
      tvl: '$1.2B',
      riskLevel: 'Low',
      description: 'Liquid staking with Coinbase - institutional grade security',
      minAmount: '0.001 ETH',
      chains: ['Base', 'Ethereum'],
      icon: '🏪',
      action: 'Liquid Stake ETH',
      features: ['Liquid Staking', 'Institutional Security', 'Base Native']
    },
    {
      protocol: 'RocketPool',
      category: 'stake',
      apy: '4.2%',
      tvl: '$2.8B',
      riskLevel: 'Low',
      description: 'Decentralized liquid staking with community governance',
      minAmount: '0.01 ETH',
      chains: ['Ethereum'],
      icon: '🚀',
      action: 'Decentralized Staking',
      features: ['Decentralized', 'Community Governed', 'Battle-Tested']
    }
  ];

  const categories = [
    { id: 'all', name: 'All DeFi', icon: '🌟', count: opportunities.length },
    { id: 'swap', name: 'Swap & Trade', icon: '🔄', count: opportunities.filter(o => o.category === 'swap').length },
    { id: 'yield', name: 'Earn Yield', icon: '💰', count: opportunities.filter(o => o.category === 'yield').length },
    { id: 'bridge', name: 'Bridge Assets', icon: '🌉', count: opportunities.filter(o => o.category === 'bridge').length },
    { id: 'stake', name: 'Stake ETH', icon: '⚡', count: opportunities.filter(o => o.category === 'stake').length }
  ];

  const filteredOpportunities = activeCategory === 'all' 
    ? opportunities 
    : opportunities.filter(o => o.category === activeCategory);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'High': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const handleStartDeFi = (opportunity: DeFiOpportunity) => {
    // Here you would integrate with the actual DeFi protocol
    console.log(`Starting DeFi with ${opportunity.protocol}`);
    
    // For demo purposes, show the protocol's interface
    if (opportunity.protocol === 'Aerodrome') {
      window.open('https://aerodrome.finance/', '_blank');
    } else if (opportunity.protocol === 'Uniswap V3') {
      window.open('https://app.uniswap.org/', '_blank');
    } else if (opportunity.protocol === 'Compound V3') {
      window.open('https://app.compound.finance/', '_blank');
    } else if (opportunity.protocol === 'Aave V3') {
      window.open('https://app.aave.com/', '_blank');
    } else if (opportunity.protocol === 'Base Bridge') {
      window.open('https://bridge.base.org/', '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Start DeFi Journey</h2>
              <p className="text-gray-400">Professional-grade DeFi opportunities curated for you</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">$12.8B+</div>
              <div className="text-sm text-gray-400">Total TVL Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">25.4%</div>
              <div className="text-sm text-gray-400">Highest APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">8</div>
              <div className="text-sm text-gray-400">Protocols Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">5 Chains</div>
              <div className="text-sm text-gray-400">Multi-Chain Support</div>
            </div>
          </div>
        </div>

        <div className="flex h-[60vh]">
          {/* Categories Sidebar */}
          <div className="w-64 p-6 border-r border-gray-700 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                      : 'hover:bg-gray-800/50 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOpportunities.map((opportunity, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{opportunity.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{opportunity.protocol}</h4>
                          <div className="flex items-center gap-2">
                            {opportunity.apy && (
                              <Badge className="bg-green-900/20 text-green-400 border-green-500/30">
                                {opportunity.apy} APY
                              </Badge>
                            )}
                            <Badge className={getRiskColor(opportunity.riskLevel)}>
                              {opportunity.riskLevel} Risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">TVL</div>
                        <div className="font-semibold text-white">{opportunity.tvl}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">{opportunity.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {opportunity.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Coins className="w-4 h-4" />
                        Min: {opportunity.minAmount}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleStartDeFi(opportunity)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {opportunity.action}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>All protocols are audited and security-reviewed</span>
            </div>
            <div className="text-sm text-gray-400">
              Always DYOR • Not financial advice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}