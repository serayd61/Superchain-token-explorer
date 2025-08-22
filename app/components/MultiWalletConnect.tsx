'use client';

import { useState, useEffect } from 'react';
import MCPAgentPanel from './MCPAgentPanel';

type WalletType = 'metamask' | 'coinbase' | 'walletconnect';

interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  installed: boolean;
}

export default function MultiWalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWallets, setShowWallets] = useState(false);

  const getAvailableWallets = (): WalletInfo[] => {
    const wallets: WalletInfo[] = [
      {
        type: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask
      },
      {
        type: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🏪',
        installed: typeof window !== 'undefined' && !!(window as any).ethereum?.isCoinbaseWallet
      },
      {
        type: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        installed: true
      }
    ];
    
    return wallets;
  };

  const getBalance = async (address: string, walletType: WalletType) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const balance = await (window as any).ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        setBalance(balanceInEth);
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
      setBalance('0.0000');
    }
  };

  const connectWallet = async (walletType: WalletType) => {
    setIsLoading(true);
    setError('');
    
    try {
      if (walletType === 'walletconnect') {
        setError('WalletConnect integration coming soon!');
        setIsLoading(false);
        return;
      }
      
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        setError('Please install a Web3 wallet like MetaMask');
        setIsLoading(false);
        return;
      }

      const baseChainId = '0x2105';
      
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: baseChainId }]
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: baseChainId,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          } catch (addError) {
            setError('Failed to add Base network. Please add it manually.');
            setIsLoading(false);
            return;
          }
        } else {
          setError('Failed to switch to Base network');
          setIsLoading(false);
          return;
        }
      }

      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setConnectedWallet(walletType);
        setIsConnected(true);
        setShowWallets(false);
        await getBalance(accounts[0], walletType);
      }
      
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
    }
    
    setIsLoading(false);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0');
    setConnectedWallet(null);
    setShowWallets(false);
    setError('');
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            
            if ((window as any).ethereum.isMetaMask) {
              setConnectedWallet('metamask');
            } else if ((window as any).ethereum.isCoinbaseWallet) {
              setConnectedWallet('coinbase');
            }
            
            await getBalance(accounts[0], 'metamask');
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);

  const availableWallets = getAvailableWallets();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">🔗 Connect to Base Network</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="text-sm text-red-700">❌ {error}</div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="space-y-3">
          {!showWallets ? (
            <button
              onClick={() => setShowWallets(true)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                '🔗 Connect Wallet'
              )}
            </button>
          ) : (
            <div className="space-y-2">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.type}
                  onClick={() => connectWallet(wallet.type)}
                  disabled={isLoading || (!wallet.installed && wallet.type !== 'walletconnect')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    wallet.installed || wallet.type === 'walletconnect'
                      ? 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300'
                      : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{wallet.name}</div>
                    <div className="text-sm text-gray-500">
                      {wallet.installed || wallet.type === 'walletconnect' ? 'Available' : 'Not installed'}
                    </div>
                  </div>
                  {wallet.type === 'metamask' && wallet.installed && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </button>
              ))}
              
              <button
                onClick={() => setShowWallets(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>{connectedWallet === 'metamask' ? '🦊' : '🏪'}</span>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
                <div className="text-sm text-gray-600">Balance: {balance} ETH</div>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700">✅ Connected to Base Network</span>
            </div>
          </div>
          
          {/* MCP Agent Panel */}
          <MCPAgentPanel 
            walletAddress={walletAddress}
            balance={balance}
            connectedWallet={connectedWallet!}
          />
        </div>
      )}
    </div>
  );
}