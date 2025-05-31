'use client';

import { useState } from 'react';

export interface Chain {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  isOpStack: boolean;
  category: 'op-stack' | 'ethereum' | 'other';
}

const SUPPORTED_CHAINS: Chain[] = [
  // OP Stack Chains (Superchain)
  {
    id: 'base',
    name: 'base',
    displayName: 'Base',
    color: 'bg-blue-500',
    icon: '🔵',
    isOpStack: true,
    category: 'op-stack'
  },
  {
    id: 'optimism',
    name: 'optimism',
    displayName: 'OP Mainnet',
    color: 'bg-red-500',
    icon: '🔴',
    isOpStack: true,
    category: 'op-stack'
  },
  {
    id: 'mode',
    name: 'mode',
    displayName: 'Mode',
    color: 'bg-green-500',
    icon: '🟢',
    isOpStack: true,
    category: 'op-stack'
  },
  {
    id: 'zora',
    name: 'zora',
    displayName: 'Zora',
    color: 'bg-purple-500',
    icon: '🟣',
    isOpStack: true,
    category: 'op-stack'
  },
  {
    id: 'fraxtal',
    name: 'fraxtal',
    displayName: 'Fraxtal',
    color: 'bg-orange-500',
    icon: '🟠',
    isOpStack: true,
    category: 'op-stack'
  },
  {
    id: 'world',
    name: 'world',
    displayName: 'World Chain',
    color: 'bg-cyan-500',
    icon: '🌍',
    isOpStack: true,
    category: 'op-stack'
  },
  {
    id: 'lisk',
    name: 'lisk',
    displayName: 'Lisk',
    color: 'bg-indigo-500',
    icon: '🔷',
    isOpStack: true,
    category: 'op-stack'
  },
  // Non-OP Stack Chains
  {
    id: 'ethereum',
    name: 'ethereum', 
    displayName: 'Ethereum',
    color: 'bg-gray-700',
    icon: '⟠',
    isOpStack: false,
    category: 'ethereum'
  },
  {
    id: 'arbitrum',
    name: 'arbitrum',
    displayName: 'Arbitrum',
    color: 'bg-blue-600',
    icon: '🔷',
    isOpStack: false,
    category: 'other'
  },
  {
    id: 'polygon',
    name: 'polygon',
    displayName: 'Polygon',
    color: 'bg-purple-600',
    icon: '🟣',
    isOpStack: false,
    category: 'other'
  }
];

interface ChainSelectorProps {
  selectedChain: string;
  onChainChange: (chain: string) => void;
  isLoading?: boolean;
}

export default function ChainSelector({ selectedChain, onChainChange, isLoading }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedChainData = SUPPORTED_CHAINS.find(chain => chain.id === selectedChain);

  // Group chains by category
  const opStackChains = SUPPORTED_CHAINS.filter(chain => chain.category === 'op-stack');
  const otherChains = SUPPORTED_CHAINS.filter(chain => chain.category !== 'op-stack');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-colors duration-200
        `}
      >
        <span className="text-xl">{selectedChainData?.icon}</span>
        <div className="flex flex-col items-start">
          <span className="font-medium">{selectedChainData?.displayName}</span>
          {selectedChainData?.isOpStack && (
            <span className="text-xs text-green-600 font-medium">OP Stack</span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* OP Stack Section */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Superchain (OP Stack)</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {opStackChains.length} chains
              </span>
            </div>
            {opStackChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onChainChange(chain.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md
                  ${selectedChain === chain.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700'}
                  transition-colors duration-150
                `}
              >
                <span className="text-lg">{chain.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{chain.displayName}</div>
                  <div className="text-xs text-green-600">OP Stack</div>
                </div>
                {selectedChain === chain.id && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Other Chains Section */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Other Chains</span>
            </div>
            {otherChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onChainChange(chain.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md
                  ${selectedChain === chain.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700'}
                  transition-colors duration-150
                `}
              >
                <span className="text-lg">{chain.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{chain.displayName}</div>
                  <div className="text-xs text-gray-500 capitalize">{chain.category}</div>
                </div>
                {selectedChain === chain.id && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 p-2">
            <div className="text-xs text-gray-500 px-2 py-1">
              🟢 {opStackChains.length} OP Stack chains supported
            </div>
          </div>
        </div>
      )}
    </div>
  );
}