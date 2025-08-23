import { NextRequest, NextResponse } from 'next/server';

interface StrategyRequest {
  userGoal: string;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  portfolioSize: number;
  chains: string[];
  currentPositions?: any[];
}

interface DeFiStrategy {
  id: string;
  name: string;
  description: string;
  expectedAPY: string;
  riskLevel: 'low' | 'medium' | 'high';
  protocol: string;
  chain: string;
  tvl: string;
  steps: string[];
  contracts: string[];
  estimatedGas: string;
  liquidityReqs: string;
  impermanentLoss: string;
  rewards: string[];
}

// AI Agent: Akıllı DeFi Strateji Önerici
export async function POST(request: NextRequest) {
  try {
    const body: StrategyRequest = await request.json();
    
    // Kullanıcı profilini analiz et
    const userProfile = analyzeUserProfile(body);
    
    // Optimum stratejileri hesapla
    const strategies = await generateStrategies(userProfile);
    
    // Risk analizi yap
    const riskAnalysis = calculateRiskMetrics(strategies, userProfile);
    
    // Portfolio optimizasyonu
    const optimizedPortfolio = optimizePortfolio(strategies, body.portfolioSize);
    
    return NextResponse.json({
      success: true,
      userProfile,
      strategies: strategies.slice(0, 5), // Top 5 strateji
      riskAnalysis,
      optimizedPortfolio,
      totalExpectedAPY: optimizedPortfolio.expectedAPY,
      riskScore: riskAnalysis.overallRisk,
      diversificationScore: riskAnalysis.diversification,
      recommendations: generateRecommendations(userProfile, strategies)
    });
    
  } catch (error) {
    console.error('AI Strategy generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Strategy generation failed'
    }, { status: 500 });
  }
}

function analyzeUserProfile(request: StrategyRequest) {
  return {
    riskTolerance: request.riskTolerance,
    timeHorizon: request.timeHorizon,
    portfolioSize: request.portfolioSize,
    experienceLevel: request.portfolioSize > 100000 ? 'advanced' : 
                    request.portfolioSize > 10000 ? 'intermediate' : 'beginner',
    preferredChains: request.chains,
    goals: parseGoals(request.userGoal)
  };
}

function parseGoals(userGoal: string) {
  const goals = [];
  const lowerGoal = userGoal.toLowerCase();
  
  if (lowerGoal.includes('yield') || lowerGoal.includes('earn') || lowerGoal.includes('apy')) {
    goals.push('yield_farming');
  }
  if (lowerGoal.includes('liquidity') || lowerGoal.includes('lp')) {
    goals.push('liquidity_provision');
  }
  if (lowerGoal.includes('stake') || lowerGoal.includes('staking')) {
    goals.push('staking');
  }
  if (lowerGoal.includes('arbitrage') || lowerGoal.includes('trading')) {
    goals.push('arbitrage');
  }
  if (lowerGoal.includes('safe') || lowerGoal.includes('conservative')) {
    goals.push('conservative');
  }
  
  return goals.length > 0 ? goals : ['general'];
}

async function generateStrategies(profile: any): Promise<DeFiStrategy[]> {
  const strategies: DeFiStrategy[] = [];
  
  // Optimism Focused Strategies
  if (profile.preferredChains.includes('Optimism') || profile.preferredChains.includes('Base')) {
    strategies.push({
      id: 'op-velodrome-v3',
      name: 'Velodrome V3 Concentrated Liquidity',
      description: 'High-yield LP positions on Optimism\'s largest DEX with vote-locked rewards',
      expectedAPY: '25-45%',
      riskLevel: 'medium',
      protocol: 'Velodrome V3',
      chain: 'Optimism',
      tvl: '$180M',
      steps: [
        'Deposit equal amounts of OP/ETH',
        'Create concentrated liquidity position',
        'Lock VELO tokens for boosted rewards',
        'Harvest and compound weekly'
      ],
      contracts: ['0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746'],
      estimatedGas: '$5-12',
      liquidityReqs: '$1000+ recommended',
      impermanentLoss: 'Medium (managed with tight ranges)',
      rewards: ['VELO tokens', 'Trading fees', 'Gauge emissions']
    });

    strategies.push({
      id: 'base-aerodrome-stable',
      name: 'Aerodrome Stable Pool Strategy',
      description: 'Low-risk stable coin farming on Base with consistent yields',
      expectedAPY: '12-18%',
      riskLevel: 'low',
      protocol: 'Aerodrome',
      chain: 'Base',
      tvl: '$2.8B',
      steps: [
        'Deposit USDC/DAI into stable pool',
        'Stake LP tokens for AERO rewards',
        'Vote-lock AERO for gauge weight',
        'Reinvest rewards daily'
      ],
      contracts: ['0x6cDcb1C4A4D1C3C6d054b27AC5B77e89eAFb971d'],
      estimatedGas: '$0.50-2',
      liquidityReqs: '$500+',
      impermanentLoss: 'Very Low',
      rewards: ['AERO tokens', 'Trading fees', 'Base incentives']
    });
  }
  
  // Ethereum Strategies
  if (profile.preferredChains.includes('Ethereum')) {
    strategies.push({
      id: 'eth-lido-restaking',
      name: 'Lido Liquid Staking + EigenLayer',
      description: 'Double staking rewards through liquid staking and restaking',
      expectedAPY: '8-12%',
      riskLevel: 'low',
      protocol: 'Lido + EigenLayer',
      chain: 'Ethereum',
      tvl: '$35B',
      steps: [
        'Stake ETH for stETH on Lido',
        'Restake stETH on EigenLayer',
        'Earn additional AVS rewards',
        'Monitor slashing risks'
      ],
      contracts: ['0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
      estimatedGas: '$15-25',
      liquidityReqs: '$1000+',
      impermanentLoss: 'None',
      rewards: ['ETH staking yield', 'EigenLayer points', 'AVS tokens']
    });
  }

  // Arbitrum Strategies
  if (profile.preferredChains.includes('Arbitrum')) {
    strategies.push({
      id: 'arb-gmx-glp',
      name: 'GMX GLP Index Strategy',
      description: 'Diversified crypto exposure with trading fee rewards',
      expectedAPY: '15-25%',
      riskLevel: 'medium',
      protocol: 'GMX V2',
      chain: 'Arbitrum',
      tvl: '$450M',
      steps: [
        'Mint GLP with preferred assets',
        'Earn ETH/AVAX from trading fees',
        'Compound esGMX rewards',
        'Monitor composition rebalancing'
      ],
      contracts: ['0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258'],
      estimatedGas: '$3-8',
      liquidityReqs: '$2000+',
      impermanentLoss: 'Variable (index based)',
      rewards: ['Trading fees', 'esGMX tokens', 'Multiplier points']
    });
  }

  // Conservative Strategy
  if (profile.riskTolerance === 'low') {
    strategies.push({
      id: 'multi-aave-v3',
      name: 'Multi-Chain Aave V3 Lending',
      description: 'Conservative lending across multiple chains for stable yields',
      expectedAPY: '4-8%',
      riskLevel: 'low',
      protocol: 'Aave V3',
      chain: 'Multi-chain',
      tvl: '$12B',
      steps: [
        'Supply USDC/USDT to Aave V3',
        'Enable eMode for higher efficiency',
        'Monitor utilization rates',
        'Harvest rewards monthly'
      ],
      contracts: ['0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'],
      estimatedGas: '$2-5 per chain',
      liquidityReqs: '$500+',
      impermanentLoss: 'None',
      rewards: ['Interest rates', 'AAVE tokens', 'Efficiency bonuses']
    });
  }

  // High Risk/High Reward
  if (profile.riskTolerance === 'high') {
    strategies.push({
      id: 'op-perp-trading',
      name: 'Optimism Perp DEX Liquidity',
      description: 'High-yield perpetual trading liquidity provision',
      expectedAPY: '30-60%',
      riskLevel: 'high',
      protocol: 'Synthetix V3',
      chain: 'Optimism',
      tvl: '$85M',
      steps: [
        'Provide liquidity to perp pools',
        'Collect trading fees and funding',
        'Manage position exposure',
        'Hedge with spot positions'
      ],
      contracts: ['0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4'],
      estimatedGas: '$8-15',
      liquidityReqs: '$5000+',
      impermanentLoss: 'High (directional exposure)',
      rewards: ['Trading fees', 'SNX rewards', 'OP incentives']
    });
  }

  return strategies.filter(s => 
    profile.riskTolerance === 'low' ? s.riskLevel === 'low' :
    profile.riskTolerance === 'high' ? true :
    s.riskLevel !== 'high'
  );
}

function calculateRiskMetrics(strategies: DeFiStrategy[], profile: any) {
  const riskLevels = strategies.map(s => s.riskLevel);
  const chainCount = new Set(strategies.map(s => s.chain)).size;
  const protocolCount = new Set(strategies.map(s => s.protocol)).size;
  
  return {
    overallRisk: calculateOverallRisk(riskLevels),
    diversification: Math.min(10, (chainCount * 2 + protocolCount) / strategies.length * 10),
    liquidityRisk: calculateLiquidityRisk(strategies),
    smartContractRisk: calculateContractRisk(strategies),
    impermanentLossRisk: calculateILRisk(strategies)
  };
}

function calculateOverallRisk(riskLevels: string[]) {
  const riskValues = riskLevels.map(r => r === 'low' ? 2 : r === 'medium' ? 5 : 8);
  return Math.round(riskValues.reduce((a, b) => a + b, 0) / riskValues.length * 10) / 10;
}

function calculateLiquidityRisk(strategies: DeFiStrategy[]) {
  return strategies.reduce((acc, s) => {
    const tvlValue = parseFloat(s.tvl.replace(/[^\d.]/g, ''));
    return acc + (tvlValue > 1000 ? 1 : tvlValue > 100 ? 2 : 3);
  }, 0) / strategies.length;
}

function calculateContractRisk(strategies: DeFiStrategy[]) {
  const knownProtocols = ['Aave', 'Compound', 'Uniswap', 'Lido'];
  return strategies.reduce((acc, s) => {
    const isKnown = knownProtocols.some(p => s.protocol.includes(p));
    return acc + (isKnown ? 1 : 2);
  }, 0) / strategies.length;
}

function calculateILRisk(strategies: DeFiStrategy[]) {
  return strategies.reduce((acc, s) => {
    if (s.impermanentLoss.includes('None')) return acc + 1;
    if (s.impermanentLoss.includes('Low')) return acc + 2;
    if (s.impermanentLoss.includes('Medium')) return acc + 3;
    return acc + 4;
  }, 0) / strategies.length;
}

function optimizePortfolio(strategies: DeFiStrategy[], portfolioSize: number) {
  const allocation = allocatePortfolio(strategies, portfolioSize);
  const weightedAPY = calculateWeightedAPY(allocation);
  
  return {
    totalValue: portfolioSize,
    expectedAPY: `${weightedAPY.toFixed(1)}%`,
    allocations: allocation,
    rebalanceFrequency: 'Monthly',
    monitoringRequired: 'Weekly',
    exitStrategy: 'Gradual unwinding over 2-4 weeks'
  };
}

function allocatePortfolio(strategies: DeFiStrategy[], portfolioSize: number) {
  const allocations: any[] = [];
  let remainingSize = portfolioSize;
  
  strategies.forEach((strategy, index) => {
    const percentage = index === 0 ? 40 : 
                     index === 1 ? 30 : 
                     index === 2 ? 20 : 10;
    const allocation = remainingSize * (percentage / 100);
    
    allocations.push({
      strategy: strategy.name,
      amount: allocation,
      percentage,
      expectedReturn: allocation * (parseFloat(strategy.expectedAPY) / 100)
    });
    
    remainingSize -= allocation;
  });
  
  return allocations;
}

function calculateWeightedAPY(allocations: any[]) {
  return allocations.reduce((acc, alloc) => 
    acc + (alloc.expectedReturn / allocations.reduce((sum, a) => sum + a.amount, 0) * 100), 0
  );
}

function generateRecommendations(profile: any, strategies: DeFiStrategy[]) {
  const recommendations = [];
  
  if (profile.experienceLevel === 'beginner') {
    recommendations.push('Start with Aave V3 lending to learn DeFi basics');
    recommendations.push('Use testnet first to understand protocol mechanics');
  }
  
  if (profile.riskTolerance === 'low') {
    recommendations.push('Focus on blue-chip protocols with proven track records');
    recommendations.push('Keep 20% in stablecoins for quick exits');
  }
  
  if (profile.portfolioSize > 50000) {
    recommendations.push('Consider multiple chains to reduce concentration risk');
    recommendations.push('Use yield aggregators like Yearn for optimization');
  }
  
  recommendations.push('Set up monitoring alerts for APY changes');
  recommendations.push('Review and rebalance portfolio monthly');
  recommendations.push('Always keep emergency funds outside of DeFi');
  
  return recommendations;
}