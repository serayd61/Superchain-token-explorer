'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface AirdropData {
  id: string;
  name: string;
  protocol: string;
  chain: string;
  status: 'active' | 'upcoming' | 'ended' | 'claimed';
  eligibility: 'eligible' | 'not_eligible' | 'checking' | 'unknown';
  amount?: string;
  claimUrl?: string;
  requirements: string[];
  deadline?: string;
  description: string;
  icon: string;
  category: 'defi' | 'nft' | 'gaming' | 'dao' | 'layer2';
}

interface EligibilityCheck {
  address: string;
  chain: string;
  transactions: number;
  volume: string;
  lastActivity: string;
  protocols: string[];
}

export default function AirdropInspector() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checker' | 'history'>('dashboard');
  const [airdrops, setAirdrops] = useState<AirdropData[]>([]);
  const [eligibilityData, setEligibilityData] = useState<EligibilityCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState('');

  // Mock airdrop data - in production, this would come from APIs
  const mockAirdrops: AirdropData[] = [
    {
      id: '1',
      name: 'LayerZero (ZRO)',
      protocol: 'LayerZero',
      chain: 'Multi-chain',
      status: 'active',
      eligibility: 'eligible',
      amount: '125 ZRO',
      claimUrl: 'https://layerzero.network/claim',
      requirements: ['Bridge assets', 'Use 10+ chains', 'Volume > $1,000'],
      deadline: '2025-03-15',
      description: 'Omnichain infrastructure protocol rewarding early adopters',
      icon: '🌐',
      category: 'layer2'
    },
    {
      id: '2',
      name: 'Scroll (SCR)',
      protocol: 'Scroll',
      chain: 'Ethereum',
      status: 'upcoming',
      eligibility: 'checking',
      requirements: ['Deploy contracts', 'Bridge ETH', 'Use dApps'],
      deadline: '2025-04-01',
      description: 'zkEVM Layer 2 scaling solution for Ethereum',
      icon: '📜',
      category: 'layer2'
    },
    {
      id: '3',
      name: 'Blast (BLAST)',
      protocol: 'Blast',
      chain: 'Ethereum',
      status: 'ended',
      eligibility: 'not_eligible',
      requirements: ['Early depositor', 'Invite friends', 'Hold balance'],
      deadline: '2024-06-26',
      description: 'Native yield Layer 2 for ETH and stablecoins',
      icon: '💥',
      category: 'layer2'
    },
    {
      id: '4',
      name: 'Taiko (TAIKO)',
      protocol: 'Taiko',
      chain: 'Ethereum',
      status: 'active',
      eligibility: 'eligible',
      amount: '89 TAIKO',
      claimUrl: 'https://taiko.xyz/claim',
      requirements: ['Validate blocks', 'Run proposer', 'Community participation'],
      deadline: '2025-05-20',
      description: 'Decentralized ZK-Rollup for Ethereum',
      icon: '🏗️',
      category: 'layer2'
    },
    {
      id: '5',
      name: 'Linea Voyage',
      protocol: 'Linea',
      chain: 'Linea',
      status: 'upcoming',
      eligibility: 'checking',
      requirements: ['Use Linea dApps', 'Bridge assets', 'Weekly activities'],
      deadline: '2025-06-01',
      description: 'ConsenSys zkEVM Layer 2 network',
      icon: '🚀',
      category: 'layer2'
    },
    {
      id: '6',
      name: 'Hyperliquid (HYPE)',
      protocol: 'Hyperliquid',
      chain: 'Arbitrum',
      status: 'active',
      eligibility: 'eligible',
      amount: '2,847 HYPE',
      claimUrl: 'https://app.hyperliquid.xyz/claim',
      requirements: ['Trade derivatives', 'Provide liquidity', 'Referrals'],
      deadline: '2025-02-28',
      description: 'Decentralized derivatives exchange',
      icon: '⚡',
      category: 'defi'
    }
  ];

  useEffect(() => {
    setAirdrops(mockAirdrops);
  }, []);

  const checkEligibility = async (targetAddress?: string) => {
    const addressToCheck = targetAddress || address;
    if (!addressToCheck) return;

    setIsLoading(true);
    try {
      // Mock eligibility check - in production, this would call various APIs
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const mockEligibility: EligibilityCheck = {
        address: addressToCheck,
        chain: 'Multi-chain',
        transactions: 1247,
        volume: '$45,230',
        lastActivity: '2025-01-23',
        protocols: ['Uniswap', 'Aave', 'Compound', 'LayerZero', 'Hyperliquid', 'Taiko']
      };

      setEligibilityData(mockEligibility);
      
      // Update airdrop eligibility based on mock data
      setAirdrops(prev => prev.map(airdrop => ({
        ...airdrop,
        eligibility: airdrop.status === 'active' ? 
          (Math.random() > 0.5 ? 'eligible' : 'not_eligible') : 
          airdrop.eligibility
      })));
      
    } catch (error) {
      console.error('Eligibility check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: AirdropData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'claimed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEligibilityColor = (eligibility: AirdropData['eligibility']) => {
    switch (eligibility) {
      case 'eligible': return 'bg-green-100 text-green-800 border-green-200';
      case 'not_eligible': return 'bg-red-100 text-red-800 border-red-200';
      case 'checking': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unknown': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: AirdropData['category']) => {
    switch (category) {
      case 'defi': return 'bg-blue-500';
      case 'layer2': return 'bg-purple-500';
      case 'nft': return 'bg-pink-500';
      case 'gaming': return 'bg-green-500';
      case 'dao': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const eligibleAirdrops = airdrops.filter(a => a.eligibility === 'eligible');
  const totalValue = eligibleAirdrops.reduce((sum, airdrop) => {
    if (airdrop.amount) {
      const match = airdrop.amount.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
      return sum + (match ? parseFloat(match[1].replace(/,/g, '')) : 0);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">🎁 Airdrop Inspector</h2>
          <p className="text-gray-300">Track and claim airdrops across multiple chains</p>
        </div>
        {isConnected && (
          <Button
            onClick={() => checkEligibility()}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? 'Checking...' : '🔍 Check Eligibility'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {eligibilityData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{eligibleAirdrops.length}</div>
              <div className="text-sm text-green-300">Eligible Airdrops</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{totalValue.toLocaleString()}</div>
              <div className="text-sm text-blue-300">Est. Tokens</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">{eligibilityData.transactions}</div>
              <div className="text-sm text-purple-300">Total Transactions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border-orange-500/30">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">{eligibilityData.volume}</div>
              <div className="text-sm text-orange-300">Total Volume</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('checker')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'checker'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🔍 Checker
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📋 History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {airdrops.map((airdrop) => (
            <Card key={airdrop.id} className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getCategoryColor(airdrop.category)} rounded-lg flex items-center justify-center text-xl`}>
                      {airdrop.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{airdrop.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{airdrop.protocol}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(airdrop.status)} border`}>
                    {airdrop.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{airdrop.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Chain:</span>
                  <span className="text-white text-sm">{airdrop.chain}</span>
                </div>
                
                {airdrop.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Amount:</span>
                    <span className="text-green-400 font-semibold text-sm">{airdrop.amount}</span>
                  </div>
                )}
                
                {airdrop.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Deadline:</span>
                    <span className="text-orange-400 text-sm">{airdrop.deadline}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Eligibility:</span>
                  <Badge className={`${getEligibilityColor(airdrop.eligibility)} border text-xs`}>
                    {airdrop.eligibility.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-gray-400 text-sm">Requirements:</span>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {airdrop.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {airdrop.claimUrl && airdrop.eligibility === 'eligible' && (
                  <Button 
                    onClick={() => window.open(airdrop.claimUrl, '_blank')}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    🎁 Claim Now
                  </Button>
                )}
                
                {airdrop.eligibility === 'checking' && (
                  <Button 
                    disabled
                    className="w-full bg-yellow-600/20 text-yellow-400 cursor-not-allowed"
                  >
                    ⏳ Checking Eligibility
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'checker' && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">🔍 Manual Address Checker</CardTitle>
            <p className="text-gray-400">Check any address for airdrop eligibility</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={checkingAddress}
                onChange={(e) => setCheckingAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
              <Button
                onClick={() => checkEligibility(checkingAddress)}
                disabled={isLoading || !checkingAddress}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? 'Checking...' : 'Check'}
              </Button>
            </div>
            
            {eligibilityData && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-semibold">Eligibility Report</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Address:</span>
                    <p className="text-white font-mono">{eligibilityData.address.slice(0, 10)}...{eligibilityData.address.slice(-8)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Activity:</span>
                    <p className="text-white">{eligibilityData.lastActivity}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Transactions:</span>
                    <p className="text-green-400">{eligibilityData.transactions}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Volume:</span>
                    <p className="text-green-400">{eligibilityData.volume}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Protocols Used:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {eligibilityData.protocols.map((protocol) => (
                      <Badge key={protocol} className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                        {protocol}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">📋 Airdrop History</CardTitle>
            <p className="text-gray-400">Your claimed and missed airdrops</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {airdrops.filter(a => a.status === 'ended' || a.status === 'claimed').map((airdrop) => (
                <div key={airdrop.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${getCategoryColor(airdrop.category)} rounded-lg flex items-center justify-center text-sm`}>
                      {airdrop.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{airdrop.name}</p>
                      <p className="text-gray-400 text-sm">{airdrop.protocol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getEligibilityColor(airdrop.eligibility)} border mb-1`}>
                      {airdrop.eligibility.replace('_', ' ')}
                    </Badge>
                    {airdrop.amount && (
                      <p className="text-green-400 text-sm">{airdrop.amount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}