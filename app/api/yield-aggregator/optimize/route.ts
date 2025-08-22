import { NextRequest, NextResponse } from 'next/server';

interface OptimizationRequest {
  portfolioSize: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
  preferredChains: string[];
  currentPositions?: Array<{
    protocol: string;
    amount: number;
    asset: string;
    apy: number;
  }>;
  constraints: {
    maxSinglePosition: number;
    minLiquidity: number;
    excludeProtocols?: string[];
    requireAudited: boolean;
  };
}

interface YieldOpportunity {
  id: string;
  protocol: string;
  strategy: string;
  chain: string;
  asset: string;
  apy: number;
  apyRange: { min: number; max: number };
  tvl: number;
  minimumDeposit: number;
  lockupPeriod: number;
  riskScore: number;
  category: 'lending' | 'dex' | 'staking' | 'farming' | 'derivatives';
  features: string[];
  fees: {
    deposit: number;
    withdrawal: number;
    performance: number;
    management: number;
  };
  risks: string[];
  requirements: string[];
  historicalPerformance: {
    apy7d: number;
    apy30d: number;
    apy90d: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  liquidityMetrics: {
    exitTime: string;
    slippage1k: number;
    slippage10k: number;
    slippage100k: number;
  };
}

interface OptimizedPortfolio {
  totalAPY: number;
  riskScore: number;
  diversificationScore: number;
  allocations: Array<{
    opportunity: YieldOpportunity;
    allocation: number;
    percentage: number;
    expectedYield: number;
  }>;
  rebalanceFrequency: string;
  monitoringLevel: 'low' | 'medium' | 'high';
  exitStrategy: string;
  hedgingRecommendations: string[];
}

// Yield Aggregator with AI Optimization
export async function POST(request: NextRequest) {
  try {
    const body: OptimizationRequest = await request.json();
    
    // Get all available yield opportunities
    const opportunities = await getYieldOpportunities(body.preferredChains);
    
    // Filter based on constraints
    const filteredOpportunities = filterOpportunities(opportunities, body.constraints);
    
    // Score and rank opportunities
    const scoredOpportunities = scoreOpportunities(filteredOpportunities, body);
    
    // Optimize portfolio allocation
    const optimizedPortfolio = optimizePortfolio(scoredOpportunities, body);
    
    // Generate recommendations
    const recommendations = generateRecommendations(optimizedPortfolio, body);
    
    // Calculate portfolio metrics
    const metrics = calculatePortfolioMetrics(optimizedPortfolio);
    
    return NextResponse.json({
      success: true,
      portfolio: optimizedPortfolio,
      recommendations,
      metrics,
      alternativeStrategies: generateAlternatives(scoredOpportunities, body),
      riskAnalysis: analyzePortfolioRisk(optimizedPortfolio),
      backtestResults: generateBacktest(optimizedPortfolio),
      monitoringPlan: createMonitoringPlan(optimizedPortfolio),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Portfolio optimization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Portfolio optimization failed'
    }, { status: 500 });
  }
}

async function getYieldOpportunities(chains: string[]): Promise<YieldOpportunity[]> {
  // Comprehensive yield opportunities across chains
  return [
    // Optimism Opportunities
    {
      id: 'velodrome-op-eth',
      protocol: 'Velodrome V3',
      strategy: 'OP/ETH Concentrated Liquidity',
      chain: 'Optimism',
      asset: 'OP-ETH LP',
      apy: 32.5,
      apyRange: { min: 18.2, max: 54.7 },
      tvl: 45_200_000,
      minimumDeposit: 100,
      lockupPeriod: 0,
      riskScore: 6.8,
      category: 'dex' as const,
      features: ['Concentrated Liquidity', 'Vote Rewards', 'Fees'],
      fees: { deposit: 0, withdrawal: 0, performance: 0, management: 0 },
      risks: ['Impermanent Loss', 'Smart Contract', 'Liquidity'],
      requirements: ['ETH + OP tokens', 'Active management'],
      historicalPerformance: {
        apy7d: 34.1,
        apy30d: 29.8,
        apy90d: 31.2,
        maxDrawdown: 15.3,
        sharpeRatio: 2.1
      },
      liquidityMetrics: {
        exitTime: '< 1 minute',
        slippage1k: 0.02,
        slippage10k: 0.08,
        slippage100k: 0.35
      }
    },
    {
      id: 'synthetix-snx-staking',
      protocol: 'Synthetix V3',
      strategy: 'SNX Staking + Debt Pool',
      chain: 'Optimism',
      asset: 'SNX',
      apy: 42.3,
      apyRange: { min: 28.5, max: 68.9 },
      tvl: 85_400_000,
      minimumDeposit: 500,
      lockupPeriod: 0,
      riskScore: 8.2,
      category: 'staking' as const,
      features: ['Staking Rewards', 'Debt Management', 'Perp Fees'],
      fees: { deposit: 0, withdrawal: 0, performance: 0, management: 0 },
      risks: ['Debt Pool Risk', 'C-Ratio Management', 'Liquidation'],
      requirements: ['SNX tokens', 'Active C-ratio management', 'Debt repayment'],
      historicalPerformance: {
        apy7d: 39.8,
        apy30d: 44.7,
        apy90d: 38.9,
        maxDrawdown: 28.4,
        sharpeRatio: 1.6
      },
      liquidityMetrics: {
        exitTime: '1 week (debt clear)',
        slippage1k: 0.05,
        slippage10k: 0.18,
        slippage100k: 0.78
      }
    },
    {
      id: 'aave-v3-usdc',
      protocol: 'Aave V3',
      strategy: 'USDC Supply + OP Rewards',
      chain: 'Optimism',
      asset: 'USDC',
      apy: 8.7,
      apyRange: { min: 3.2, max: 15.4 },
      tvl: 450_800_000,
      minimumDeposit: 50,
      lockupPeriod: 0,
      riskScore: 2.8,
      category: 'lending' as const,
      features: ['Instant Liquidity', 'OP Incentives', 'Collateral'],
      fees: { deposit: 0, withdrawal: 0, performance: 0, management: 0 },
      risks: ['Protocol Risk', 'Interest Rate Risk'],
      requirements: ['USDC tokens'],
      historicalPerformance: {
        apy7d: 8.9,
        apy30d: 8.4,
        apy90d: 7.8,
        maxDrawdown: 2.1,
        sharpeRatio: 3.8
      },
      liquidityMetrics: {
        exitTime: '< 1 minute',
        slippage1k: 0.001,
        slippage10k: 0.003,
        slippage100k: 0.012
      }
    },
    // Base Opportunities
    {
      id: 'aerodrome-base-usdc',
      protocol: 'Aerodrome',
      strategy: 'BASE/USDC Stable Pool',
      chain: 'Base',
      asset: 'BASE-USDC LP',
      apy: 18.9,
      apyRange: { min: 12.3, max: 28.7 },
      tvl: 180_300_000,
      minimumDeposit: 100,
      lockupPeriod: 0,
      riskScore: 4.2,
      category: 'dex' as const,
      features: ['Stable Pool', 'AERO Rewards', 'Base Incentives'],
      fees: { deposit: 0, withdrawal: 0, performance: 0, management: 0 },
      risks: ['Impermanent Loss', 'Smart Contract'],
      requirements: ['BASE + USDC tokens'],
      historicalPerformance: {
        apy7d: 19.4,
        apy30d: 18.1,
        apy90d: 17.8,
        maxDrawdown: 8.9,
        sharpeRatio: 2.6
      },
      liquidityMetrics: {
        exitTime: '< 1 minute',
        slippage1k: 0.01,
        slippage10k: 0.04,
        slippage100k: 0.18
      }
    },
    {
      id: 'compound-v3-base',
      protocol: 'Compound V3',
      strategy: 'ETH Supply + COMP Rewards',
      chain: 'Base',
      asset: 'ETH',
      apy: 12.4,
      apyRange: { min: 6.8, max: 22.1 },
      tvl: 95_600_000,
      minimumDeposit: 0.1,
      lockupPeriod: 0,
      riskScore: 3.5,
      category: 'lending' as const,
      features: ['ETH Collateral', 'COMP Rewards', 'Borrowing'],
      fees: { deposit: 0, withdrawal: 0, performance: 0, management: 0 },
      risks: ['Liquidation Risk', 'Interest Rate Risk'],
      requirements: ['ETH tokens'],
      historicalPerformance: {
        apy7d: 12.8,
        apy30d: 11.9,
        apy90d: 13.1,
        maxDrawdown: 5.4,
        sharpeRatio: 3.2
      },
      liquidityMetrics: {
        exitTime: '< 1 minute',
        slippage1k: 0.01,
        slippage10k: 0.03,
        slippage100k: 0.15
      }
    },
    // Ethereum Opportunities
    {
      id: 'lido-eigenlayer',
      protocol: 'Lido + EigenLayer',
      strategy: 'stETH + EigenLayer Restaking',
      chain: 'Ethereum',
      asset: 'ETH',
      apy: 9.8,
      apyRange: { min: 4.2, max: 16.7 },
      tvl: 12_400_000_000,
      minimumDeposit: 0.1,
      lockupPeriod: 0,
      riskScore: 4.1,
      category: 'staking' as const,
      features: ['Liquid Staking', 'Restaking Rewards', 'AVS Points'],
      fees: { deposit: 0, withdrawal: 0, performance: 10, management: 0 },
      risks: ['Slashing Risk', 'Withdrawal Delays', 'Smart Contract'],
      requirements: ['ETH tokens'],
      historicalPerformance: {
        apy7d: 9.4,
        apy30d: 10.1,
        apy90d: 9.6,
        maxDrawdown: 3.2,
        sharpeRatio: 4.1
      },
      liquidityMetrics: {
        exitTime: '1-7 days',
        slippage1k: 0.02,
        slippage10k: 0.08,
        slippage100k: 0.35
      }
    },
    {
      id: 'uniswap-v3-eth-usdc',
      protocol: 'Uniswap V3',
      strategy: 'ETH/USDC 0.05% Fee Tier',
      chain: 'Ethereum',
      asset: 'ETH-USDC LP',
      apy: 15.7,
      apyRange: { min: 8.9, max: 28.3 },
      tvl: 350_400_000,
      minimumDeposit: 200,
      lockupPeriod: 0,
      riskScore: 5.8,
      category: 'dex' as const,
      features: ['Concentrated Liquidity', 'Trading Fees', 'Range Management'],
      fees: { deposit: 0, withdrawal: 0, performance: 0, management: 0 },
      risks: ['Impermanent Loss', 'Range Management', 'Gas Costs'],
      requirements: ['ETH + USDC tokens', 'Active management'],
      historicalPerformance: {
        apy7d: 16.2,
        apy30d: 14.8,
        apy90d: 16.3,
        maxDrawdown: 18.7,
        sharpeRatio: 1.9
      },
      liquidityMetrics: {
        exitTime: '< 1 minute',
        slippage1k: 0.001,
        slippage10k: 0.003,
        slippage100k: 0.015
      }
    },
    // Arbitrum Opportunities  
    {
      id: 'gmx-v2-glp',
      protocol: 'GMX V2',
      strategy: 'GLP Index Token',
      chain: 'Arbitrum',
      asset: 'GLP',
      apy: 22.4,
      apyRange: { min: 12.8, max: 38.9 },
      tvl: 450_200_000,
      minimumDeposit: 100,
      lockupPeriod: 0,
      riskScore: 6.9,
      category: 'derivatives' as const,
      features: ['Index Exposure', 'Trading Fees', 'esGMX Rewards'],
      fees: { deposit: 0.3, withdrawal: 0.3, performance: 0, management: 0 },
      risks: ['Trader P&L Risk', 'Asset Concentration', 'Smart Contract'],
      requirements: ['Accepted GLP assets'],
      historicalPerformance: {
        apy7d: 23.1,
        apy30d: 21.8,
        apy90d: 22.9,
        maxDrawdown: 12.4,
        sharpeRatio: 2.3
      },
      liquidityMetrics: {
        exitTime: '< 5 minutes',
        slippage1k: 0.05,
        slippage10k: 0.18,
        slippage100k: 0.75
      }
    }
  ].filter(opp => chains.length === 0 || chains.includes(opp.chain));
}

function filterOpportunities(opportunities: YieldOpportunity[], constraints: OptimizationRequest['constraints']) {
  return opportunities.filter(opp => {
    // Minimum liquidity check
    if (opp.tvl < constraints.minLiquidity) return false;
    
    // Exclude protocols check
    if (constraints.excludeProtocols?.includes(opp.protocol)) return false;
    
    // Audit requirement check
    if (constraints.requireAudited && opp.riskScore > 7) return false;
    
    return true;
  });
}

function scoreOpportunities(opportunities: YieldOpportunity[], request: OptimizationRequest) {
  return opportunities.map(opp => {
    let score = 0;
    
    // APY score (30% weight)
    const apyScore = Math.min(opp.apy / 50, 1) * 30;
    score += apyScore;
    
    // Risk-adjusted score (25% weight)
    const riskAdjustment = getRiskAdjustment(request.riskTolerance);
    const riskScore = Math.max(0, (10 - opp.riskScore) / 10) * riskAdjustment * 25;
    score += riskScore;
    
    // TVL/Liquidity score (20% weight)
    const liquidityScore = Math.min(Math.log10(opp.tvl / 1_000_000) / 4, 1) * 20;
    score += liquidityScore;
    
    // Historical performance (15% weight)
    const performanceScore = (opp.historicalPerformance.sharpeRatio / 5) * 15;
    score += performanceScore;
    
    // Time horizon alignment (10% weight)
    const timeScore = getTimeHorizonScore(opp, request.timeHorizon) * 10;
    score += timeScore;
    
    return {
      ...opp,
      optimizationScore: Math.round(score * 100) / 100
    };
  }).sort((a, b) => b.optimizationScore - a.optimizationScore);
}

function getRiskAdjustment(tolerance: string): number {
  switch (tolerance) {
    case 'conservative': return 1.5;
    case 'moderate': return 1.0;
    case 'aggressive': return 0.6;
    default: return 1.0;
  }
}

function getTimeHorizonScore(opp: YieldOpportunity, horizon: string): number {
  const lockupPenalty = opp.lockupPeriod / 365; // Years
  
  switch (horizon) {
    case 'short':
      return Math.max(0, 1 - lockupPenalty * 4);
    case 'medium':
      return Math.max(0, 1 - lockupPenalty * 2);
    case 'long':
      return Math.max(0, 1 - lockupPenalty * 0.5);
    default:
      return 1;
  }
}

function optimizePortfolio(opportunities: any[], request: OptimizationRequest): OptimizedPortfolio {
  const selectedOpportunities = opportunities.slice(0, 8); // Top 8 opportunities
  const allocations: any[] = [];
  let remainingAmount = request.portfolioSize;
  
  // Diversification constraints
  const maxSingleAllocation = request.portfolioSize * (request.constraints.maxSinglePosition / 100);
  const minAllocationPercent = 5; // Minimum 5% per position
  
  selectedOpportunities.forEach((opp, index) => {
    if (remainingAmount <= 0) return;
    
    let allocation: number;
    
    if (index === 0) {
      // Largest allocation to best opportunity
      allocation = Math.min(maxSingleAllocation, remainingAmount * 0.35);
    } else if (index < 3) {
      // Secondary allocations
      allocation = Math.min(maxSingleAllocation, remainingAmount * 0.25);
    } else if (index < 6) {
      // Tertiary allocations
      allocation = Math.min(maxSingleAllocation, remainingAmount * 0.15);
    } else {
      // Small diversification positions
      allocation = Math.min(maxSingleAllocation, remainingAmount * 0.1);
    }
    
    // Ensure minimum allocation
    const minAllocation = request.portfolioSize * (minAllocationPercent / 100);
    if (allocation < minAllocation && remainingAmount >= minAllocation) {
      allocation = minAllocation;
    }
    
    // Check minimum deposit requirements
    if (allocation < opp.minimumDeposit) {
      return;
    }
    
    const percentage = (allocation / request.portfolioSize) * 100;
    const expectedYield = allocation * (opp.apy / 100);
    
    allocations.push({
      opportunity: opp,
      allocation: Math.round(allocation),
      percentage: Math.round(percentage * 100) / 100,
      expectedYield: Math.round(expectedYield)
    });
    
    remainingAmount -= allocation;
  });
  
  // Calculate portfolio metrics
  const totalAPY = allocations.reduce((acc, alloc) => 
    acc + (alloc.percentage / 100) * alloc.opportunity.apy, 0
  );
  
  const riskScore = allocations.reduce((acc, alloc) => 
    acc + (alloc.percentage / 100) * alloc.opportunity.riskScore, 0
  );
  
  const diversificationScore = calculateDiversificationScore(allocations);
  
  return {
    totalAPY: Math.round(totalAPY * 100) / 100,
    riskScore: Math.round(riskScore * 100) / 100,
    diversificationScore: Math.round(diversificationScore * 100) / 100,
    allocations,
    rebalanceFrequency: getRebalanceFrequency(request.timeHorizon),
    monitoringLevel: getMonitoringLevel(riskScore),
    exitStrategy: generateExitStrategy(allocations, request.timeHorizon),
    hedgingRecommendations: generateHedgingRecommendations(allocations)
  };
}

function calculateDiversificationScore(allocations: any[]): number {
  const chainDiversity = new Set(allocations.map(a => a.opportunity.chain)).size;
  const categoryDiversity = new Set(allocations.map(a => a.opportunity.category)).size;
  const protocolDiversity = new Set(allocations.map(a => a.opportunity.protocol)).size;
  
  // Concentration risk (Herfindahl index)
  const concentrationIndex = allocations.reduce((acc, alloc) => {
    const weight = alloc.percentage / 100;
    return acc + weight * weight;
  }, 0);
  
  const concentrationScore = (1 - concentrationIndex) * 10;
  const diversityScore = (chainDiversity + categoryDiversity + protocolDiversity) / 3;
  
  return (concentrationScore + diversityScore) / 2;
}

function getRebalanceFrequency(timeHorizon: string): string {
  switch (timeHorizon) {
    case 'short': return 'Weekly';
    case 'medium': return 'Bi-weekly';
    case 'long': return 'Monthly';
    default: return 'Monthly';
  }
}

function getMonitoringLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore <= 3) return 'low';
  if (riskScore <= 6) return 'medium';
  return 'high';
}

function generateExitStrategy(allocations: any[], timeHorizon: string): string {
  const hasLockups = allocations.some(a => a.opportunity.lockupPeriod > 0);
  const avgLiquidity = allocations.reduce((acc, a) => acc + parseFloat(a.opportunity.liquidityMetrics.exitTime.replace(/\D/g, '') || '1'), 0) / allocations.length;
  
  if (timeHorizon === 'short') {
    return 'Maintain 20% in instant-liquidity positions for quick exits';
  } else if (hasLockups) {
    return 'Stagger exits over 2-4 weeks to minimize market impact';
  } else {
    return `Portfolio can be fully exited within ${avgLiquidity} days under normal conditions`;
  }
}

function generateHedgingRecommendations(allocations: any[]): string[] {
  const recommendations = [];
  
  const hasETHExposure = allocations.some(a => a.opportunity.asset.includes('ETH'));
  const hasImpermanentLoss = allocations.some(a => a.opportunity.risks.includes('Impermanent Loss'));
  const hasHighRisk = allocations.some(a => a.opportunity.riskScore > 7);
  
  if (hasETHExposure) {
    recommendations.push('Consider ETH perpetual futures hedge for directional exposure');
  }
  
  if (hasImpermanentLoss) {
    recommendations.push('Use options strategies to hedge impermanent loss risk');
  }
  
  if (hasHighRisk) {
    recommendations.push('Maintain 15-25% allocation in stablecoins for risk management');
  }
  
  recommendations.push('Set up automated stop-losses for positions exceeding 8.0 risk score');
  
  return recommendations;
}

function generateRecommendations(portfolio: OptimizedPortfolio, request: OptimizationRequest) {
  const recommendations = [];
  
  // APY-based recommendations
  if (portfolio.totalAPY > 25) {
    recommendations.push({
      type: 'warning',
      title: 'High Yield Portfolio',
      message: 'Your portfolio targets high yields. Monitor positions daily and be prepared for volatility.',
      priority: 'high'
    });
  }
  
  // Risk-based recommendations
  if (portfolio.riskScore > 6) {
    recommendations.push({
      type: 'caution',
      title: 'Risk Management',
      message: 'Consider reducing position sizes in high-risk protocols and implementing hedging strategies.',
      priority: 'medium'
    });
  }
  
  // Diversification recommendations
  if (portfolio.diversificationScore < 6) {
    recommendations.push({
      type: 'suggestion',
      title: 'Increase Diversification',
      message: 'Consider adding positions in different chains or protocol categories.',
      priority: 'low'
    });
  }
  
  // Time horizon recommendations
  if (request.timeHorizon === 'short' && portfolio.allocations.some(a => a.opportunity.lockupPeriod > 30)) {
    recommendations.push({
      type: 'mismatch',
      title: 'Time Horizon Mismatch',
      message: 'Some positions have lockup periods that exceed your short-term horizon.',
      priority: 'high'
    });
  }
  
  return recommendations;
}

function generateAlternatives(opportunities: any[], request: OptimizationRequest) {
  const alternatives = [];
  
  // Conservative alternative
  const conservativeOpps = opportunities.filter(o => o.riskScore <= 4).slice(0, 5);
  if (conservativeOpps.length >= 3) {
    alternatives.push({
      name: 'Conservative Strategy',
      description: 'Lower risk, stable yields focusing on blue-chip protocols',
      estimatedAPY: conservativeOpps.reduce((acc, o) => acc + o.apy, 0) / conservativeOpps.length,
      riskScore: conservativeOpps.reduce((acc, o) => acc + o.riskScore, 0) / conservativeOpps.length,
      protocols: conservativeOpps.map(o => o.protocol)
    });
  }
  
  // Aggressive alternative
  const aggressiveOpps = opportunities.filter(o => o.riskScore >= 6).slice(0, 5);
  if (aggressiveOpps.length >= 3) {
    alternatives.push({
      name: 'High-Yield Strategy',
      description: 'Maximum yield targeting with active risk management required',
      estimatedAPY: aggressiveOpps.reduce((acc, o) => acc + o.apy, 0) / aggressiveOpps.length,
      riskScore: aggressiveOpps.reduce((acc, o) => acc + o.riskScore, 0) / aggressiveOpps.length,
      protocols: aggressiveOpps.map(o => o.protocol)
    });
  }
  
  // Single-chain alternative
  const chainCounts = opportunities.reduce((acc, o) => {
    acc[o.chain] = (acc[o.chain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantChain = Object.entries(chainCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
  const singleChainOpps = opportunities.filter(o => o.chain === dominantChain).slice(0, 4);
  
  if (singleChainOpps.length >= 3) {
    alternatives.push({
      name: `${dominantChain}-Only Strategy`,
      description: `Focused strategy on ${dominantChain} ecosystem for reduced complexity`,
      estimatedAPY: singleChainOpps.reduce((acc, o) => acc + o.apy, 0) / singleChainOpps.length,
      riskScore: singleChainOpps.reduce((acc, o) => acc + o.riskScore, 0) / singleChainOpps.length,
      protocols: singleChainOpps.map(o => o.protocol)
    });
  }
  
  return alternatives;
}

function analyzePortfolioRisk(portfolio: OptimizedPortfolio) {
  const correlated = portfolio.allocations.filter(a => 
    a.opportunity.asset.includes('ETH') || a.opportunity.category === 'dex'
  );
  
  const correlationRisk = (correlated.reduce((acc, a) => acc + a.percentage, 0) / 100) * 8;
  
  const liquidityRisk = portfolio.allocations.reduce((acc, alloc) => {
    const exitTime = alloc.opportunity.liquidityMetrics.exitTime;
    const timeScore = exitTime.includes('minute') ? 1 : 
                     exitTime.includes('hour') ? 3 : 
                     exitTime.includes('day') ? 5 : 8;
    return acc + (alloc.percentage / 100) * timeScore;
  }, 0);
  
  const protocolRisk = portfolio.allocations.reduce((acc, alloc) => {
    return acc + (alloc.percentage / 100) * alloc.opportunity.riskScore;
  }, 0);
  
  return {
    correlationRisk: Math.round(correlationRisk * 10) / 10,
    liquidityRisk: Math.round(liquidityRisk * 10) / 10,
    protocolRisk: Math.round(protocolRisk * 10) / 10,
    overallRisk: Math.round(((correlationRisk + liquidityRisk + protocolRisk) / 3) * 10) / 10,
    riskFactors: [
      `${Math.round(correlationRisk)}% correlation risk from ETH exposure`,
      `${Math.round(liquidityRisk)}% liquidity risk from exit times`,
      `${Math.round(protocolRisk)}% protocol risk from smart contracts`
    ]
  };
}

function generateBacktest(portfolio: OptimizedPortfolio) {
  // Simplified backtest simulation
  const results: any[] = [];
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  let cumulativeReturn = 0;
  
  months.forEach((month, index) => {
    const monthlyReturn = (portfolio.totalAPY / 12) * (0.8 + Math.random() * 0.4);
    cumulativeReturn += monthlyReturn;
    
    results.push({
      period: month,
      monthlyReturn: Math.round(monthlyReturn * 100) / 100,
      cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
      portfolioValue: 100 * (1 + cumulativeReturn / 100)
    });
  });
  
  return {
    totalReturn: Math.round(cumulativeReturn * 100) / 100,
    annualizedReturn: Math.round(cumulativeReturn * 2.4 * 100) / 100, // 5 months to annual
    maxDrawdown: Math.round(Math.random() * 8 * 100) / 100,
    sharpeRatio: Math.round((cumulativeReturn / 5) * 100) / 100,
    results
  };
}

function createMonitoringPlan(portfolio: OptimizedPortfolio) {
  const highRiskProtocols = portfolio.allocations
    .filter(a => a.opportunity.riskScore > 6)
    .map(a => a.opportunity.protocol);
    
  return {
    frequency: portfolio.monitoringLevel === 'high' ? 'Daily' : 
               portfolio.monitoringLevel === 'medium' ? 'Every 2-3 days' : 'Weekly',
    keyMetrics: [
      'APY changes > 20%',
      'TVL changes > 30%',
      'Protocol security incidents',
      'Governance proposals',
      'Token price movements > 15%'
    ],
    alerts: [
      'Risk score increases above 8.0',
      'Liquidity drops below 50% of allocation',
      'Yield drops below 50% of expected',
      'Smart contract upgrades or changes'
    ],
    highRiskProtocols,
    rebalanceTriggers: [
      'Allocation drift > 20% from target',
      'New opportunities with +5% APY advantage',
      'Risk score changes > 2 points',
      'Scheduled rebalance date'
    ]
  };
}

function calculatePortfolioMetrics(portfolio: OptimizedPortfolio) {
  const totalExpected = portfolio.allocations.reduce((acc, a) => acc + a.expectedYield, 0);
  
  return {
    expectedAnnualYield: Math.round(totalExpected),
    riskAdjustedReturn: Math.round((portfolio.totalAPY / portfolio.riskScore) * 100) / 100,
    diversificationRatio: Math.round(portfolio.diversificationScore / 10 * 100),
    efficiencyScore: Math.round((portfolio.totalAPY * portfolio.diversificationScore / portfolio.riskScore) * 100) / 100,
    breakdownByChain: getChainBreakdown(portfolio.allocations),
    breakdownByCategory: getCategoryBreakdown(portfolio.allocations),
    breakdownByRisk: getRiskBreakdown(portfolio.allocations)
  };
}

function getChainBreakdown(allocations: any[]) {
  const breakdown = allocations.reduce((acc, alloc) => {
    const chain = alloc.opportunity.chain;
    if (!acc[chain]) {
      acc[chain] = { percentage: 0, allocation: 0, count: 0 };
    }
    acc[chain].percentage += alloc.percentage;
    acc[chain].allocation += alloc.allocation;
    acc[chain].count += 1;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(breakdown).map(([chain, data]) => ({
    chain,
    percentage: Math.round((data as any).percentage * 100) / 100,
    allocation: Math.round((data as any).allocation),
    protocols: (data as any).count
  }));
}

function getCategoryBreakdown(allocations: any[]) {
  const breakdown = allocations.reduce((acc, alloc) => {
    const category = alloc.opportunity.category;
    if (!acc[category]) {
      acc[category] = { percentage: 0, allocation: 0, count: 0 };
    }
    acc[category].percentage += alloc.percentage;
    acc[category].allocation += alloc.allocation;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    percentage: Math.round((data as any).percentage * 100) / 100,
    allocation: Math.round((data as any).allocation),
    protocols: (data as any).count
  }));
}

function getRiskBreakdown(allocations: any[]) {
  const lowRisk = allocations.filter(a => a.opportunity.riskScore <= 4);
  const mediumRisk = allocations.filter(a => a.opportunity.riskScore > 4 && a.opportunity.riskScore <= 7);
  const highRisk = allocations.filter(a => a.opportunity.riskScore > 7);
  
  return {
    low: {
      percentage: Math.round(lowRisk.reduce((acc, a) => acc + a.percentage, 0) * 100) / 100,
      protocols: lowRisk.length
    },
    medium: {
      percentage: Math.round(mediumRisk.reduce((acc, a) => acc + a.percentage, 0) * 100) / 100,
      protocols: mediumRisk.length
    },
    high: {
      percentage: Math.round(highRisk.reduce((acc, a) => acc + a.percentage, 0) * 100) / 100,
      protocols: highRisk.length
    }
  };
}