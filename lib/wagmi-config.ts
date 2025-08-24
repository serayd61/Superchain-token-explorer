import { createConfig, http } from 'wagmi'
import { base, optimism, arbitrum, mainnet, mode, polygon } from 'wagmi/chains'
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'

// Define custom chains for newer L2s
export const inkChain = {
  id: 57073,
  name: 'Ink',
  network: 'ink-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc-gel.inkonchain.com'] },
    default: { http: ['https://rpc-gel.inkonchain.com'] },
  },
  blockExplorers: {
    default: { name: 'Ink Explorer', url: 'https://explorer.inkonchain.com' },
  },
} as const

export const unichain = {
  id: 1301,
  name: 'Unichain Sepolia',
  network: 'unichain-sepolia', 
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.unichain.org'] },
    default: { http: ['https://sepolia.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Unichain Explorer', url: 'https://sepolia.unichain.org' },
  },
} as const


// WalletConnect project ID - you should get this from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    base,
    optimism,
    mode,
    arbitrum,
    polygon,
    inkChain,
    unichain,
  ] as const,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Superchain L2 Explorer',
        url: 'https://www.superchain-token-explorer.xyz',
        iconUrl: 'https://www.superchain-token-explorer.xyz/favicon.ico',
      },
      preferDesktop: false,
    }),
    coinbaseWallet({
      appName: 'Superchain L2 Explorer',
      appLogoUrl: 'https://www.superchain-token-explorer.xyz/favicon.ico',
      preference: 'smartWalletOnly',
      version: '4',
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Superchain L2 Explorer',
        description: 'Professional-grade Superchain ecosystem explorer with AI-powered analytics',
        url: 'https://www.superchain-token-explorer.xyz',
        icons: ['https://www.superchain-token-explorer.xyz/favicon.ico'],
      },
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '1000',
          '--wcm-accent-color': '#0052ff',
          '--wcm-background-color': '#1f2937',
        },
      },
      showQrModal: true,
    }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http('https://ethereum.publicnode.com'),
    [base.id]: http('https://mainnet.base.org'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [mode.id]: http('https://mainnet.mode.network'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [polygon.id]: http('https://polygon.llamarpc.com'),
    [inkChain.id]: http('https://rpc-gel.inkonchain.com'),
    [unichain.id]: http('https://sepolia.unichain.org'),
  },
})

// Network display names and colors
export const networkConfig = {
  [mainnet.id]: { name: 'Ethereum', color: '#627eea', icon: '⟠' },
  [base.id]: { name: 'Base', color: '#0052ff', icon: '🔵' },
  [optimism.id]: { name: 'Optimism', color: '#ff0420', icon: '🔴' },
  [mode.id]: { name: 'Mode', color: '#00d395', icon: '🟢' },
  [arbitrum.id]: { name: 'Arbitrum', color: '#28a0f0', icon: '🔷' },
  [polygon.id]: { name: 'Polygon', color: '#8247e5', icon: '🟣' },
  [inkChain.id]: { name: 'Ink', color: '#8b5cf6', icon: '🔥' },
  [unichain.id]: { name: 'Unichain Sepolia', color: '#ff007a', icon: '🦄' },
} as const

export type SupportedChainId = keyof typeof networkConfig