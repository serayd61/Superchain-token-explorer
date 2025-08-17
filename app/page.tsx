'use client';

import { useState, useEffect } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
}

interface BridgeState {
  fromNetwork: string;
  toNetwork: string;
  asset: string;
  amount: string;
  estimatedTime: string;
  fees: string;
}

export default function ComprehensiveDeFiHomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [quickScanResult, setQuickScanResult] = useState<any>(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: null
  });
  const [bridge, setBridge] = useState<BridgeState>({
    fromNetwork: 'Ethereum',
    toNetwork: 'Base',
    asset: 'ETH',
    amount: '',
    estimatedTime: '2-3 minutes',
    fees: '$5.20'
  });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [intentInput, setIntentInput] = useState('');
  const [intentResult, setIntentResult] = useState<any>(null);
  const [walletAnalytics, setWalletAnalytics] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [airdropOpportunities, setAirdropOpportunities] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isProcessingIntent, setIsProcessingIntent] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'bridging' | 'success' | 'error'>('idle');
  const [isClient, setIsClient] = useState(false);

  const examples = [
    { input: "I want to earn 15% on my $10k ETH", output: "Found 3 strategies averaging 14.2% APY" },
    { input: "Safest way to earn on USDC", output: "Conservative lending on Aave: 4.8% APY" },
    { input: "Find arbitrage opportunities", output: "ETH price gap: 0.3% profit available" },
    { input: "Best yield farming for $50k", output: "Optimized portfolio: 18.7% projected APY" },
    { input: "bana en güvenli DeFi projelerini bul", output: "🇹🇷 Güvenli stratejiler: Compound, Aave" },
    { input: "trouve-moi les meilleurs projets DeFi", output: "🇫🇷 Projets recommandés: Uniswap V3 pools" }
  ];

  const protocolData = [
    { name: 'Aerodrome', network: 'Base', apy: '12.5%', tvl: '$2.8B', risk: 'Low' },
    { name: 'Compound V3', network: 'Base', apy: '8.2%', tvl: '$1.4B', risk: 'Low' },
    { name: 'Uniswap V3', network: 'Optimism', apy: '15.7%', tvl: '$3.1B', risk: 'Medium' },
    { name: 'Aave V3', network: 'Arbitrum', apy: '6.8%', tvl: '$4.2B', risk: 'Low' },
    { name: 'Curve Finance', network: 'Ethereum', apy: '9.3%', tvl: '$2.9B', risk: 'Low' },
    { name: 'Balancer', network: 'Polygon', apy: '11.4%', tvl: '$1.8B', risk: 'Medium' }
  ];

  const supportedWallets = [
    { name: 'MetaMask', icon: '🦊', popular: true },
    { name: 'WalletConnect', icon: '🔗', popular: true },
    { name: 'Coinbase Wallet', icon: '🏪', popular: true },
    { name: 'Rainbow', icon: '🌈', popular: false },
    { name: 'Trust Wallet', icon: '🛡️', popular: false },
    { name: 'Phantom', icon: '👻', popular: false }
  ];

  const supportedNetworks = [
    { name: 'Ethereum', symbol: 'ETH', color: 'from-blue-400 to-blue-600', tvl: '45.2', apy: '8.3' },
    { name: 'Base', symbol: 'BASE', color: 'from-blue-500 to-blue-700', tvl: '12.8', apy: '12.5' },
    { name: 'Optimism', symbol: 'OP', color: 'from-red-400 to-red-600', tvl: '8.4', apy: '9.7' },
    { name: 'Arbitrum', symbol: 'ARB', color: 'from-blue-400 to-cyan-500', tvl: '15.6', apy: '11.2' },
    { name: 'Polygon', symbol: 'MATIC', color: 'from-purple-400 to-purple-600', tvl: '6.3', apy: '14.8' },
    { name: 'BSC', symbol: 'BNB', color: 'from-yellow-400 to-yellow-600', tvl: '9.1', apy: '13.4' }
  ];

  const supportedAssets = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💵' },
    { symbol: 'USDT', name: 'Tether', icon: '💰' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '₿' }
  ];

  useEffect(() => {
    setIsVisible(true);
    setIsClient(true);
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async (walletType: string) => {
    try {
      setShowWalletModal(false);
      
      if (typeof window !== 'undefined' && (window as any).ethereum && walletType === 'MetaMask') {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          if (accounts.length > 0) {
            const chainId = await (window as any).ethereum.request({
              method: 'eth_chainId',
            });
            
            const balance = await (window as any).ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            
            const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(3);
            
            setWallet({
              isConnected: true,
              address: accounts[0],
              balance: `${balanceInEth} ETH`,
              network: chainId === '0x1' ? 'Ethereum' : chainId === '0x2105' ? 'Base' : 'Unknown'
            });
          }
        } catch (walletError) {
          console.warn('MetaMask connection failed, using demo mode:', walletError);
          setWallet({
            isConnected: true,
            address: '0x742d35Cc6634C0532925a3b8D238659B4d8A4ae4',
            balance: '2.45 ETH',
            network: 'Base (Demo)'
          });
        }
      } else {
        const demoAddresses = {
          'MetaMask': '0x742d35Cc6634C0532925a3b8D238659B4d8A4ae4',
          'WalletConnect': '0x8ba1f109551bD432803012645Hac136c22C501',
          'Coinbase Wallet': '0x1234567890123456789012345678901234567890',
          'Rainbow': '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          'Trust Wallet': '0x9876543210987654321098765432109876543210',
          'Phantom': '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba'
        };
        
        const walletIndex = Object.keys(demoAddresses).indexOf(walletType) + 1;
        
        setWallet({
          isConnected: true,
          address: demoAddresses[walletType as keyof typeof demoAddresses] || demoAddresses['MetaMask'],
          balance: `${(2.5 + walletIndex * 0.3).toFixed(3)} ETH`,
          network: `${walletType} (Demo)`
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Wallet connection failed. Please try again or use demo mode.');
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      network: null
    });
    setWalletAnalytics(null);
    setShowAnalytics(false);
    setAirdropOpportunities([]);
  };

  const processIntent = async () => {
    if (!intentInput.trim()) return;
    
    setIsProcessingIntent(true);
    try {
      const response = await fetch('/api/intent/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: intentInput,
          advanced: true
        }),
      });
      
      const data = await response.json();
      setIntentResult(data);
    } catch (error) {
      console.error('Intent processing failed:', error);
      setIntentResult({
        success: false,
        error: 'Failed to process intent. Please try again.'
      });
    }
    setIsProcessingIntent(false);
  };

  const handleIntentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processIntent();
    }
  };

  const analyzeWallet = async (address: string) => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalytics = {
        totalValue: '$45,230.50',
        chains: [
          { name: 'Ethereum', value: '$25,400.00', percentage: 56 },
          { name: 'Base', value: '$12,800.00', percentage: 28 },
          { name: 'Arbitrum', value: '$4,600.00', percentage: 10 },
          { name: 'Optimism', value: '$2,430.50', percentage: 6 }
        ],
        transactions: {
          total: 1847,
          lastMonth: 23,
          avgGasSpent: '$12.40'
        },
        defiInteractions: [
          { protocol: 'Uniswap V3', interactions: 45, value: '$8,200' },
          { protocol: 'Aave', interactions: 12, value: '$15,400' },
          { protocol: 'Compound', interactions: 8, value: '$3,800' }
        ],
        riskScore: 7.2,
        activityDays: 89,
        uniqueContracts: 34
      };
      
      setWalletAnalytics(mockAnalytics);
      setShowAnalytics(true);
      
      const mockAirdrops = [
        { 
          project: 'LayerZero', 
          status: 'Eligible', 
          estimatedValue: '$1,200-$3,500',
          requirements: 'Bridge transactions detected',
          probability: 85 
        },
        { 
          project: 'zkSync Era', 
          status: 'Potential', 
          estimatedValue: '$500-$1,500',
          requirements: 'More volume needed',
          probability: 45 
        },
        { 
          project: 'StarkNet', 
          status: 'Eligible', 
          estimatedValue: '$800-$2,000',
          requirements: 'Multiple transactions found',
          probability: 75 
        }
      ];
      
      setAirdropOpportunities(mockAirdrops);
      
    } catch (error) {
      console.error('Wallet analysis failed:', error);
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (wallet.isConnected && wallet.address && !walletAnalytics) {
      analyzeWallet(wallet.address);
    }
  }, [wallet.isConnected, wallet.address]);

  const bridgeAssets = async () => {
    try {
      setBridgeStatus('bridging');
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBridgeStatus('success');
      setShowBridgeModal(false);
      setTimeout(() => {
        setBridgeStatus('idle');
      }, 3000);
    } catch (error) {
      setBridgeStatus('error');
      console.error('Bridge failed:', error);
    }
  };

  useEffect(() => {
    const calculateFees = () => {
      const baseNetwork = bridge.fromNetwork.toLowerCase();
      const amount = parseFloat(bridge.amount) || 0;
      
      let baseFee = 5.20;
      if (baseNetwork === 'ethereum') baseFee = 12.50;
      if (baseNetwork === 'polygon') baseFee = 0.50;
      if (baseNetwork === 'base') baseFee = 2.20;
      
      const dynamicFee = amount * 0.001;
      const totalFee = baseFee + dynamicFee;
      
      setBridge(prev => ({
        ...prev,
        fees: `$${totalFee.toFixed(2)}`,
        estimatedTime: baseNetwork === 'ethereum' ? '15-20 minutes' : '2-3 minutes'
      }));
    };
    
    calculateFees();
  }, [bridge.fromNetwork, bridge.toNetwork, bridge.amount]);

  const handleQuickScan = async () => {
    if (!tokenAddress.trim()) return;
    
    setQuickScanResult({
      address: tokenAddress,
      name: 'Example Token',
      symbol: 'EXT',
      price: '$1.23',
      change24h: '+5.67%',
      liquidity: '$890K',
      holders: '1,234',
      riskScore: 7.2,
      recommendations: [
        'Liquidity pools available on Uniswap V3',
        'Lending opportunities on Compound',
        'Staking rewards: 12.5% APY'
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Superchain Explorer</h1>
            <p className="text-sm text-gray-400">Natural Language DeFi</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {wallet.isConnected ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Analytics</span>
                {isAnalyzing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                )}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-300">{wallet.balance}</p>
                <p className="text-xs text-gray-500">{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</p>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Connect Wallet
            </button>
          )}
          
          <button
            onClick={() => setShowBridgeModal(true)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all"
          >
            🌉 Bridge
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        {/* Hero Section */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Intent Layer
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            The world's first natural language interface for DeFi with zkCodex-style analytics
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2">
              <span className="text-sm font-medium">🌍 4 Languages</span>
            </div>
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full px-4 py-2">
              <span className="text-sm font-medium">📊 Multi-Chain</span>
            </div>
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full px-4 py-2">
              <span className="text-sm font-medium">🎁 Airdrops</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-5xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-center mb-6">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => wallet.isConnected && analyzeWallet(wallet.address!)}
              disabled={!wallet.isConnected}
              className={`p-6 rounded-xl border transition-all ${
                wallet.isConnected 
                  ? 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30' 
                  : 'bg-gray-900/20 border-gray-700/30 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold mb-1">Analytics</h4>
              <p className="text-sm text-gray-400">Portfolio analysis</p>
            </button>
            
            <button
              onClick={() => setShowBridgeModal(true)}
              className="p-6 rounded-xl border bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30 transition-all"
            >
              <div className="text-3xl mb-2">🌉</div>
              <h4 className="font-semibold mb-1">Bridge</h4>
              <p className="text-sm text-gray-400">Cross-chain</p>
            </button>
            
            <button
              onClick={() => setIntentInput("Find me safe DeFi strategies")}
              className="p-6 rounded-xl border bg-green-900/20 border-green-500/30 hover:bg-green-900/30 transition-all"
            >
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-semibold mb-1">AI Intent</h4>
              <p className="text-sm text-gray-400">Natural language</p>
            </button>
            
            <button
              onClick={() => wallet.isConnected && analyzeWallet(wallet.address!)}
              disabled={!wallet.isConnected}
              className={`p-6 rounded-xl border transition-all ${
                wallet.isConnected 
                  ? 'bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30' 
                  : 'bg-gray-900/20 border-gray-700/30 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="font-semibold mb-1">Airdrops</h4>
              <p className="text-sm text-gray-400">Opportunities</p>
            </button>
          </div>
        </div>

        {/* AI Intent Input */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-6">🧠 AI Intent Layer</h3>
            
            <div className="relative mb-4">
              <textarea
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                onKeyPress={handleIntentKeyPress}
                placeholder="Try: 'I want to earn 15% on my ETH' or 'bana güvenli DeFi bul'"
                className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-20"
              />
              <button
                onClick={processIntent}
                disabled={!intentInput.trim() || isProcessingIntent}
                className={`absolute bottom-3 right-3 px-4 py-2 rounded-lg transition-all ${
                  isProcessingIntent || !intentInput.trim()
                    ? 'bg-gray-600/50 text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
              >
                {isProcessingIntent ? 'Processing...' : 'Analyze'}
              </button>
            </div>

            {intentResult && (
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                {intentResult.success ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="text-green-400 text-lg">✅</span>
                      <h4 className="text-lg font-semibold ml-2 text-green-400">Success</h4>
                    </div>
                    <p className="text-blue-400">{intentResult.intent?.intentType}</p>
                    <p className="text-sm text-gray-400 mt-2">{intentResult.intent?.reasoning}</p>
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <span className="text-lg">❌</span>
                    <span className="ml-2">{intentResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Chain Stats */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">⛓️ Multi-Chain Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {supportedNetworks.map((network, idx) => (
              <div key={idx} className={`bg-gradient-to-r ${network.color}/20 border border-current/30 rounded-xl p-4 text-center`}>
                <div className="text-2xl mb-2">
                  {network.name === 'Ethereum' ? '⟠' :
                   network.name === 'Base' ? '🔵' :
                   network.name === 'Optimism' ? '🔴' :
                   network.name === 'Arbitrum' ? '🔷' :
                   network.name === 'Polygon' ? '💜' : '💛'}
                </div>
                <h4 className="font-semibold text-sm">{network.name}</h4>
                {isClient && (
                  <>
                    <p className="text-xs text-gray-400 mt-1">TVL: ${network.tvl}B</p>
                    <p className="text-xs text-green-400">APY: {network.apy}%</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Stats */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">🔥 Live Protocols</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {protocolData.map((protocol, idx) => (
              <div key={idx} className="bg-black/20 border border-white/10 rounded-xl p-6 hover:bg-black/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold">{protocol.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    protocol.risk === 'Low' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {protocol.risk}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network</span>
                    <span className="text-white">{protocol.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">APY</span>
                    <span className="text-green-400 font-bold">{protocol.apy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TVL</span>
                    <span className="text-white">{protocol.tvl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg">
            Start Your DeFi Journey
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 p-6 border-t border-white/10 text-center text-gray-400">
        <p className="mb-4">Built for RetroPGF • First Natural Language DeFi Interface</p>
        
        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <a 
            href="https://twitter.com/serayd61" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
          >
            <span>🐦</span>
            <span>Twitter</span>
          </a>
          <a 
            href="https://github.com/serayd61" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-gray-300 transition-colors"
          >
            <span>⚡</span>
            <span>GitHub</span>
          </a>
          <a 
            href="/docs" 
            className="flex items-center space-x-2 hover:text-purple-400 transition-colors"
          >
            <span>📚</span>
            <span>Docs</span>
          </a>
        </div>

        {/* Donate Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
            <h4 className="text-purple-300 font-semibold mb-2 flex items-center justify-center">
              <span className="mr-2">💝</span>
              Support Development
            </h4>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Donate Address (ETH/Base/Arbitrum):</p>
              <div className="flex items-center justify-between">
                <code className="text-sm text-blue-300 font-mono">
                  0x7FbD935c9972b6A4c0b6F7c6f650996677bF6e0A
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('0x7FbD935c9972b6A4c0b6F7c6f650996677bF6e0A');
                    // Could add a toast notification here
                  }}
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy address"
                >
                  📋
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Help us build the future of DeFi UX! 🚀</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            © 2025 Superchain Explorer • Made with ❤️ for the crypto community
          </p>
        </div>
      </footer>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {supportedWallets.map((wallet, idx) => (
                <button
                  key={idx}
                  onClick={() => connectWallet(wallet.name)}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-all"
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <span className="font-medium">{wallet.name}</span>
                  {wallet.popular && (
                    <span className="ml-auto px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">Popular</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bridge Modal */}
      {showBridgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Bridge Assets</h3>
              <button
                onClick={() => setShowBridgeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From Network</label>
                <select
                  value={bridge.fromNetwork}
                  onChange={(e) => setBridge(prev => ({ ...prev, fromNetwork: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {supportedNetworks.map(network => (
                    <option key={network.name} value={network.name}>{network.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Network</label>
                <select
                  value={bridge.toNetwork}
                  onChange={(e) => setBridge(prev => ({ ...prev, toNetwork: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {supportedNetworks.filter(net => net.name !== bridge.fromNetwork).map(network => (
                    <option key={network.name} value={network.name}>{network.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Asset</label>
                <select
                  value={bridge.asset}
                  onChange={(e) => setBridge(prev => ({ ...prev, asset: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {supportedAssets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.icon} {asset.symbol} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={bridge.amount}
                  onChange={(e) => setBridge(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white">{bridge.estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fees</span>
                  <span className="text-white">{bridge.fees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You'll Receive</span>
                  <span className="text-green-400">{bridge.amount || '0'} {bridge.asset}</span>
                </div>
              </div>

              <button
                onClick={bridgeAssets}
                disabled={!bridge.amount || !wallet.isConnected || bridgeStatus === 'bridging'}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  bridgeStatus === 'bridging'
                    ? 'bg-yellow-600/20 text-yellow-400'
                    : bridgeStatus === 'success'
                    ? 'bg-green-600/20 text-green-400'
                    : bridgeStatus === 'error'
                    ? 'bg-red-600/20 text-red-400'
                    : wallet.isConnected && bridge.amount
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gray-700/50 text-gray-400'
                }`}
              >
                {bridgeStatus === 'bridging' ? 'Bridging...' :
                 bridgeStatus === 'success' ? '✅ Success!' :
                 bridgeStatus === 'error' ? '❌ Failed' :
                 !wallet.isConnected ? 'Connect Wallet' :
                 !bridge.amount ? 'Enter Amount' :
                 `Bridge ${bridge.amount} ${bridge.asset}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Analytics Dashboard */}
      {showAnalytics && walletAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">📊 Wallet Analytics</h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-900/40 to-blue-700/40 border border-blue-500/50 rounded-xl p-6">
                  <h3 className="text-blue-300 text-sm font-medium mb-2">Portfolio Value</h3>
                  <p className="text-2xl font-bold text-white">{walletAnalytics.totalValue}</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/40 to-green-700/40 border border-green-500/50 rounded-xl p-6">
                  <h3 className="text-green-300 text-sm font-medium mb-2">Transactions</h3>
                  <p className="text-2xl font-bold text-white">{walletAnalytics.transactions.total}</p>
                  <p className="text-xs text-green-400">+{walletAnalytics.transactions.lastMonth} this month</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/40 to-purple-700/40 border border-purple-500/50 rounded-xl p-6">
                  <h3 className="text-purple-300 text-sm font-medium mb-2">Risk Score</h3>
                  <p className="text-2xl font-bold text-white">{walletAnalytics.riskScore}/10</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-900/40 to-orange-700/40 border border-orange-500/50 rounded-xl p-6">
                  <h3 className="text-orange-300 text-sm font-medium mb-2">Activity Days</h3>
                  <p className="text-2xl font-bold text-white">{walletAnalytics.activityDays}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-black/40 border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">💎 Chain Distribution</h3>
                  <div className="space-y-4">
                    {walletAnalytics.chains.map((chain: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="font-medium">{chain.name}</span>
                        <div className="text-right">
                          <p className="font-medium">{chain.value}</p>
                          <p className="text-sm text-gray-400">{chain.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-black/40 border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">🔄 DeFi Interactions</h3>
                  <div className="space-y-4">
                    {walletAnalytics.defiInteractions.map((interaction: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div>
                          <p className="font-medium">{interaction.protocol}</p>
                          <p className="text-sm text-gray-400">{interaction.interactions} interactions</p>
                        </div>
                        <p className="font-medium text-green-400">{interaction.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {airdropOpportunities.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">🎁 Airdrop Opportunities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {airdropOpportunities.map((airdrop, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/50 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg">{airdrop.project}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            airdrop.status === 'Eligible' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'
                          }`}>
                            {airdrop.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-400">Value</p>
                            <p className="font-medium text-yellow-400">{airdrop.estimatedValue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Requirements</p>
                            <p className="text-sm">{airdrop.requirements}</p>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Probability</span>
                              <span className="font-medium">{airdrop.probability}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                                style={{ width: `${airdrop.probability}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
