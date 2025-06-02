import { NextRequest, NextResponse } from 'next/server';

// Chain configurations
const chainConfigs = {
  base: {
    name: 'base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org'
  },
  optimism: {
    name: 'optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io'
  },
  mode: {
    name: 'mode',
    chainId: 34443,
    rpcUrl: 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network'
  },
  zora: {
    name: 'zora',
    chainId: 7777777,
    rpcUrl: 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy'
  },
  ethereum: {
    name: 'ethereum',
    chainId: 1,
    rpcUrl: 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io'
  },
  arbitrum: {
    name: 'arbitrum',
    chainId: 42161,
    rpcUrl: 'https://arbitrum.publicnode.com',
    explorerUrl: 'https://arbiscan.io'
  },
  polygon: {
    name: 'polygon',
    chainId: 137,
    rpcUrl: 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com'
  }
};

// Mock token data with real blockchain-style addresses
const mockTokens = [
  {
    name: "ZORB",
    symbol: "ZORB",
    decimals: 18,
    totalSupply: 8800000000,
    hasLiquidity: true,
    v2: true,
    v3: false,
    price: "0.0000342",
    volume24h: "125000",
    liquidity: "2500000"
  },
  {
    name: "🚢SHIPX",
    symbol: "🚢SHIPX",
    decimals: 18,
    totalSupply: 1000000000,
    hasLiquidity: true,
    v2: false,
    v3: true,
    price: "0.0000089",
    volume24h: "45000",
    liquidity: "890000"
  },
  {
    name: "BaseFlow",
    symbol: "FLOW",
    decimals: 18,
    totalSupply: 5000000000,
    hasLiquidity: false,
    v2: false,
    v3: false,
    price: "0",
    volume24h: "0",
    liquidity: "0"
  },
  {
    name: "OptiCat",
    symbol: "OCAT",
    decimals: 18,
    totalSupply: 777000000,
    hasLiquidity: true,
    v2: true,
    v3: true,
    price: "0.0000567",
    volume24h: "89000",
    liquidity: "1200000"
  },
  {
    name: "ZoraArt",
    symbol: "ZART",
    decimals: 18,
    totalSupply: 100000000,
    hasLiquidity: true,
    v2: true,
    v3: false,
    price: "0.000234",
    volume24h: "34000",
    liquidity: "567000"
  }
];

function generateRandomAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

function generateRandomHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'base';
    const blocks = parseInt(searchParams.get('blocks') || '10');
    const opStackOnly = searchParams.get('opStackOnly') === 'true';

    // Validate chain
    if (!chainConfigs[chain as keyof typeof chainConfigs]) {
      return NextResponse.json(
        { success: false, error: 'Invalid chain' },
        { status: 400 }
      );
    }

    const chainConfig = chainConfigs[chain as keyof typeof chainConfigs];
    const isOpStack = ['base', 'optimism', 'mode', 'zora', 'fraxtal', 'world', 'lisk'].includes(chain);

    // If filtering for OP Stack only and current chain is not OP Stack, return empty
    if (opStackOnly && !isOpStack) {
      return NextResponse.json({
        success: true,
        chain: chain,
        blocks_scanned: 0,
        scan_time: new Date().toISOString(),
        note: "Chain is not part of OP Stack",
        summary: {
          total_contracts: 0,
          lp_contracts: 0,
          success_rate: 0
        },
        results: []
      });
    }

    // Generate mock results
    const numTokens = Math.floor(Math.random() * 3) + 1;
    const results = [];
    
    const currentBlock = 12000000 + Math.floor(Math.random() * 1000000);
    
    for (let i = 0; i < numTokens; i++) {
      const tokenData = mockTokens[Math.floor(Math.random() * mockTokens.length)];
      const blockNumber = currentBlock - Math.floor(Math.random() * blocks);
      
      results.push({
        chain: chain,
        chain_id: chainConfig.chainId,
        is_op_stack: isOpStack,
        block: blockNumber,
        hash: generateRandomHash(),
        deployer: generateRandomAddress(),
        contract_address: generateRandomAddress(),
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        metadata: {
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          total_supply: tokenData.totalSupply
        },
        lp_info: {
          v2: tokenData.v2,
          v3: tokenData.v3,
          status: tokenData.hasLiquidity ? "YES" : "NO"
        },
        dex_data: tokenData.hasLiquidity ? {
          price_usd: tokenData.price,
          volume_24h: tokenData.volume24h,
          liquidity: tokenData.liquidity,
          pair_address: generateRandomAddress(),
          dex: tokenData.v3 ? "uniswap-v3" : "uniswap-v2"
        } : {},
        explorer_url: `${chainConfig.explorerUrl}/address/${generateRandomAddress()}`
      });
    }

    const lpContracts = results.filter(r => r.lp_info.status === "YES").length;

    const response = {
      success: true,
      chain: chain,
      blocks_scanned: blocks,
      scan_time: new Date().toISOString(),
      note: "Mock data for demonstration",
      summary: {
        total_contracts: results.length,
        lp_contracts: lpContracts,
        success_rate: results.length > 0 ? (lpContracts / results.length * 100) : 0
      },
      results: results
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}