'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import MCPAgentPanel from './MCPAgentPanel';

export default function MultiWalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  const [showWallets, setShowWallets] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (connector: any) => {
    try {
      setError('');
      await connect({ connector });
      setShowWallets(false);
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(error?.message || 'Connection failed');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWallets(false);
    setError('');
  };

  const getConnectorIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask': return '🦊';
      case 'coinbase wallet': return '🏪';
      case 'walletconnect': return '🔗';
      case 'injected': return '🔌';
      default: return '👛';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">🔗 Connect to Base Network</h3>
      
      {(error || connectError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="text-sm text-red-700">❌ {error || connectError?.message}</div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="space-y-3">
          {!showWallets ? (
            <button
              onClick={() => setShowWallets(true)}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isPending ? (
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
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 disabled:opacity-50"
                >
                  <span className="text-2xl">{getConnectorIcon(connector.name)}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{connector.name}</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                  {connector.name.toLowerCase().includes('metamask') && (
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
                  <span>{getConnectorIcon(connector?.name || '')}</span>
                  {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                </div>
                <div className="text-sm text-gray-600">
                  Balance: {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700">✅ Connected via {connector?.name}</span>
            </div>
          </div>
          
          {/* MCP Agent Panel */}
          <MCPAgentPanel 
            walletAddress={address || ''}
            balance={balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
            connectedWallet={connector?.name || 'Unknown'}
          />
        </div>
      )}
    </div>
  );
}