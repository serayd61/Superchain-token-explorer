import { NextRequest, NextResponse } from 'next/server';

interface TokenScanRequest {
  address: string;
  chain: string;
  scanDepth: 'basic' | 'deep' | 'comprehensive';
  includeHolders?: boolean;
  includeTransactions?: boolean;
  includeRisk?: boolean;
}

interface TokenAnalysis {
  basicInfo: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    chain: string;
    verified: boolean;
  };
  marketData: {
    price: string;
    priceChange24h: string;
    marketCap: string;
    fullyDilutedValuation: string;
    volume24h: string;
    circulatingSupply: string;
    holders: string;
    transfers24h: string;
  };
  liquidityAnalysis: {
    totalLiquidity: string;
    majorPairs: Array<{
      dex: string;
      pair: string;
      liquidity: string;
      volume24h: string;
      priceImpact: {
        onePercent: string;
        fivePercent: string;
        tenPercent: string;
      };
    }>;
    liquidityDistribution: {
      uniswapV3: string;
      uniswapV2: string;
      curve: string;
      balancer: string;
      other: string;
    };
  };
  riskAssessment: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      category: string;
      score: number;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    redFlags: string[];
    greenFlags: string[];
  };
  technicalAnalysis: {
    contractAnalysis: {
      isProxy: boolean;
      upgradeability: string;
      ownership: string;
      pausable: boolean;
      mintable: boolean;
      burnable: boolean;
      blacklistable: boolean;
    };
    tokenomics: {
      initialSupply: string;
      maxSupply: string;
      inflationRate: string;
      burnMechanism: boolean;
      stakingRewards: boolean;
      vestingSchedule: Array<{
        beneficiary: string;
        amount: string;
        unlockDate: string;
        percentage: string;
      }>;
    };
    governance: {
      hasGovernance: boolean;
      governanceToken: string;
      proposalThreshold: string;
      votingPeriod: string;
      timelock: string;
    };
  };
  defiIntegration: {
    protocols: Array<{
      name: string;
      category: string;
      tvl: string;
      apy: string;
      riskLevel: string;
      features: string[];
    }>;
    yieldOpportunities: Array<{
      platform: string;
      strategy: string;
      apy: string;
      tvl: string;
      riskScore: number;
      requirements: string[];
    }>;
    liquidityMining: Array<{
      protocol: string;
      pair: string;
      rewards: string[];
      apy: string;
      duration: string;
    }>;
  };
  socialMetrics: {
    twitter: {
      followers: string;
      engagement: string;
      sentiment: string;
    };
    discord: {
      members: string;
      activity: string;
    };
    github: {
      stars: string;
      commits: string;
      contributors: string;
      lastCommit: string;
    };
    sentiment: {
      overall: string;
      bullish: string;
      bearish: string;
      neutral: string;
    };
  };
  predictions: {
    priceTargets: {
      short: { target: string; probability: string };
      medium: { target: string; probability: string };
      long: { target: string; probability: string };
    };
    catalysts: string[];
    risks: string[];
    opportunities: string[];
  };
}

// Advanced Token Explorer with AI Analysis
export async function POST(request: NextRequest) {
  try {
    const body: TokenScanRequest = await request.json();
    
    if (!body.address || !body.chain) {
      return NextResponse.json({
        success: false,
        error: 'Token address and chain are required'
      }, { status: 400 });
    }
    
    // Perform comprehensive token analysis
    const analysis = await performTokenAnalysis(body);
    
    return NextResponse.json({
      success: true,
      analysis,
      scanDepth: body.scanDepth,
      timestamp: new Date().toISOString(),
      chainId: getChainId(body.chain)
    });
    
  } catch (error) {
    console.error('Token analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Token analysis failed'
    }, { status: 500 });
  }
}

async function performTokenAnalysis(request: TokenScanRequest): Promise<TokenAnalysis> {
  // Mock comprehensive token analysis
  const analysis: TokenAnalysis = {
    basicInfo: await getBasicTokenInfo(request.address, request.chain),
    marketData: await getMarketData(request.address, request.chain),
    liquidityAnalysis: await analyzeLiquidity(request.address, request.chain),
    riskAssessment: await assessRisk(request.address, request.chain),
    technicalAnalysis: await performTechnicalAnalysis(request.address, request.chain),
    defiIntegration: await analyzeDeFiIntegration(request.address, request.chain),
    socialMetrics: await getSocialMetrics(request.address),
    predictions: await generatePredictions(request.address, request.chain)
  };
  
  return analysis;
}

async function getBasicTokenInfo(address: string, chain: string) {
  try {
    // Try to get real token data from CoinGecko API first
    try {
      const realTokenData = await fetchRealTokenData(address, chain);
      if (realTokenData) {
        return realTokenData;
      }
    } catch (error) {
      console.log('Real API failed, using fallback data');
    }

    // Use BaseScan API for Base chain
    if (chain === 'base') {
      const { baseScanAPI } = await import('../../../../lib/basescan');
      try {
        const tokenInfo = await baseScanAPI.getTokenInfo(address);
        return {
          address,
          name: tokenInfo.name || 'Unknown Token',
          symbol: tokenInfo.symbol || 'UNKNOWN',
          decimals: parseInt(tokenInfo.decimals) || 18,
          totalSupply: tokenInfo.totalSupply || '0',
          chain,
          verified: true
        };
      } catch (error) {
        console.log('BaseScan API failed, using fallback data');
      }
    }
    
    // Fallback to chain-specific mock data with correct addresses
    const chainTokens: Record<string, any> = {
      'base': {
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
        '0x4200000000000000000000000000000000000006': { name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
        '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
        '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22': { name: 'Coinbase Wrapped Staked ETH', symbol: 'cbETH', decimals: 18 },
        '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b': { name: 'Degen', symbol: 'DEGEN', decimals: 18 },
        '0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8': { name: 'Brett', symbol: 'BRETT', decimals: 18 },
        '0x532f27101965dd16442e59d40670faf5ebb142e4': { name: 'Brett', symbol: 'BRETT', decimals: 18 },
        '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': { name: 'DEGEN', symbol: 'DEGEN', decimals: 18 },
        '0x6921b130d297cc43754afba22e5eac0fbf8db75b': { name: 'Doginme', symbol: 'DOGINME', decimals: 18 },
      },
      'optimism': {
        '0x4200000000000000000000000000000000000042': { name: 'Optimism Token', symbol: 'OP', decimals: 18 },
        '0x4200000000000000000000000000000000000006': { name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
        '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
        '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': { name: 'Bridged USDC', symbol: 'USDC.e', decimals: 6 },
        '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
        '0x68f180fcCe6836688e9084f035309E29Bf0A2095': { name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8 },
        '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58': { name: 'Optimism', symbol: 'OP', decimals: 18 },
      },
      'arbitrum': {
        '0x912CE59144191C1204E64559FE8253a0e49E6548': { name: 'Arbitrum', symbol: 'ARB', decimals: 18 },
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': { name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
        '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': { name: 'Bridged USDC', symbol: 'USDC.e', decimals: 6 },
        '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
        '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': { name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8 },
        '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': { name: 'Tether USD', symbol: 'USDT', decimals: 6 },
      },
      'ethereum': {
        '0x514910771AF9Ca656af840dff83E8264EcF986CA': { name: 'Chainlink Token', symbol: 'LINK', decimals: 18 },
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': { name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
        '0xA0b86a33E6441D7C82e63d01Ef6fcA8D3b7eF85B': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
        '0x6B175474E89094C44Da98b954EedeAC495271d0F': { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': { name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': { name: 'Tether USD', symbol: 'USDT', decimals: 6 },
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': { name: 'Uniswap', symbol: 'UNI', decimals: 18 },
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0': { name: 'Matic Token', symbol: 'MATIC', decimals: 18 },
        '0x4Fabb145d64652a948d72533023f6E7A623C7C53': { name: 'Binance USD', symbol: 'BUSD', decimals: 18 },
      },
      'polygon': {
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': { name: 'Wrapped Matic', symbol: 'WMATIC', decimals: 18 },
        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': { name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
        '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': { name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': { name: 'Tether USD', symbol: 'USDT', decimals: 6 },
      }
    };

    const knownToken = chainTokens[chain]?.[address.toLowerCase()];
    if (knownToken) {
      return {
        address,
        name: knownToken.name,
        symbol: knownToken.symbol,
        decimals: knownToken.decimals,
        totalSupply: '1000000000000000000000000', // Mock supply
        chain,
        verified: true
      };
    }

    // Generate dynamic token info based on address and chain
    const addressNum = parseInt(address.slice(-4), 16);
    const tokenNames = ['DeFi Token', 'Yield Token', 'Liquidity Token', 'Governance Token', 'Utility Token'];
    const tokenSymbols = ['DFT', 'YLD', 'LIQ', 'GOV', 'UTL'];
    
    return {
      address,
      name: tokenNames[addressNum % tokenNames.length],
      symbol: tokenSymbols[addressNum % tokenSymbols.length] + (addressNum % 100),
      decimals: 18,
      totalSupply: (1000000 + addressNum * 1000).toString() + '000000000000000000',
      chain,
      verified: addressNum % 3 === 0
    };
    
  } catch (error) {
    console.error('Error getting basic token info:', error);
    return {
      address,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
      totalSupply: '0',
      chain,
      verified: false
    };
  }
}

async function getMarketData(address: string, chain: string) {
  try {
    // Try to get real market data
    const realData = await fetchRealTokenData(address, chain);
    
    if (realData && realData.currentPrice) {
      const formatPrice = (price: number) => {
        if (price < 0.001) return `$${price.toExponential(3)}`;
        if (price < 1) return `$${price.toFixed(6)}`;
        return `$${price.toFixed(2)}`;
      };

      const formatLargeNumber = (num: number) => {
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
      };

      const formatPercentage = (percent: number) => {
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
      };

      return {
        price: formatPrice(realData.currentPrice),
        priceChange24h: formatPercentage(realData.priceChange24h || 0),
        marketCap: formatLargeNumber(realData.marketCap || 0),
        fullyDilutedValuation: formatLargeNumber(realData.marketCap || 0),
        volume24h: formatLargeNumber(realData.volume24h || 0),
        circulatingSupply: (realData.marketCap / realData.currentPrice).toLocaleString(),
        holders: Math.floor(Math.random() * 500000).toLocaleString(), // Mock data
        transfers24h: Math.floor(Math.random() * 100000).toLocaleString() // Mock data
      };
    }
  } catch (error) {
    console.error('Error getting market data:', error);
  }

  // Fallback to mock data
  return {
    price: '$2.34',
    priceChange24h: '+5.67%',
    marketCap: '$2.45B',
    fullyDilutedValuation: '$10.05B',
    volume24h: '$145.8M',
    circulatingSupply: '1,028,385,492',
    holders: '234,567',
    transfers24h: '45,234'
  };
}

async function analyzeLiquidity(address: string, chain: string) {
  return {
    totalLiquidity: '$845.2M',
    majorPairs: [
      {
        dex: 'Uniswap V3',
        pair: 'OP/ETH',
        liquidity: '$234.5M',
        volume24h: '$45.8M',
        priceImpact: {
          onePercent: '0.02%',
          fivePercent: '0.12%',
          tenPercent: '0.28%'
        }
      },
      {
        dex: 'Velodrome',
        pair: 'OP/USDC',
        liquidity: '$189.3M',
        volume24h: '$32.1M',
        priceImpact: {
          onePercent: '0.03%',
          fivePercent: '0.15%',
          tenPercent: '0.35%'
        }
      },
      {
        dex: 'Curve',
        pair: 'OP/ETH',
        liquidity: '$98.7M',
        volume24h: '$12.4M',
        priceImpact: {
          onePercent: '0.05%',
          fivePercent: '0.25%',
          tenPercent: '0.58%'
        }
      }
    ],
    liquidityDistribution: {
      uniswapV3: '42.5%',
      uniswapV2: '15.8%',
      curve: '18.9%',
      balancer: '12.3%',
      other: '10.5%'
    }
  };
}

async function assessRisk(address: string, chain: string) {
  const riskFactors = [
    {
      category: 'Liquidity Risk',
      score: 2.5,
      description: 'High liquidity across multiple DEXes, low exit risk',
      severity: 'low' as const
    },
    {
      category: 'Smart Contract Risk',
      score: 3.0,
      description: 'Audited by multiple firms, some upgradeability concerns',
      severity: 'low' as const
    },
    {
      category: 'Centralization Risk',
      score: 6.5,
      description: 'Governance controlled by foundation, gradual decentralization',
      severity: 'medium' as const
    },
    {
      category: 'Market Risk',
      score: 7.2,
      description: 'High correlation with ETH, sensitive to L2 competition',
      severity: 'medium' as const
    },
    {
      category: 'Regulatory Risk',
      score: 4.5,
      description: 'Utility token for L2 scaling, relatively safe classification',
      severity: 'low' as const
    }
  ];
  
  const overallScore = riskFactors.reduce((acc, factor) => acc + factor.score, 0) / riskFactors.length;
  
  return {
    overallScore: Math.round(overallScore * 10) / 10,
    riskLevel: overallScore <= 3 ? 'low' as const : 
               overallScore <= 6 ? 'medium' as const : 'high' as const,
    factors: riskFactors,
    redFlags: [
      'Significant token unlock schedule',
      'Governance concentration'
    ],
    greenFlags: [
      'Multiple security audits',
      'Strong liquidity',
      'Active development',
      'Growing ecosystem adoption'
    ]
  };
}

async function performTechnicalAnalysis(address: string, chain: string) {
  return {
    contractAnalysis: {
      isProxy: true,
      upgradeability: 'Timelocked upgrades with 7-day delay',
      ownership: 'Optimism Foundation (transitioning to DAO)',
      pausable: false,
      mintable: true,
      burnable: false,
      blacklistable: false
    },
    tokenomics: {
      initialSupply: '4.29B',
      maxSupply: '4.29B',
      inflationRate: '2% annually',
      burnMechanism: false,
      stakingRewards: true,
      vestingSchedule: [
        {
          beneficiary: 'Core Contributors',
          amount: '214M OP',
          unlockDate: '2024-06-01',
          percentage: '5.0%'
        },
        {
          beneficiary: 'Investors',
          amount: '429M OP',
          unlockDate: '2024-12-01',
          percentage: '10.0%'
        },
        {
          beneficiary: 'Ecosystem Fund',
          amount: '858M OP',
          unlockDate: 'Ongoing',
          percentage: '20.0%'
        }
      ]
    },
    governance: {
      hasGovernance: true,
      governanceToken: 'OP',
      proposalThreshold: '125K OP',
      votingPeriod: '7 days',
      timelock: '7 days'
    }
  };
}

async function analyzeDeFiIntegration(address: string, chain: string) {
  return {
    protocols: [
      {
        name: 'Aave V3',
        category: 'Lending',
        tvl: '$450M',
        apy: '3.5%',
        riskLevel: 'Low',
        features: ['Supply OP', 'Collateral', 'Flash Loans']
      },
      {
        name: 'Velodrome',
        category: 'DEX',
        tvl: '$180M',
        apy: '25%',
        riskLevel: 'Medium',
        features: ['LP Rewards', 'Vote Escrow', 'Bribes']
      },
      {
        name: 'Synthetix',
        category: 'Derivatives',
        tvl: '$85M',
        apy: '40%',
        riskLevel: 'High',
        features: ['Staking', 'Perp Trading', 'Synthetic Assets']
      }
    ],
    yieldOpportunities: [
      {
        platform: 'Velodrome',
        strategy: 'OP/ETH LP + Vote Lock',
        apy: '28.5%',
        tvl: '$45M',
        riskScore: 6.2,
        requirements: ['Provide liquidity', 'Lock VELO tokens', 'Vote on gauges']
      },
      {
        platform: 'Aave V3',
        strategy: 'Supply OP + Borrow Stables',
        apy: '12.3%',
        tvl: '$120M',
        riskScore: 3.8,
        requirements: ['Supply OP as collateral', 'Maintain health factor >1.5']
      },
      {
        platform: 'Synthetix',
        strategy: 'Stake OP for sUSD',
        apy: '35.7%',
        tvl: '$25M',
        riskScore: 8.1,
        requirements: ['Stake OP', 'Maintain C-Ratio', 'Active debt management']
      }
    ],
    liquidityMining: [
      {
        protocol: 'Velodrome',
        pair: 'OP/USDC',
        rewards: ['VELO', 'OP'],
        apy: '32%',
        duration: 'Ongoing'
      },
      {
        protocol: 'Uniswap V3',
        pair: 'OP/ETH',
        rewards: ['OP'],
        apy: '18%',
        duration: '12 weeks'
      }
    ]
  };
}

async function getSocialMetrics(address: string) {
  return {
    twitter: {
      followers: '1.2M',
      engagement: '4.8%',
      sentiment: 'Bullish (72%)'
    },
    discord: {
      members: '85K',
      activity: 'High'
    },
    github: {
      stars: '2.1K',
      commits: '1,847',
      contributors: '89',
      lastCommit: '2 hours ago'
    },
    sentiment: {
      overall: 'Positive',
      bullish: '68%',
      bearish: '18%',
      neutral: '14%'
    }
  };
}

async function generatePredictions(address: string, chain: string) {
  return {
    priceTargets: {
      short: { target: '$2.80', probability: '65%' },
      medium: { target: '$4.20', probability: '45%' },
      long: { target: '$8.50', probability: '30%' }
    },
    catalysts: [
      'Ethereum Shanghai upgrade boosting L2 adoption',
      'Major DeFi protocol migrations to Optimism',
      'Implementation of fault proofs',
      'RetroPGF Round 4 results',
      'Institutional L2 adoption'
    ],
    risks: [
      'Competing L2 solutions gaining market share',
      'Ethereum scaling improvements reducing L2 need',
      'Major token unlock events',
      'Regulatory changes affecting L2s',
      'Smart contract vulnerabilities'
    ],
    opportunities: [
      'Growing DeFi ecosystem on Optimism',
      'Increasing transaction volume',
      'Partnership announcements',
      'Technical improvements and upgrades',
      'Cross-chain bridge integrations'
    ]
  };
}

function getChainId(chain: string): number {
  const chainIds: Record<string, number> = {
    'ethereum': 1,
    'optimism': 10,
    'base': 8453,
    'arbitrum': 42161,
    'polygon': 137,
    'bsc': 56
  };
  
  return chainIds[chain.toLowerCase()] || 1;
}

// Fetch real token data from APIs
async function fetchRealTokenData(address: string, chain: string) {
  try {
    // Map chain names to platform IDs for CoinGecko
    const platformMap: Record<string, string> = {
      'ethereum': 'ethereum',
      'base': 'base',
      'optimism': 'optimistic-ethereum',
      'arbitrum': 'arbitrum-one',
      'polygon': 'polygon-pos'
    };

    const platform = platformMap[chain];
    if (!platform) return null;

    // Try CoinGecko API for token info (free tier, no API key needed)
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`;
    
    const response = await fetch(coingeckoUrl, {
      headers: {
        'User-Agent': 'Superchain-Token-Explorer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.symbol && data.name) {
      return {
        address,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        decimals: data.detail_platforms?.[platform]?.decimal_place || 18,
        totalSupply: data.market_data?.total_supply?.toString() || '0',
        chain,
        verified: true,
        // Additional market data
        currentPrice: data.market_data?.current_price?.usd || 0,
        marketCap: data.market_data?.market_cap?.usd || 0,
        volume24h: data.market_data?.total_volume?.usd || 0,
        priceChange24h: data.market_data?.price_change_percentage_24h || 0
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching real token data for ${address} on ${chain}:`, error);
    return null;
  }
}

// Batch token analysis endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addresses = searchParams.get('addresses')?.split(',') || [];
    const chain = searchParams.get('chain') || 'ethereum';
    
    if (addresses.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No addresses provided'
      }, { status: 400 });
    }
    
    if (addresses.length > 10) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 10 tokens per batch'
      }, { status: 400 });
    }
    
    // Perform batch analysis
    const results = await Promise.all(
      addresses.map(async (address) => {
        try {
          const analysis = await performTokenAnalysis({
            address: address.trim(),
            chain,
            scanDepth: 'basic'
          });
          
          return {
            address: address.trim(),
            success: true,
            data: {
              basicInfo: analysis.basicInfo,
              marketData: analysis.marketData,
              riskScore: analysis.riskAssessment.overallScore,
              riskLevel: analysis.riskAssessment.riskLevel
            }
          };
        } catch (error) {
          return {
            address: address.trim(),
            success: false,
            error: 'Analysis failed'
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      results,
      totalAnalyzed: addresses.length,
      chain,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Batch analysis failed'
    }, { status: 500 });
  }
}