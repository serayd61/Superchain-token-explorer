import { NextRequest, NextResponse } from 'next/server';

// Chain configurations
const chainConfigs = {
  base: { 
    name: 'base', 
    chainId: 8453, 
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    isOpStack: true 
  },
  optimism: { 
    name: 'optimism', 
    chainId: 10, 
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    isOpStack: true 
  },
  mode: { 
    name: 'mode', 
    chainId: 34443, 
    rpcUrl: process.env.MODE_RPC_URL || 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    isOpStack: true 
  },
  zora: { 
    name: 'zora', 
    chainId: 7777777, 
    rpcUrl: process.env.ZORA_RPC_URL || 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    isOpStack: true 
  },
  fraxtal: { 
    name: 'fraxtal', 
    chainId: 252, 
    rpcUrl: process.env.FRAXTAL_RPC_URL || 'https://rpc.frax.com',
    explorerUrl: 'https://fraxscan.com',
    isOpStack: true 
  },
  world: { 
    name: 'world', 
    chainId: 480, 
    rpcUrl: process.env.WORLD_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/public',
    explorerUrl: 'https://worldscan.org',
    isOpStack: true 
  },
  lisk: { 
    name: 'lisk', 
    chainId: 1135, 
    rpcUrl: process.env.LISK_RPC_URL || 'https://rpc.api.lisk.com',
    explorerUrl: 'https://blockscout.lisk.com',
    isOpStack: true 
  },
  ethereum: { 
    name: 'ethereum', 
    chainId: 1, 
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    isOpStack: false 
  },
  arbitrum: { 
    name: 'arbitrum', 
    chainId: 42161, 
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arbitrum.publicnode.com',
    explorerUrl: 'https://arbiscan.io',
    isOpStack: false 
  },
  polygon: { 
    name: 'polygon', 
    chainId: 137, 
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com',
    isOpStack: false 
  }
};

// Mock token data for demo
const mockTokens = [
  {
    name: "ZORB",
    symbol: "ZORB",
    decimals: 18,
    totalSupply: 8800000000,
    hasLiquidity: true,
    v2: true,
    v3: false,
    price: "0.0000342"
  },
  {
    name: "SHIPX",
    symbol: "SHIPX",
    decimals: 18,
    totalSupply: 1000000000,
    hasLiquidity: true,
    v2: false,
    v3: true,
    price: "0.0000089"
  },
  {
    name: "MOON",
    symbol: "MOON",
    decimals: 18,
    totalSupply: 5000000000,
    hasLiquidity: false,
    v2: false,
    v3: false,
    price: "0"
  },
  {
    name: "PEPE2.0",
    symbol: "PEPE2",
    decimals: 18,
    totalSupply: 420690000000,
    hasLiquidity: true,
    v2: true,
    v3: true,
    price: "0.00000001"
  }
];

function generateRandomAddress() {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chain = searchParams.get('chain') || 'base';
    const blocks = parseInt(searchParams.get('blocks') || '10');
    const opStackOnly = searchParams.get('opStackOnly') === 'true';

    const chainConfig = chainConfigs[chain as keyof typeof chainConfigs];
    
    if (!chainConfig) {
      return NextResponse.json({
        success: false,
        error: 'Invalid chain specified'
      }, { status: 400 });
    }

    // For demo, generate mock data
    // TODO: Implement actual blockchain scanning using ethers.js
    const results = [];
    const numTokens = Math.min(Math.floor(Math.random() * 4) + 1, blocks);
    
    for (let i = 0; i < numTokens; i++) {
      const tokenData = mockTokens[Math.floor(Math.random() * mockTokens.length)];
      const contractAddress = generateRandomAddress();
      
      // Skip non-OP Stack chains if filter is enabled
      if (opStackOnly && !chainConfig.isOpStack) {
        continue;
      }
      
      const blockNumber = Math.floor(Math.random() * 100000) + 30900000;
      
      results.push({
        chain: chain,
        chain_id: chainConfig.chainId,
        is_op_stack: chainConfig.isOpStack,
        block: blockNumber,
        hash: generateRandomAddress() + generateRandomAddress().substring(2),
        deployer: generateRandomAddress(),
        contract_address: contractAddress,
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
          volume_24h: Math.floor(Math.random() * 100000).toString(),
          liquidity: Math.floor(Math.random() * 1000000).toString(),
          dex: tokenData.v3 ? "uniswap-v3" : "uniswap-v2"
        } : {},
        explorer_url: chainConfig.explorerUrl + '/address/' + contractAddress
      });
    }

    const lpContracts = results.filter(r => r.lp_info.status === "YES").length;

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
      error: 'Internal server error'
    }, { status: 500 });
  }
}