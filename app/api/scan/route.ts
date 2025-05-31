export async function GET(request: Request) {
  const url = new URL(request.url);
  const chain = url.searchParams.get('chain') || 'base';
  const blocks = parseInt(url.searchParams.get('blocks') || '5');

  const response = {
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
        chain_id: 8453,
        block: 12345678,
        hash: "0x1234567890abcdef",
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
        }
      }
    ]
  };

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}