'use client';

import { useState, useEffect } from 'react';

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        
        // Request account access
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setIsConnected(true);
          
          // Try to switch to Base network
          await switchToBase();
          
          // Get balance
          await getBalance(address);
        }
      } else {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToBase = async () => {
    try {
      const ethereum = (window as any).ethereum;
      
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      });
    } catch (switchError: any) {
      // If Base network is not added, add it
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Base network:', addError);
        }
      }
    }
  };

  const getBalance = async (address: string) => {
    try {
      const ethereum = (window as any).ethereum;
      
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from wei to ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Failed to get balance:', error);
      setBalance('0');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0');
    setError('');
  };

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            await getBalance(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">🔗 Base Wallet Connection</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="text-sm text-red-700">❌ {error}</div>
        </div>
      )}
      
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </div>
          ) : (
            '🔗 Connect to Base Network'
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Connected Wallet</div>
                <div className="font-mono text-xs text-gray-800">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Balance</div>
                <div className="font-bold text-blue-600">{balance} ETH</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => getBalance(walletAddress)}
              className="bg-green-100 text-green-700 p-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              🔄 Refresh Balance
            </button>
            <button
              onClick={disconnectWallet}
              className="bg-red-100 text-red-700 p-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              🔌 Disconnect
            </button>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700">✅ Connected to Base Network</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
