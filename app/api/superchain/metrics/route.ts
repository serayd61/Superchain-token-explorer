import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET(request: NextRequest) {
  try {
    const chains = {
      base: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      optimism: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      mode: process.env.MODE_RPC_URL || 'https://mainnet.mode.network',
      zora: process.env.ZORA_RPC_URL || 'https://rpc.zora.energy',
    };
    
    const metrics = await Promise.all(
      Object.entries(chains).map(async ([chainName, rpcUrl]) => {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const blockNumber = await provider.getBlockNumber();
        
        return {
          chain: chainName,
          blockNumber,
          isOpStack: true,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Superchain metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
