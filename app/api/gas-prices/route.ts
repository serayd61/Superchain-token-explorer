// app/api/gas-prices/route.ts
import { NextResponse } from 'next/server';

// Cache duration in seconds
const CACHE_DURATION = 60; // 1 minute

// Cache storage
let gasDataCache: any = null;
let lastFetchTime = 0;

export async function GET() {
  try {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (gasDataCache && (now - lastFetchTime) < (CACHE_DURATION * 1000)) {
      return NextResponse.json(gasDataCache);
    }

    // Fetch gas data from n8n webhook
    const n8nWebhookUrl = 'https://serkan61.app.n8n.cloud/webhook/gas-tracker-en';
    
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Set a timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update cache
        gasDataCache = data;
        lastFetchTime = now;
        
        return NextResponse.json(data);
      }
    } catch (webhookError) {
      console.error('n8n webhook error:', webhookError);
    }

    // Fallback: Fetch directly from gas APIs
    const gasData = await fetchDirectGasData();
    
    // Update cache
    gasDataCache = gasData;
    lastFetchTime = now;
    
    return NextResponse.json(gasData);

  } catch (error) {
    console.error('Error fetching gas prices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch gas prices',
        chains: {
          ethereum: { status: 'error', message: 'Unable to fetch data' },
          polygon: { status: 'error', message: 'Unable to fetch data' },
          base: { status: 'error', message: 'Unable to fetch data' },
          optimism: { status: 'error', message: 'Unable to fetch data' },
          arbitrum: { status: 'error', message: 'Unable to fetch data' }
        }
      },
      { status: 500 }
    );
  }
}

async function fetchDirectGasData() {
  const results: any = {
    success: true,
    timestamp: new Date().toISOString(),
    chains: {},
    recommendations: ''
  };

  // Fetch Ethereum gas prices
  try {
    const ethResponse = await fetch('https://api.ethgasstation.info/api/ethgasAPI.json');
    if (ethResponse.ok) {
      const ethData = await ethResponse.json();
      results.chains.ethereum = {
        fast: (ethData.fast / 10).toFixed(2) + ' Gwei',
        average: (ethData.average / 10).toFixed(2) + ' Gwei',
        slow: (ethData.safeLow / 10).toFixed(2) + ' Gwei',
        status: 'active'
      };
    }
  } catch (error) {
    results.chains.ethereum = { status: 'error', message: 'Failed to fetch' };
  }

  // Fetch Polygon gas prices
  try {
    const polyResponse = await fetch('https://gasstation.polygon.technology/v2');
    if (polyResponse.ok) {
      const polyData = await polyResponse.json();
      results.chains.polygon = {
        fast: polyData.fast?.maxFee?.toFixed(2) + ' Gwei' || 'N/A',
        average: polyData.standard?.maxFee?.toFixed(2) + ' Gwei' || 'N/A',
        slow: polyData.safeLow?.maxFee?.toFixed(2) + ' Gwei' || 'N/A',
        status: 'active'
      };
    }
  } catch (error) {
    results.chains.polygon = { status: 'error', message: 'Failed to fetch' };
  }

  // Mock data for other chains (you can add real APIs here)
  results.chains.base = {
    average: '0.001 Gwei',
    status: 'active',
    note: 'L2 - Ultra Low Fees'
  };
  
  results.chains.optimism = {
    average: '0.005 Gwei',
    status: 'active',
    note: 'L2 - Low Fees'
  };
  
  results.chains.arbitrum = {
    average: '0.01 Gwei',
    status: 'active',
    note: 'L2 - Low Fees'
  };

  // Generate recommendations
  const lowestChain = Object.keys(results.chains).reduce((lowest, chain) => {
    const current = results.chains[chain];
    const lowestData = results.chains[lowest];
    
    if (current.status !== 'active') return lowest;
    if (lowestData.status !== 'active') return chain;
    
    const currentPrice = parseFloat(current.average || '999');
    const lowestPrice = parseFloat(lowestData.average || '999');
    
    return currentPrice < lowestPrice ? chain : lowest;
  }, 'base');

  results.recommendations = `🎯 Best Choice: ${lowestChain.charAt(0).toUpperCase() + lowestChain.slice(1)}`;

  return results;
}
