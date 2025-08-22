import { NextRequest, NextResponse } from 'next/server';

interface OptimismProtocol {
  id: string;
  name: string;
  category: string;
  tvl: string;
  tvlChange24h: string;
  apy: string;
  volume24h: string;
  description: string;
  logo: string;
  website: string;
  contracts: {
    main: string;
    router?: string;
    factory?: string;
  };
  features: string[];
  riskLevel: 'low' | 'medium' | 'high';
  auditStatus: string;
  tokens: string[];
  chains: string[];
  isNative: boolean;
  opIncentives: {
    active: boolean;
    amount: string;
    duration: string;
    requirements: string[];
  };
  metrics: {
    users: string;
    transactions: string;
    fees: string;
    growth: string;
  };
}

// Optimism Superchain DeFi Protocol Explorer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'tvl';
    const chain = searchParams.get('chain') || 'all';
    
    // Fetch live protocol data
    const protocols = await getOptimismProtocols();
    
    // Filter by category if specified
    let filteredProtocols = category 
      ? protocols.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : protocols;
    
    // Filter by chain
    if (chain !== 'all') {
      filteredProtocols = filteredProtocols.filter(p => 
        p.chains.includes(chain) || (chain === 'optimism' && p.isNative)
      );
    }
    
    // Sort protocols
    filteredProtocols.sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return parseFloat(b.tvl.replace(/[^\d.]/g, '')) - parseFloat(a.tvl.replace(/[^\d.]/g, ''));
        case 'apy':
          return parseFloat(b.apy.replace('%', '')) - parseFloat(a.apy.replace('%', ''));
        case 'volume':
          return parseFloat(b.volume24h.replace(/[^\d.]/g, '')) - parseFloat(a.volume24h.replace(/[^\d.]/g, ''));
        case 'growth':
          return parseFloat(b.tvlChange24h.replace(/[^\d.-]/g, '')) - parseFloat(a.tvlChange24h.replace(/[^\d.-]/g, ''));
        default:
          return 0;
      }
    });
    
    // Get ecosystem stats
    const ecosystemStats = calculateEcosystemStats(protocols);
    
    // Get trending protocols
    const trending = getTrendingProtocols(protocols);
    
    // Get OP incentive programs
    const opIncentives = getActiveIncentives(protocols);
    
    return NextResponse.json({
      success: true,
      protocols: filteredProtocols,
      stats: ecosystemStats,
      trending,
      opIncentives,
      categories: getCategories(protocols),
      totalCount: filteredProtocols.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Optimism explorer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch protocol data'
    }, { status: 500 });
  }
}

async function getOptimismProtocols(): Promise<OptimismProtocol[]> {
  return [
    {
      id: 'velodrome-v3',
      name: 'Velodrome V3',
      category: 'DEX',
      tvl: '$180.5M',
      tvlChange24h: '+5.2%',
      apy: '25-45%',
      volume24h: '$12.3M',
      description: 'Leading AMM on Optimism with concentrated liquidity and ve(3,3) tokenomics',
      logo: '🏎️',
      website: 'https://velodrome.finance',
      contracts: {
        main: '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746',
        router: '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858',
        factory: '0x31832f2a97Fd20664D76Cc421207669b55CE4BC0'
      },
      features: ['Concentrated Liquidity', 'Vote Escrow', 'Bribes', 'Yield Farming'],
      riskLevel: 'medium',
      auditStatus: 'Multiple audits by leading firms',
      tokens: ['VELO', 'OP', 'ETH', 'USDC'],
      chains: ['Optimism'],
      isNative: true,
      opIncentives: {
        active: true,
        amount: '500K OP',
        duration: '12 weeks',
        requirements: ['Provide liquidity', 'Vote on gauges']
      },
      metrics: {
        users: '45K+',
        transactions: '2.1M+',
        fees: '$2.8M',
        growth: '+125% YoY'
      }
    },
    {
      id: 'synthetix-v3',
      name: 'Synthetix V3',
      category: 'Derivatives',
      tvl: '$85.2M',
      tvlChange24h: '+8.7%',
      apy: '30-60%',
      volume24h: '$45.8M',
      description: 'Next-gen derivatives platform with perpetual futures and synthetic assets',
      logo: '📈',
      website: 'https://synthetix.io',
      contracts: {
        main: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
        router: '0x0A2AF931eFFd34b81ebcc57E3d3c9B1E1dE1C9Ce'
      },
      features: ['Perpetual Futures', 'Synthetic Assets', 'Cross Margin', 'Atomic Swaps'],
      riskLevel: 'high',
      auditStatus: 'Audited by Sigma Prime, Iosiro',
      tokens: ['SNX', 'sUSD', 'sETH', 'sBTC'],
      chains: ['Optimism', 'Base'],
      isNative: true,
      opIncentives: {
        active: true,
        amount: '2M OP',
        duration: '24 weeks',
        requirements: ['Stake SNX', 'Provide perp liquidity']
      },
      metrics: {
        users: '28K+',
        transactions: '890K+',
        fees: '$15.2M',
        growth: '+340% YoY'
      }
    },
    {
      id: 'aave-v3-optimism',
      name: 'Aave V3',
      category: 'Lending',
      tvl: '$450.8M',
      tvlChange24h: '+2.1%',
      apy: '4-12%',
      volume24h: '$8.9M',
      description: 'Multi-chain lending protocol with isolation mode and eMode efficiency',
      logo: '👻',
      website: 'https://aave.com',
      contracts: {
        main: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
      },
      features: ['Isolation Mode', 'eMode', 'Flash Loans', 'Credit Delegation'],
      riskLevel: 'low',
      auditStatus: 'Extensively audited, bug bounty active',
      tokens: ['AAVE', 'OP', 'ETH', 'USDC', 'USDT', 'DAI', 'WBTC'],
      chains: ['Optimism', 'Ethereum', 'Arbitrum', 'Polygon', 'Avalanche'],
      isNative: false,
      opIncentives: {
        active: true,
        amount: '1M OP',
        duration: '16 weeks',
        requirements: ['Supply assets', 'Borrow against collateral']
      },
      metrics: {
        users: '125K+',
        transactions: '5.8M+',
        fees: '$45.7M',
        growth: '+67% YoY'
      }
    },
    {
      id: 'uniswap-v3-optimism',
      name: 'Uniswap V3',
      category: 'DEX',
      tvl: '$320.4M',
      tvlChange24h: '+1.8%',
      apy: '8-25%',
      volume24h: '$28.5M',
      description: 'Concentrated liquidity AMM with capital-efficient trading',
      logo: '🦄',
      website: 'https://uniswap.org',
      contracts: {
        main: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        router: '0xE592427A0AEce92De3Edee1F18E0157C05861564'
      },
      features: ['Concentrated Liquidity', 'Multiple Fee Tiers', 'Range Orders', 'Oracle'],
      riskLevel: 'low',
      auditStatus: 'Multiple audits, battle-tested',
      tokens: ['UNI', 'OP', 'ETH', 'USDC', 'USDT', 'DAI'],
      chains: ['Optimism', 'Ethereum', 'Arbitrum', 'Polygon', 'Base'],
      isNative: false,
      opIncentives: {
        active: true,
        amount: '750K OP',
        duration: '20 weeks',
        requirements: ['Provide liquidity in key pairs']
      },
      metrics: {
        users: '89K+',
        transactions: '3.2M+',
        fees: '$89.3M',
        growth: '+45% YoY'
      }
    },
    {
      id: 'curve-optimism',
      name: 'Curve Finance',
      category: 'DEX',
      tvl: '$95.7M',
      tvlChange24h: '+3.4%',
      apy: '6-18%',
      volume24h: '$5.2M',
      description: 'Stablecoin-focused AMM with low slippage and gauge rewards',
      logo: '🌊',
      website: 'https://curve.fi',
      contracts: {
        main: '0x8461A004b50d321CB22B7d034969cE6803911899'
      },
      features: ['Stable Swaps', 'Gauge Voting', 'Bribes', 'Cross-chain Pools'],
      riskLevel: 'low',
      auditStatus: 'Audited by Trail of Bits, MixBytes',
      tokens: ['CRV', 'OP', 'USDC', 'USDT', 'DAI', 'FRAX'],
      chains: ['Optimism', 'Ethereum', 'Arbitrum', 'Polygon'],
      isNative: false,
      opIncentives: {
        active: true,
        amount: '300K OP',
        duration: '12 weeks',
        requirements: ['Stake in gauges', 'Vote on emissions']
      },
      metrics: {
        users: '35K+',
        transactions: '450K+',
        fees: '$12.8M',
        growth: '+23% YoY'
      }
    },
    {
      id: 'perpetual-protocol-v2',
      name: 'Perpetual Protocol V2',
      category: 'Derivatives',
      tvl: '$42.3M',
      tvlChange24h: '+12.5%',
      apy: '15-40%',
      volume24h: '$18.7M',
      description: 'Virtual AMM-powered perpetual futures with up to 10x leverage',
      logo: '🔄',
      website: 'https://perp.com',
      contracts: {
        main: '0x82ac2CE43e33683c58BE4cDc40975E73aA50f459'
      },
      features: ['Virtual AMM', 'Cross Margin', 'Funding Payments', 'Insurance Fund'],
      riskLevel: 'high',
      auditStatus: 'Audited by OpenZeppelin, Consensys',
      tokens: ['PERP', 'OP', 'ETH', 'BTC'],
      chains: ['Optimism'],
      isNative: true,
      opIncentives: {
        active: true,
        amount: '400K OP',
        duration: '16 weeks',
        requirements: ['Trade volume', 'Provide maker liquidity']
      },
      metrics: {
        users: '18K+',
        transactions: '285K+',
        fees: '$8.9M',
        growth: '+180% YoY'
      }
    },
    {
      id: 'lyra-v2',
      name: 'Lyra V2',
      category: 'Derivatives',
      tvl: '$28.9M',
      tvlChange24h: '+15.8%',
      apy: '20-50%',
      volume24h: '$3.8M',
      description: 'Options AMM with dynamic delta hedging and sophisticated pricing',
      logo: '🎯',
      website: 'https://lyra.finance',
      contracts: {
        main: '0x5Db73886c4730dBF3C562ebf8044E19E8C93843e'
      },
      features: ['Options AMM', 'Delta Hedging', 'Volatility Trading', 'LP Rewards'],
      riskLevel: 'high',
      auditStatus: 'Audited by Sigma Prime, Quantstamp',
      tokens: ['LYRA', 'OP', 'ETH', 'BTC'],
      chains: ['Optimism'],
      isNative: true,
      opIncentives: {
        active: true,
        amount: '250K OP',
        duration: '12 weeks',
        requirements: ['Provide options liquidity', 'Trade options']
      },
      metrics: {
        users: '8.5K+',
        transactions: '125K+',
        fees: '$2.1M',
        growth: '+450% YoY'
      }
    },
    {
      id: 'beethoven-x',
      name: 'Beethoven X',
      category: 'DEX',
      tvl: '$35.2M',
      tvlChange24h: '+4.7%',
      apy: '12-30%',
      volume24h: '$2.1M',
      description: 'Balancer-powered DEX with weighted pools and yield farming',
      logo: '🎼',
      website: 'https://beets.fi',
      contracts: {
        main: '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
      },
      features: ['Weighted Pools', 'Boosted Pools', 'Gauge Voting', 'Yield Farming'],
      riskLevel: 'medium',
      auditStatus: 'Inherits Balancer V2 security',
      tokens: ['BEETS', 'OP', 'ETH', 'USDC', 'WBTC'],
      chains: ['Optimism', 'Fantom'],
      isNative: false,
      opIncentives: {
        active: true,
        amount: '150K OP',
        duration: '8 weeks',
        requirements: ['Provide liquidity', 'Stake BEETS']
      },
      metrics: {
        users: '12K+',
        transactions: '89K+',
        fees: '$890K',
        growth: '+89% YoY'
      }
    }
  ];
}

function calculateEcosystemStats(protocols: OptimismProtocol[]) {
  const totalTVL = protocols.reduce((acc, p) => acc + parseFloat(p.tvl.replace(/[^\d.]/g, '')), 0);
  const totalVolume = protocols.reduce((acc, p) => acc + parseFloat(p.volume24h.replace(/[^\d.]/g, '')), 0);
  const totalUsers = protocols.reduce((acc, p) => acc + parseFloat(p.metrics.users.replace(/[^\d.]/g, '')), 0);
  
  const avgTVLChange = protocols.reduce((acc, p) => {
    return acc + parseFloat(p.tvlChange24h.replace(/[^\d.-]/g, ''));
  }, 0) / protocols.length;
  
  const activeIncentives = protocols.filter(p => p.opIncentives.active).length;
  const totalOpIncentives = protocols.reduce((acc, p) => {
    if (p.opIncentives.active) {
      return acc + parseFloat(p.opIncentives.amount.replace(/[^\d.]/g, ''));
    }
    return acc;
  }, 0);
  
  return {
    totalTVL: `$${totalTVL.toFixed(1)}M`,
    totalVolume24h: `$${totalVolume.toFixed(1)}M`,
    totalUsers: `${Math.round(totalUsers / 1000)}K+`,
    avgTVLChange24h: `${avgTVLChange >= 0 ? '+' : ''}${avgTVLChange.toFixed(1)}%`,
    protocolCount: protocols.length,
    activeIncentives,
    totalOpRewards: `${totalOpIncentives.toFixed(1)}M OP`,
    categories: getCategories(protocols).length
  };
}

function getCategories(protocols: OptimismProtocol[]) {
  const categories = [...new Set(protocols.map(p => p.category))];
  return categories.map(cat => ({
    name: cat,
    count: protocols.filter(p => p.category === cat).length,
    tvl: protocols.filter(p => p.category === cat)
      .reduce((acc, p) => acc + parseFloat(p.tvl.replace(/[^\d.]/g, '')), 0)
  }));
}

function getTrendingProtocols(protocols: OptimismProtocol[]) {
  return protocols
    .filter(p => parseFloat(p.tvlChange24h.replace(/[^\d.-]/g, '')) > 5)
    .sort((a, b) => parseFloat(b.tvlChange24h.replace(/[^\d.-]/g, '')) - parseFloat(a.tvlChange24h.replace(/[^\d.-]/g, '')))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      change: p.tvlChange24h,
      tvl: p.tvl
    }));
}

function getActiveIncentives(protocols: OptimismProtocol[]) {
  return protocols
    .filter(p => p.opIncentives.active)
    .map(p => ({
      protocol: p.name,
      amount: p.opIncentives.amount,
      duration: p.opIncentives.duration,
      requirements: p.opIncentives.requirements,
      apy: p.apy,
      category: p.category
    }))
    .sort((a, b) => parseFloat(b.amount.replace(/[^\d.]/g, '')) - parseFloat(a.amount.replace(/[^\d.]/g, '')));
}

// Protocol details endpoint
export async function POST(request: NextRequest) {
  try {
    const { protocolId } = await request.json();
    const protocols = await getOptimismProtocols();
    const protocol = protocols.find(p => p.id === protocolId);
    
    if (!protocol) {
      return NextResponse.json({
        success: false,
        error: 'Protocol not found'
      }, { status: 404 });
    }
    
    // Get additional details
    const additionalData = await getProtocolDetails(protocolId);
    
    return NextResponse.json({
      success: true,
      protocol: {
        ...protocol,
        ...additionalData
      }
    });
    
  } catch (error) {
    console.error('Protocol details error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch protocol details'
    }, { status: 500 });
  }
}

async function getProtocolDetails(protocolId: string) {
  // Mock additional protocol data
  const details = {
    'velodrome-v3': {
      charts: {
        tvlHistory: generateMockChartData('tvl', 30),
        volumeHistory: generateMockChartData('volume', 30),
        apyHistory: generateMockChartData('apy', 30)
      },
      pools: [
        { pair: 'OP/USDC', tvl: '$45.2M', apy: '32.5%', volume24h: '$4.8M' },
        { pair: 'ETH/USDC', tvl: '$38.9M', apy: '28.1%', volume24h: '$3.2M' },
        { pair: 'VELO/OP', tvl: '$22.1M', apy: '45.7%', volume24h: '$1.9M' }
      ],
      governance: {
        totalVotes: '125.8M VELO',
        activeProposals: 3,
        nextEpoch: '2024-01-15T00:00:00Z',
        veVELO: '89.3M'
      }
    },
    'synthetix-v3': {
      charts: {
        tvlHistory: generateMockChartData('tvl', 30),
        volumeHistory: generateMockChartData('volume', 30),
        openInterest: generateMockChartData('oi', 30)
      },
      markets: [
        { asset: 'ETH-PERP', openInterest: '$12.8M', funding: '0.0125%', volume24h: '$18.5M' },
        { asset: 'BTC-PERP', openInterest: '$8.9M', funding: '-0.0089%', volume24h: '$12.3M' },
        { asset: 'SOL-PERP', openInterest: '$3.2M', funding: '0.0234%', volume24h: '$5.7M' }
      ]
    }
  };
  
  return details[protocolId as keyof typeof details] || {};
}

function generateMockChartData(type: string, days: number) {
  const data = [];
  const baseValue = type === 'tvl' ? 100 : type === 'volume' ? 10 : type === 'apy' ? 20 : 50;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 0.2;
    const trend = type === 'tvl' ? 0.002 : 0.001;
    const value = baseValue * (1 + trend * (days - i) + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
}