'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { networkConfig, type SupportedChainId } from '../lib/wagmi-config';
import { 
  Wallet, 
  LogOut, 
  Copy, 
  ExternalLink, 
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface WalletConnectProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConnect?: (address: string, balance: string, network: string) => void;
}

interface ConnectionError {
  code?: number;
  message: string;
  cause?: string;
}

const getErrorMessage = (error: any): string => {
  if (error?.code === 4001) {
    return 'User rejected the connection request';
  }
  if (error?.code === -32002) {
    return 'Connection request already pending. Please check your wallet.';
  }
  if (error?.message?.includes('User rejected')) {
    return 'User rejected the connection request';
  }
  if (error?.message?.includes('Already processing')) {
    return 'Connection already in progress. Please wait.';
  }
  if (error?.message?.includes('Network Error')) {
    return 'Network connection failed. Please check your internet.';
  }
  if (error?.message?.includes('Timeout')) {
    return 'Connection timed out. Please try again.';
  }
  return error?.message || 'Connection failed. Please try again.';
};

export default function WalletConnect({ isOpen, onClose, onConnect }: WalletConnectProps) {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  
  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  const [showNetworks, setShowNetworks] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const currentNetwork = networkConfig[chainId as SupportedChainId] || {
    name: 'Unknown',
    color: '#gray',
    icon: '?'
  };

  useEffect(() => {
    if (isConnected && address && balance && onConnect) {
      onConnect(
        address,
        `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`,
        currentNetwork.name
      );
    }
  }, [isConnected, address, balance, currentNetwork.name, onConnect]);

  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      await Promise.race([
        connect({ connector }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 30000)
        )
      ]);
      onClose?.();
    } catch (error: any) {
      console.error('Connection failed:', error);
      setConnectionError(getErrorMessage(error));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose?.();
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    try {
      await Promise.race([
        switchChain({ chainId }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network switch timeout')), 15000)
        )
      ]);
      setShowNetworks(false);
    } catch (error: any) {
      console.error('Network switch failed:', error);
      setConnectionError(
        error?.code === 4902 
          ? 'Network not added to wallet. Please add it manually.' 
          : getErrorMessage(error)
      );
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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

  const getConnectorDescription = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask': return 'Popular browser extension & mobile app';
      case 'coinbase wallet': return 'Coinbase smart wallet (recommended)';
      case 'walletconnect': return 'Connect with 300+ mobile wallets';
      case 'injected': return 'Browser wallet detected';
      default: return 'Digital wallet';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5" />
              {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <p className="text-gray-300 text-sm mb-4">
                Connect your wallet to access DeFi features across all Superchain networks
              </p>

              {(error || connectionError) && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-red-400 text-sm font-medium">
                        Connection Failed
                      </p>
                      <p className="text-red-300 text-xs">
                        {connectionError || error?.message}
                      </p>
                      {connectionError && (
                        <button
                          onClick={() => setConnectionError(null)}
                          className="text-red-300 hover:text-red-200 text-xs underline"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {connectors.map((connector) => (
                  <Button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isPending || isConnecting}
                    className="w-full flex items-center justify-between p-4 h-auto bg-gray-800 hover:bg-gray-700 border border-gray-600 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getConnectorIcon(connector.name)}
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{connector.name}</span>
                        <span className="text-xs text-gray-400">
                          {getConnectorDescription(connector.name)}
                        </span>
                      </div>
                    </div>
                    {(isPending || isConnecting) && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                ))}
              </div>

              <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-xs">
                  🔒 Your wallet is never stored. Connection is handled securely by your wallet provider.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Connected Wallet Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-green-400">Connected</p>
                      <p className="text-xs text-gray-400">{connector?.name}</p>
                    </div>
                  </div>
                  <span className="text-2xl">
                    {getConnectorIcon(connector?.name || '')}
                  </span>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Wallet Address</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                    <code className="flex-1 text-sm font-mono text-white">
                      {address && formatAddress(address)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyAddress}
                      className="h-8 w-8 p-0"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Balance */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Balance</label>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-lg font-semibold text-white">
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                    </p>
                  </div>
                </div>

                {/* Network */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Network</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowNetworks(!showNetworks)}
                      className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currentNetwork.icon}</span>
                        <span className="font-medium text-white">{currentNetwork.name}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {showNetworks && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {chains.map((chain) => {
                          const config = networkConfig[chain.id as SupportedChainId];
                          if (!config) return null;
                          
                          return (
                            <button
                              key={chain.id}
                              onClick={() => handleSwitchNetwork(chain.id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="text-lg">{config.icon}</span>
                              <span className="text-white">{config.name}</span>
                              {chainId === chain.id && (
                                <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleDisconnect}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}