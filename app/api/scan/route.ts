import { NextRequest, NextResponse } from 'next/server';
import { ethers, TransactionResponse } from 'ethers';

// Chain configurations with RPC endpoints
const chainConfigs = {
  base: {
    name: 'base',
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    uniswapV3Factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
  },
  optimism: {
    name: 'optimism',
    chainId: 10,
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x31F63A33141fFee63D4B26755430a390ACdD8a4d',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  arbitrum: {
    name: 'arbitrum',
    chainId: 42161,
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    isOpStack: false,
    wethAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    uniswapV2Factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  polygon: {
    name: 'polygon',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    isOpStack: false,
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    uniswapV2Factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  }
};

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  deployer: string;
  deploymentTx: string;
  deploymentBlock: number;
  deploymentTimestamp: number;
  chain: string;
  hasLiquidity: boolean;
  liquidityInfo?: {
    wethPaired: boolean;
    pairAddress: string;
    reserves: {
      token: string;
      weth: string;
    };
  };
}

// Simple in-memory cache
const scanCache = new Map<string, { 
  data: TokenInfo[], 
  timestamp: number,
  lastBlock: number 
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function checkLiquidity(
  tokenAddress: string, 
  provider: ethers.Provider,
  chainConfig: typeof chainConfigs[keyof typeof chainConfigs]
): Promise<{ hasLiquidity: boolean; liquidityInfo?: any }> {
  try {
    // Check Uniswap V2
    const v2Factory = new ethers.Contract(
      chainConfig.uniswapV2Factory,
      [
        'function getPair(address tokenA, address tokenB) view returns (address pair)'
      ],
      provider
    );

    const pairAddress = await v2Factory.getPair(tokenAddress, chainConfig.wethAddress);
    
    if (pairAddress !== '0x0000000000000000000000000000000000000000') {
      // Get pair reserves
      const pair = new ethers.Contract(
        pairAddress,
        [
          'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
          'function token0() view returns (address)',
          'function token1() view returns (address)'
        ],
        provider
      );

      const [reserves, token0, token1] = await Promise.all([
        pair.getReserves(),
        pair.token0(),
        pair.token1()
      ]);

      const isToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
      const tokenReserve = isToken0 ? reserves[0] : reserves[1];
      const wethReserve = isToken0 ? reserves[1] : reserves[0];

      // Check if there's meaningful liquidity (more than 0.1 ETH worth)
      const minLiquidity = ethers.parseEther('0.1');
      if (wethReserve > minLiquidity) {
        return {
          hasLiquidity: true,
          liquidityInfo: {
            wethPaired: true,
            pairAddress,
            reserves: {
              token: tokenReserve.toString(),
              weth: wethReserve.toString()
            }
          }
        };
      }
    }

    // You could add Uniswap V3 checks here as well

    return { hasLiquidity: false };
  } catch (error) {
    console.error('Error checking liquidity:', error);
    return { hasLiquidity: false };
  }
}

async function getTokenInfo(
  contractAddress: string, 
  deploymentTx: string,
  deploymentBlock: number,
  provider: ethers.Provider,
  chainConfig: typeof chainConfigs[keyof typeof chainConfigs]
): Promise<TokenInfo | null> {
  try {
    const contract = new ethers.Contract(
      contractAddress,
      [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)'
      ],
      provider
    );

    // Try to get token info
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().catch(() => 'Unknown'),
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => '0')
    ]);

    // Get deployment transaction details
    const tx = await provider.getTransaction(deploymentTx);
    if (!tx) return null;

    // Get block timestamp
    const block = await provider.getBlock(deploymentBlock);
    if (!block) return null;

    // Check liquidity
    const { hasLiquidity, liquidityInfo } = await checkLiquidity(
      contractAddress,
      provider,
      chainConfig
    );

    return {
      address: contractAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      deployer: tx.from,
      deploymentTx,
      deploymentBlock,
      deploymentTimestamp: block.timestamp,
      chain: chainConfig.name,
      hasLiquidity,
      liquidityInfo
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'base';
    const fromBlock = searchParams.get('fromBlock');
    const toBlock = searchParams.get('toBlock');
    const useCache = searchParams.get('cache') !== 'false';

    // Validate chain
    if (!chainConfigs[chain as keyof typeof chainConfigs]) {
      return NextResponse.json(
        { error: 'Invalid chain' },
        { status: 400 }
      );
    }

    const chainConfig = chainConfigs[chain as keyof typeof chainConfigs];
    const cacheKey = `${chain}-tokens`;

    // Check cache
    if (useCache) {
      const cached = scanCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json({
          tokens: cached.data,
          fromCache: true,
          lastBlock: cached.lastBlock,
          chain: chainConfig.name
        });
      }
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);

    // Get block range
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock ? parseInt(fromBlock) : latestBlock - 1000; // Last 1000 blocks by default
    const endBlock = toBlock ? parseInt(toBlock) : latestBlock;

    console.log(`Scanning ${chainConfig.name} from block ${startBlock} to ${endBlock}`);

    const tokens: TokenInfo[] = [];
    const batchSize = 100; // Process blocks in batches

    // Process blocks in batches
    for (let i = startBlock; i <= endBlock; i += batchSize) {
      const batchEnd = Math.min(i + batchSize - 1, endBlock);
      const blockPromises = [];

      for (let blockNumber = i; blockNumber <= batchEnd; blockNumber++) {
        blockPromises.push(provider.getBlock(blockNumber, true));
      }

      const blocks = await Promise.all(blockPromises);

      for (const block of blocks) {
        if (!block || !block.transactions) continue;

        // Type assertion for transactions
        const transactions = block.transactions as (string | TransactionResponse)[];
        
        for (const tx of transactions) {
          // Skip if transaction is just a hash string
          if (typeof tx === 'string') continue;
          
          // Now TypeScript knows tx is TransactionResponse
          // Skip if not a contract creation (has a 'to' address)
          if (tx.to !== null) continue;
          
          // Get transaction receipt to find contract address
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (!receipt || !receipt.contractAddress) continue;

          // Try to get token info
          const tokenInfo = await getTokenInfo(
            receipt.contractAddress,
            tx.hash,
            block.number,
            provider,
            chainConfig
          );

          if (tokenInfo) {
            tokens.push(tokenInfo);
            console.log(`Found token: ${tokenInfo.symbol} at ${tokenInfo.address}`);
          }
        }
      }
    }

    // Update cache
    scanCache.set(cacheKey, {
      data: tokens,
      timestamp: Date.now(),
      lastBlock: endBlock
    });

    return NextResponse.json({
      tokens,
      fromCache: false,
      scannedBlocks: {
        from: startBlock,
        to: endBlock,
        total: endBlock - startBlock + 1
      },
      chain: chainConfig.name
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan blockchain' },
      { status: 500 }
    );
  }
}
