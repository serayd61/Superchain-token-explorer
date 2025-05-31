export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const chain = url.searchParams.get('chain') || 'base';
    const blocks = parseInt(url.searchParams.get('blocks') || '5');
    const opStackOnly = url.searchParams.get('opStackOnly') === 'true';

    // Chain configurations with OP Stack info
    const chainConfigs = {
      // OP Stack Chains
      base: { 
        isOpStack: true, 
        chainId: 8453, 
        category: 'op-stack',
        explorer: 'https://basescan.org'
      },
      optimism: { 
        isOpStack: true, 
        chainId: 10, 
        category: 'op-stack',
        explorer: 'https://optimistic.etherscan.io'
      },
      mode: { 
        isOpStack: true, 
        chainId: 34443, 
        category: 'op-stack',
        explorer: 'https://explorer.mode.network'
      },
      zora: { 
        isOpStack: true, 
        chainId: 7777777, 
        category: 'op-stack',
        explorer: 'https://explorer.zora.energy'
      },
      fraxtal: { 
        isOpStack: true, 
        chainId: 252, 
        category: 'op-stack',
        explorer: 'https://fraxscan.com'
      },
      world: { 
        isOpStack: true, 
        chainId: 480, 
        category: 'op-stack',
        explorer: 'https://worldscan.org'
      },
      lisk: { 
        isOpStack: true, 
        chainId: 1135, 
        category: 'op-stack',
        explorer: 'https://blockscout.lisk.com'
      },
      // Non-OP Stack Chains
      ethereum: { 
        isOpStack: false, 
        chainId: 1, 
        category: 'ethereum',
        explorer: 'https://etherscan.io'
      },
      arbitrum: { 
        isOpStack: false, 
        chainId: 42161, 
        category: 'other',
        explorer: 'https://arbiscan.io'
      },
      polygon: { 
        isOpStack: false, 
        chainId: 137, 
        category: 'other',
        explorer: 'https://polygonscan.com'
      }
    };

    const currentChain = chainConfigs[chain as keyof typeof chainConfigs];
    
    if (!currentChain) {
      return Response.json(
        { success: false, error: `Unsupported chain: ${chain}` },
        { status: 400 }
      );
    }

    // Generate mock data based on chain type
    const generateMockToken = (index: number) => {
      const isOpStack = currentChain.isOpStack;
      const baseAddress = isOpStack ? "0x420000000000000000000000000000000000" : "0x1234567890abcdef";
      
      return {
        chain: chain,
        chain_id: currentChain.chainId,
        is_op_stack: isOpStack,
        block: 12345678 + index,
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        deployer: `0x${Math.random().toString(16).substring(2, 42)}`,
        contract_address: `${baseAddress}${index.toString().padStart(6, '0')}`,
        timestamp: new Date(Date.now() - index * 60000).toISOString(),
        metadata: {
          name: isOpStack ? `SuperToken ${index}` : `Token ${index}`,
          symbol: isOpStack ? `ST${index}` : `TK${index}`,
          decimals: 18,
          total_supply: Math.floor(Math.random() * 1000000000)
        },
        lp_info: {
          v2: Math.random() > 0.7,
          v3: Math.random() > 0.8,
          status: Math.random() > 0.6 ? "YES" : "NO"
        },
        dex_data: Math.random() > 0.6 ? {
          price_usd: (Math.random() * 10).toFixed(6),
          volume_24h: (Math.random() * 100000).toFixed(2),
          liquidity: (Math.random() * 500000).toFixed(2),
          dex: isOpStack ? "BaseSwap" : "Uniswap"
        } : {},
        explorer_url: `${currentChain.explorer}/address/${baseAddress}${index.toString().padStart(6, '0')}`
      };
    };

    // Generate results
    const results = Array.from({ length: Math.min(blocks, 10) }, (_, i) => generateMockToken(i));
    
    // Filter for OP Stack only if requested
    const filteredResults = opStackOnly ? results.filter(r => r.is_op_stack) : results;
    
    const lpCount = filteredResults.filter(r => r.lp_info.status === "YES").length;
    
    const data = {
      success: true,
      chain: chain,
      blocks_scanned: blocks,
      scan_time: new Date().toISOString(),
      chain_info: {
        is_op_stack: currentChain.isOpStack,
        category: currentChain.category,
        chain_id: currentChain.chainId
      },
      summary: {
        total_contracts: filteredResults.length,
        lp_contracts: lpCount,
        success_rate: filteredResults.length > 0 ? Number(((lpCount / filteredResults.length) * 100).toFixed(1)) : 0,
        op_stack_contracts: filteredResults.filter(r => r.is_op_stack).length
      },
      superchain_info: {
        total_op_chains: Object.values(chainConfigs).filter(c => c.isOpStack).length,
        current_chain_op_stack: currentChain.isOpStack
      },
      results: filteredResults
    };

    return Response.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}