import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { saveTokenDeployment, saveScanHistory } from '@/lib/database';

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
  mode: {
    name: 'mode',
    chainId: 34443,
    rpcUrl: process.env.MODE_RPC_URL || 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x31F63A33141fFee63D4B26755430a390ACdD8a4d',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  zora: {
    name: 'zora',
    chainId: 7777777,
    rpcUrl: process.env.ZORA_RPC_URL || 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
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
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    uniswapV2Factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  ethereum: {
    name: 'ethereum',
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    isOpStack: false,
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  }
};

interface TokenContract {
  chain: string;
  chain_id: number;
  is_op_stack: boolean;
  block: number;
  hash: string;
  deployer: string;
  contract_address: string;
  timestamp: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: number;
  };
  lp_info: {
    v2: boolean;
    v3: boolean;
    status: string;
  };
  dex_data?: {
    price_usd: string;
    volume_24h: string;
    liquidity: string;
    dex: string;
  };
  explorer_url: string;
}

// Simple in-memory cache
const scanCache = new Map<string, { 
  data: TokenContract[], 
  timestamp: number,
  lastBlock: number 
}>();

const CACHE_DURATION = 60 * 1000; // 1 minute

async function checkLiquidity(
  tokenAddress: string, 
  provider: ethers.Provider,
  chainConfig: typeof chainConfigs[keyof typeof chainConfigs]
): Promise<{ v2: boolean; v3: boolean; status: string }> {
  try {
    let v2Exists = false;
    let v3Exists = false;

    // Check Uniswap V2
    try {
      const v2Factory = new ethers.Contract(
        chainConfig.uniswapV2Factory,
        ['function getPair(address tokenA, address tokenB) view returns (address pair)'],
        provider
      );

      const pairAddress = await v2Factory.getPair(tokenAddress, chainConfig.wethAddress);
      v2Exists = pairAddress !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('V2 check error:', error);
    }

    // Check Uniswap V3
    try {
      const v3Factory = new ethers.Contract(
        chainConfig.uniswapV3Factory,
        ['function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)'],
        provider
      );

      // Check common fee tiers: 0.05%, 0.3%, 1%
      const feeTiers = [500, 3000, 10000];
      for (const fee of feeTiers) {
        const poolAddress = await v3Factory.getPool(tokenAddress, chainConfig.wethAddress, fee);
        if (poolAddress !== '0x0000000000000000000000000000000000000000') {
          v3Exists = true;
          break;
        }
      }
    } catch (error) {
      console.error('V3 check error:', error);
    }

    return {
      v2: v2Exists,
      v3: v3Exists,
      status: (v2Exists || v3Exists) ? 'YES' : 'NO'
    };
  } catch (error) {
    console.error('Error checking liquidity:', error);
    return { v2: false, v3: false, status: 'ERROR' };
  }
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: number;
}

async function getTokenMetadata(
  contractAddress: string,
  provider: ethers.Provider
): Promise<TokenMetadata> {
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

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().catch(() => 'Unknown'),
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => '0')
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      total_supply: Number(ethers.formatUnits(totalSupply, decimals))
    };
  } catch (error) {
    console.error('Error getting token metadata:', error);
    return {
      name: 'Unknown',
      symbol: 'UNKNOWN',
      decimals: 18,
      total_supply: 0
    };
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'base';
    const blocks = parseInt(searchParams.get('blocks') || '10');
    const opStackOnly = searchParams.get('opStackOnly') === 'true';

    // Validate chain
    if (!chainConfigs[chain as keyof typeof chainConfigs]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid chain selected'
      }, { status: 400 });
    }

    const chainConfig = chainConfigs[chain as keyof typeof chainConfigs];
    
    // Skip non-OP Stack chains if filter is enabled
    if (opStackOnly && !chainConfig.isOpStack) {
      const result = {
        success: true,
        chain: chainConfig.name,
        blocks_scanned: 0,
        results: [],
        summary: {
          total_contracts: 0,
          lp_contracts: 0,
          success_rate: 0
        }
      };

      // Save empty scan history
      await saveScanHistory({
        chain: chainConfig.name,
        blocks_scanned: 0,
        total_contracts: 0,
        lp_contracts: 0,
        success_rate: 0,
        scan_time: new Date().toISOString()
      });

      return NextResponse.json(result);
    }

    // Check cache first
    const cacheKey = `${chain}-${blocks}`;
    const cached = scanCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        chain: chainConfig.name,
        blocks_scanned: blocks,
        results: cached.data,
        summary: {
          total_contracts: cached.data.length,
          lp_contracts: cached.data.filter(t => t.lp_info.status === 'YES').length,
          success_rate: cached.data.length > 0 
            ? (cached.data.filter(t => t.lp_info.status === 'YES').length / cached.data.length) * 100 
            : 0
        },
        from_cache: true
      });
    }

    // Initialize provider with connection check
    let provider: ethers.JsonRpcProvider;
    let latestBlock: number;
    
    try {
      provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      
      // Test connection with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('RPC connection timeout')), 5000)
      );
      
      latestBlock = await Promise.race([
        provider.getBlockNumber(),
        timeoutPromise
      ]) as number;
      
      console.log(`Connected to ${chainConfig.name}, latest block: ${latestBlock}`);
    } catch (error) {
      console.error(`Failed to connect to ${chainConfig.name} RPC:`, error);
      const errorMsg = `Failed to connect to ${chainConfig.name} RPC. Please check your RPC URL.`;
      
      // Save error to scan history
      await saveScanHistory({
        chain: chainConfig.name,
        blocks_scanned: 0,
        total_contracts: 0,
        lp_contracts: 0,
        success_rate: 0,
        scan_time: new Date().toISOString(),
        error_message: errorMsg
      });

      return NextResponse.json({
        success: false,
        error: errorMsg,
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 503 });
    }

    // Scan blocks
    const startBlock = latestBlock - blocks + 1;
    const results: TokenContract[] = [];

    console.log(`Scanning ${chainConfig.name} from block ${startBlock} to ${latestBlock}`);

    for (let blockNumber = startBlock; blockNumber <= latestBlock; blockNumber++) {
      try {
        const block = await provider.getBlock(blockNumber, true);
        if (!block || !block.transactions) continue;

        const transactions = block.transactions as string[];
        
        for (const txHash of transactions) {
          if (typeof txHash !== 'string') continue;
          
          const tx = await provider.getTransaction(txHash);
          if (!tx || tx.to !== null) continue;
          
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (!receipt || !receipt.contractAddress) continue;

          // Get token metadata
          const metadata = await getTokenMetadata(receipt.contractAddress, provider);
          
          // Skip if not a token (no name or symbol)
          if (metadata.name === 'Unknown' && metadata.symbol === 'UNKNOWN') continue;

          // Check liquidity
          const lpInfo = await checkLiquidity(receipt.contractAddress, provider, chainConfig);

          const result: TokenContract = {
            chain: chainConfig.name,
            chain_id: chainConfig.chainId,
            is_op_stack: chainConfig.isOpStack,
            block: blockNumber,
            hash: tx.hash,
            deployer: tx.from,
            contract_address: receipt.contractAddress,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            metadata,
            lp_info: lpInfo,
            explorer_url: `${chainConfig.explorerUrl}/address/${receipt.contractAddress}`
          };

          results.push(result);
          
          // Save to database
          try {
            await saveTokenDeployment(result);
            console.log(`✅ Saved to DB: ${metadata.symbol} at ${receipt.contractAddress}`);
          } catch (dbError) {
            console.error('Database save error:', dbError);
          }

          console.log(`Found token: ${metadata.symbol} at ${receipt.contractAddress}`);
        }
      } catch (error) {
        console.error(`Error processing block ${blockNumber}:`, error);
      }
    }

    // Update cache
    scanCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
      lastBlock: latestBlock
    });

    // Calculate summary
    const lpContracts = results.filter(t => t.lp_info.status === 'YES').length;
    const successRate = results.length > 0 ? (lpContracts / results.length) * 100 : 0;

    // Save scan history
    try {
      await saveScanHistory({
        chain: chainConfig.name,
        blocks_scanned: blocks,
        total_contracts: results.length,
        lp_contracts: lpContracts,
        success_rate: successRate,
        scan_time: new Date().toISOString(),
        scan_duration_ms: Date.now() - startTime
      });
      console.log(`📊 Saved scan history for ${chainConfig.name}`);
    } catch (dbError) {
      console.error('Error saving scan history:', dbError);
    }

    // Return results
    return NextResponse.json({
      success: true,
      chain: chainConfig.name,
      blocks_scanned: blocks,
      scan_time: new Date().toISOString(),
      results,
      summary: {
        total_contracts: results.length,
        lp_contracts: lpContracts,
        success_rate: successRate
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Save error to scan history
    try {
      await saveScanHistory({
        chain: 'unknown',
        blocks_scanned: 0,
        total_contracts: 0,
        lp_contracts: 0,
        success_rate: 0,
        scan_time: new Date().toISOString(),
        error_message: errorMsg
      });
    } catch (dbError) {
      console.error('Error saving error to scan history:', dbError);
    }

    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 });
  }
}
