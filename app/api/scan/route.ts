import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

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
    uniswapV2Factory: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  mode: { 
    name: 'mode', 
    chainId: 34443, 
    rpcUrl: process.env.MODE_RPC_URL || 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x31832f2a97Fd20664D76Cc421207669b55CE4BC0',
    uniswapV3Factory: '0x38015D05f4fEC8AFe15D7cc0386a126574e8077B'
  },
  zora: { 
    name: 'zora', 
    chainId: 7777777, 
    rpcUrl: process.env.ZORA_RPC_URL || 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    isOpStack: true,
    wethAddress: '0x4200000000000000000000000000000000000006',
    uniswapV2Factory: '0x0000000000000000000000000000000000000000', // Update with actual address
    uniswapV3Factory: '0x0000000000000000000000000000000000000000'  // Update with actual address
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
  },
  arbitrum: { 
    name: 'arbitrum', 
    chainId: 42161, 
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arbitrum.publicnode.com',
    explorerUrl: 'https://arbiscan.io',
    isOpStack: false,
    wethAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    uniswapV2Factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  polygon: { 
    name: 'polygon', 
    chainId: 137, 
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com',
    isOpStack: false,
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    uniswapV2Factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  }
};

// ERC20 ABI for token detection
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)'
];

// Uniswap Factory ABIs
const UNISWAP_V2_FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address)'
];

const UNISWAP_V3_FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)'
];

// V3 fee tiers
const V3_FEE_TIERS = [500, 3000, 10000]; // 0.05%, 0.3%, 1%

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
    v2_pair?: string;
    v3_pools?: Array<{ pool: string; fee: number }>;
  };
  dex_data?: {
    price_usd?: string;
    volume_24h?: string;
    liquidity?: string;
    dex?: string;
  };
  explorer_url: string;
}

async function checkIfToken(provider: ethers.JsonRpcProvider, contractAddress: string) {
  try {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    
    // Try to call ERC20 functions
    const [name, symbol, decimals, totalSupply] = await Promise.allSettled([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    // If at least symbol and decimals work, it's likely a token
    if (symbol.status === 'fulfilled' && decimals.status === 'fulfilled') {
      return {
        isToken: true,
        metadata: {
          name: name.status === 'fulfilled' ? name.value : 'Unknown',
          symbol: symbol.status === 'fulfilled' ? symbol.value : 'UNKNOWN',
          decimals: decimals.status === 'fulfilled' ? Number(decimals.value) : 18,
          total_supply: totalSupply.status === 'fulfilled' 
            ? Number(ethers.formatUnits(totalSupply.value, decimals.status === 'fulfilled' ? Number(decimals.value) : 18))
            : 0
        }
      };
    }
  } catch (error) {
    console.error('Token check error:', error);
  }

  return { isToken: false, metadata: null };
}

async function checkLiquidity(provider: ethers.JsonRpcProvider, tokenAddress: string, chainConfig: any) {
  const result = {
    v2: false,
    v3: false,
    status: 'NO' as string,
    v2_pair: undefined as string | undefined,
    v3_pools: [] as Array<{ pool: string; fee: number }>
  };

  try {
    // Check Uniswap V2
    if (chainConfig.uniswapV2Factory !== '0x0000000000000000000000000000000000000000') {
      const v2Factory = new ethers.Contract(
        chainConfig.uniswapV2Factory,
        UNISWAP_V2_FACTORY_ABI,
        provider
      );

      const v2Pair = await v2Factory.getPair(tokenAddress, chainConfig.wethAddress);
      if (v2Pair !== ethers.ZeroAddress) {
        result.v2 = true;
        result.v2_pair = v2Pair;
      }
    }

    // Check Uniswap V3
    if (chainConfig.uniswapV3Factory !== '0x0000000000000000000000000000000000000000') {
      const v3Factory = new ethers.Contract(
        chainConfig.uniswapV3Factory,
        UNISWAP_V3_FACTORY_ABI,
        provider
      );

      for (const fee of V3_FEE_TIERS) {
        try {
          const pool = await v3Factory.getPool(tokenAddress, chainConfig.wethAddress, fee);
          if (pool !== ethers.ZeroAddress) {
            result.v3 = true;
            result.v3_pools.push({ pool, fee });
          }
        } catch (error) {
          // Pool doesn't exist for this fee tier
        }
      }
    }

    result.status = (result.v2 || result.v3) ? 'YES' : 'NO';
  } catch (error) {
    console.error('Liquidity check error:', error);
    result.status = 'ERROR';
  }

  return result;
}

async function fetchDexScreenerData(tokenAddress: string, chain: string) {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    // Find pair for the specific chain
    const pair = data.pairs.find((p: any) => 
      p.chainId === chainConfigs[chain as keyof typeof chainConfigs].chainId.toString()
    ) || data.pairs[0];

    return {
      price_usd: pair.priceUsd || '0',
      volume_24h: pair.volume?.h24 || '0',
      liquidity: pair.liquidity?.usd || '0',
      dex: pair.dexId || 'unknown'
    };
  } catch (error) {
    console.error('DexScreener API error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chain = searchParams.get('chain') || 'base';
    const blocks = Math.min(parseInt(searchParams.get('blocks') || '10'), 100);
    const opStackOnly = searchParams.get('opStackOnly') === 'true';

    const chainConfig = chainConfigs[chain as keyof typeof chainConfigs];
    
    if (!chainConfig) {
      return NextResponse.json({
        success: false,
        error: 'Invalid chain specified'
      }, { status: 400 });
    }

    // Skip non-OP Stack chains if filter is enabled
    if (opStackOnly && !chainConfig.isOpStack) {
      return NextResponse.json({
        success: true,
        chain: chain,
        blocks_scanned: 0,
        results: [],
        summary: {
          total_contracts: 0,
          lp_contracts: 0,
          success_rate: 0,
          op_stack_contracts: 0
        }
      });
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    
    // Get latest block
    const latestBlock = await provider.getBlockNumber();
    const startBlock = latestBlock - blocks + 1;
    
    console.log(`Scanning ${chain} from block ${startBlock} to ${latestBlock}`);
    
    const results: TokenContract[] = [];
    
    // Scan blocks
    for (let blockNum = startBlock; blockNum <= latestBlock; blockNum++) {
      try {
        const block = await provider.getBlock(blockNum, true);
        if (!block || !block.transactions) continue;
        
        // Check each transaction
        for (const tx of block.transactions) {
          // Skip if not a contract creation
          if (typeof tx === 'string' || tx.to !== null) continue;
          
          // Get transaction receipt to find contract address
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (!receipt || !receipt.contractAddress) continue;
          
          // Check if it's a token
          const tokenCheck = await checkIfToken(provider, receipt.contractAddress);
          if (!tokenCheck.isToken) continue;
          
          // Check liquidity
          const lpInfo = await checkLiquidity(provider, receipt.contractAddress, chainConfig);
          
          // Fetch DEX data if LP exists
          let dexData = {};
          if (lpInfo.status === 'YES') {
            const dexInfo = await fetchDexScreenerData(receipt.contractAddress, chain);
            if (dexInfo) dexData = dexInfo;
          }
          
          // Build result
          const result: TokenContract = {
            chain: chain,
            chain_id: chainConfig.chainId,
            is_op_stack: chainConfig.isOpStack,
            block: blockNum,
            hash: tx.hash,
            deployer: tx.from,
            contract_address: receipt.contractAddress,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            metadata: tokenCheck.metadata!,
            lp_info: lpInfo,
            dex_data: dexData,
            explorer_url: `${chainConfig.explorerUrl}/address/${receipt.contractAddress}`
          };
          
          results.push(result);
          console.log(`Found token: ${tokenCheck.metadata!.symbol} at ${receipt.contractAddress}`);
        }
      } catch (error) {
        console.error(`Error scanning block ${blockNum}:`, error);
      }
    }
    
    const lpContracts = results.filter(r => r.lp_info.status === 'YES').length;

    return NextResponse.json({
      success: true,
      chain: chain,
      blocks_scanned: blocks,
      scan_time: new Date().toISOString(),
      chain_info: {
        is_op_stack: chainConfig.isOpStack,
        category: chainConfig.isOpStack ? 'op-stack' : 'other',
        chain_id: chainConfig.chainId
      },
      superchain_info: {
        total_op_chains: Object.values(chainConfigs).filter(c => c.isOpStack).length,
        current_chain_op_stack: chainConfig.isOpStack
      },
      summary: {
        total_contracts: results.length,
        lp_contracts: lpContracts,
        success_rate: results.length > 0 ? (lpContracts / results.length * 100) : 0,
        op_stack_contracts: results.filter(r => r.is_op_stack).length
      },
      results: results
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
