import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'base';
    const blocks = parseInt(searchParams.get('blocks') || '5');

    // Mock response for testing
    const mockResponse = {
      success: true,
      chain: chain,
      blocks_scanned: blocks,
      scan_time: new Date().toISOString(),
      summary: {
        total_contracts: 3,
        lp_contracts: 1,
        success_rate: 33.3
      },
      results: [
        {
          chain: chain,
          chain_id: chain === 'base' ? 8453 : 1,
          block: 12345678,
          hash: "0x1234567890abcdef",
          deployer: "0xAbCdEf1234567890",
          contract_address: "0x9876543210fedcba",
          timestamp: new Date().toISOString(),
          metadata: {
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
            total_supply: 1000000
          },
          lp_info: {
            v2: true,
            v3: false,
            status: "YES"
          },
          dex_data: {
            price_usd: "0.001234",
            volume_24h: "50000",
            liquidity: "100000",
            dex: "uniswap-v2"
          }
        }
      ]
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'API error occurred' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}