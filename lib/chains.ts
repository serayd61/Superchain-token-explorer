export interface ChainConfig {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerApiUrl?: string;
  apiKey?: string;
  isOpStack: boolean;
  wethAddress: string;
  uniswapV2Factory: string;
  uniswapV3Factory: string;
}

export const chainConfigs: Record<string, ChainConfig> = {
  base: {
    id: 'base',
    name: 'base',
    displayName: 'Base',
    color: 'bg-blue-500',
    icon: '🔵',
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://api.basescan.org/api',
    apiKey: process.env.BASESCAN_API_KEY || '',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    uniswapV3Factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
  },
  optimism: {
    id: 'optimism',
    name: 'optimism',
    displayName: 'OP Mainnet',
    color: 'bg-red-500',
    icon: '🔴',
    chainId: 10,
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    explorerApiUrl: 'https://api-optimistic.etherscan.io/api',
    apiKey: process.env.OPTIMISM_API_KEY || '',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x31F63A33141fFee63D4B26755430a390ACdD8a4d',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  mode: {
    id: 'mode',
    name: 'mode',
    displayName: 'Mode',
    color: 'bg-green-500',
    icon: '🟢',
    chainId: 34443,
    rpcUrl: process.env.MODE_RPC_URL || 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    explorerApiUrl: 'https://explorer.mode.network/api',
    apiKey: '',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x31F63A33141fFee63D4B26755430a390ACdD8a4d',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  zora: {
    id: 'zora',
    name: 'zora',
    displayName: 'Zora',
    color: 'bg-purple-500',
    icon: '🟣',
    chainId: 7777777,
    rpcUrl: process.env.ZORA_RPC_URL || 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    explorerApiUrl: 'https://explorer.zora.energy/api',
    apiKey: '',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x31F63A33141fFee63D4B26755430a390ACdD8a4d',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  ethereum: {
    id: 'ethereum',
    name: 'ethereum',
    displayName: 'Ethereum',
    color: 'bg-gray-700',
    icon: '⟠',
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
    isOpStack: false,
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'arbitrum',
    displayName: 'Arbitrum',
    color: 'bg-blue-600',
    icon: '🔷',
    chainId: 42161,
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    explorerApiUrl: 'https://api.arbiscan.io/api',
    apiKey: process.env.ARBISCAN_API_KEY || '',
    isOpStack: false,
    wethAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    uniswapV2Factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  polygon: {
    id: 'polygon',
    name: 'polygon',
    displayName: 'Polygon',
    color: 'bg-purple-600',
    icon: '🟣',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    apiKey: process.env.POLYGONSCAN_API_KEY || '',
    isOpStack: false,
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    uniswapV2Factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  }
};

export interface ChainOption {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  isOpStack: boolean;
}

export const CHAINS: ChainOption[] = Object.values(chainConfigs).map(({ id, name, displayName, color, icon, isOpStack }) => ({
  id,
  name,
  displayName,
  color,
  icon,
  isOpStack
}));

