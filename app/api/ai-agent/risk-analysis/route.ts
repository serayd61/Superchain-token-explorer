import { NextRequest, NextResponse } from 'next/server';

interface RiskAnalysisRequest {
  address?: string;
  protocols: string[];
  positions: {
    protocol: string;
    chain: string;
    amount: number;
    asset: string;
    duration: number;
  }[];
  totalValue: number;
}

interface RiskFactor {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  mitigation: string;
  impact: string;
}

// AI Agent: Gelişmiş Risk Analizi Sistemi
export async function POST(request: NextRequest) {
  try {
    const body: RiskAnalysisRequest = await request.json();
    
    // Çok boyutlu risk analizi
    const riskFactors = await analyzeRiskFactors(body);
    const portfolioRisk = calculatePortfolioRisk(body.positions);
    const liquidityRisk = assessLiquidityRisk(body.positions);
    const protocolRisk = evaluateProtocolRisk(body.protocols);
    const marketRisk = assessMarketRisk(body.positions);
    
    // AI-powered risk scoring
    const aiRiskScore = calculateAIRiskScore(riskFactors, portfolioRisk);
    
    // Real-time monitoring alerts
    const alerts = generateRiskAlerts(riskFactors);
    
    // Hedge suggestions
    const hedgeStrategies = suggestHedgeStrategies(riskFactors, body.positions);
    
    return NextResponse.json({
      success: true,
      analysis: {
        overallRiskScore: aiRiskScore,
        riskLevel: getRiskLevel(aiRiskScore),
        riskFactors,
        portfolioRisk,
        liquidityRisk,
        protocolRisk,
        marketRisk
      },
      alerts,
      recommendations: {
        immediate: getImmediateActions(riskFactors),
        shortTerm: getShortTermActions(riskFactors),
        longTerm: getLongTermActions(riskFactors)
      },
      hedgeStrategies,
      monitoring: {
        frequency: getMonitoringFrequency(aiRiskScore),
        keyMetrics: getKeyMetrics(body.positions),
        triggers: getRiskTriggers(aiRiskScore)
      }
    });
    
  } catch (error) {
    console.error('Risk analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Risk analysis failed'
    }, { status: 500 });
  }
}

async function analyzeRiskFactors(body: RiskAnalysisRequest): Promise<RiskFactor[]> {
  const factors: RiskFactor[] = [];
  
  // Smart Contract Risk Analysis
  const contractRisk = assessContractRisk(body.protocols);
  factors.push({
    category: 'Smart Contract Risk',
    severity: contractRisk.severity,
    score: contractRisk.score,
    description: contractRisk.description,
    mitigation: 'Diversify across multiple audited protocols, monitor TVL changes',
    impact: 'Potential total loss of funds in affected protocols'
  });
  
  // Liquidity Risk
  const liquidityRisk = assessDetailedLiquidityRisk(body.positions);
  factors.push({
    category: 'Liquidity Risk',
    severity: liquidityRisk.severity,
    score: liquidityRisk.score,
    description: liquidityRisk.description,
    mitigation: 'Maintain positions in high-TVL pools, set up exit strategies',
    impact: 'Difficulty exiting positions, high slippage costs'
  });
  
  // Impermanent Loss Risk
  const ilRisk = calculateImpermanentLossRisk(body.positions);
  factors.push({
    category: 'Impermanent Loss',
    severity: ilRisk.severity,
    score: ilRisk.score,
    description: ilRisk.description,
    mitigation: 'Use stable pairs, hedge with derivatives, monitor correlations',
    impact: 'Loss relative to holding underlying assets'
  });
  
  // Concentration Risk
  const concentrationRisk = assessConcentrationRisk(body.positions);
  factors.push({
    category: 'Concentration Risk',
    severity: concentrationRisk.severity,
    score: concentrationRisk.score,
    description: concentrationRisk.description,
    mitigation: 'Diversify across chains, protocols, and asset classes',
    impact: 'High correlation during market stress events'
  });
  
  // Governance Risk
  const govRisk = assessGovernanceRisk(body.protocols);
  factors.push({
    category: 'Governance Risk',
    severity: govRisk.severity,
    score: govRisk.score,
    description: govRisk.description,
    mitigation: 'Monitor governance proposals, participate in voting',
    impact: 'Sudden protocol changes affecting positions'
  });
  
  return factors;
}

function assessContractRisk(protocols: string[]) {
  const riskProfile = {
    'Aave': { score: 2, audit: 'A+', tvl: 'High' },
    'Compound': { score: 2, audit: 'A+', tvl: 'High' },
    'Uniswap': { score: 2, audit: 'A+', tvl: 'High' },
    'Curve': { score: 3, audit: 'A', tvl: 'High' },
    'Velodrome': { score: 4, audit: 'B+', tvl: 'Medium' },
    'Aerodrome': { score: 4, audit: 'B+', tvl: 'Medium' },
    'GMX': { score: 5, audit: 'B', tvl: 'Medium' },
    'Synthetix': { score: 6, audit: 'B', tvl: 'Medium' }
  };
  
  const avgScore = protocols.reduce((acc, p) => {
    const risk = riskProfile[p as keyof typeof riskProfile];
    return acc + (risk?.score || 7);
  }, 0) / protocols.length;
  
  return {
    severity: avgScore <= 3 ? 'low' as const : avgScore <= 5 ? 'medium' as const : 'high' as const,
    score: avgScore,
    description: `Average protocol risk score: ${avgScore.toFixed(1)}/10. ${protocols.length} protocols analyzed.`
  };
}

function assessDetailedLiquidityRisk(positions: any[]) {
  const liquidityScores = positions.map(pos => {
    const chainLiquidity = {
      'Ethereum': 1,
      'Optimism': 2,
      'Arbitrum': 2,
      'Base': 3,
      'Polygon': 3,
      'BSC': 4
    };
    
    const protocolLiquidity = pos.amount > 10000 ? 1 : pos.amount > 1000 ? 2 : 3;
    return (chainLiquidity[pos.chain as keyof typeof chainLiquidity] || 4) + protocolLiquidity;
  });
  
  const avgScore = liquidityScores.reduce((a, b) => a + b, 0) / liquidityScores.length;
  
  return {
    severity: avgScore <= 3 ? 'low' as const : avgScore <= 5 ? 'medium' as const : 'high' as const,
    score: avgScore,
    description: `Portfolio liquidity score: ${avgScore.toFixed(1)}/8. Consider exit timing and market conditions.`
  };
}

function calculateImpermanentLossRisk(positions: any[]) {
  const ilRisk = positions.reduce((acc, pos) => {
    if (pos.asset.includes('/')) {
      const [token1, token2] = pos.asset.split('/');
      if (token1 === token2 || 
          ['USDC', 'USDT', 'DAI'].includes(token1) && ['USDC', 'USDT', 'DAI'].includes(token2)) {
        return acc + 1; // Stable pairs
      } else if (['ETH', 'WETH'].includes(token1) || ['ETH', 'WETH'].includes(token2)) {
        return acc + 4; // ETH pairs
      } else {
        return acc + 6; // Volatile pairs
      }
    }
    return acc + 2; // Single assets
  }, 0) / positions.length;
  
  return {
    severity: ilRisk <= 2 ? 'low' as const : ilRisk <= 4 ? 'medium' as const : 'high' as const,
    score: ilRisk,
    description: `Average IL risk: ${ilRisk.toFixed(1)}/6. Higher scores indicate more volatile asset pairs.`
  };
}

function assessConcentrationRisk(positions: any[]) {
  const chainCount = new Set(positions.map(p => p.chain)).size;
  const protocolCount = new Set(positions.map(p => p.protocol)).size;
  const assetCount = new Set(positions.map(p => p.asset)).size;
  
  const maxPosition = Math.max(...positions.map(p => p.amount));
  const totalValue = positions.reduce((acc, p) => acc + p.amount, 0);
  const concentrationRatio = maxPosition / totalValue;
  
  let score = 0;
  if (chainCount < 3) score += 2;
  if (protocolCount < 4) score += 2;
  if (assetCount < 5) score += 2;
  if (concentrationRatio > 0.5) score += 3;
  if (concentrationRatio > 0.3) score += 1;
  
  return {
    severity: score <= 3 ? 'low' as const : score <= 6 ? 'medium' as const : 'high' as const,
    score,
    description: `Concentration across ${chainCount} chains, ${protocolCount} protocols. Max position: ${(concentrationRatio * 100).toFixed(1)}%`
  };
}

function assessGovernanceRisk(protocols: string[]) {
  const governanceRisk = {
    'Aave': 2,
    'Compound': 2,
    'Uniswap': 3,
    'Curve': 4,
    'Velodrome': 5,
    'Aerodrome': 5,
    'GMX': 6,
    'Synthetix': 6
  };
  
  const avgRisk = protocols.reduce((acc, p) => {
    return acc + (governanceRisk[p as keyof typeof governanceRisk] || 7);
  }, 0) / protocols.length;
  
  return {
    severity: avgRisk <= 3 ? 'low' as const : avgRisk <= 5 ? 'medium' as const : 'high' as const,
    score: avgRisk,
    description: `Governance risk score: ${avgRisk.toFixed(1)}/10. Monitor voting patterns and proposal impacts.`
  };
}

function calculatePortfolioRisk(positions: any[]) {
  const totalValue = positions.reduce((acc, p) => acc + p.amount, 0);
  const correlationRisk = calculateCorrelationRisk(positions);
  const volatilityRisk = calculateVolatilityRisk(positions);
  
  return {
    totalExposure: totalValue,
    correlationRisk: correlationRisk,
    volatilityRisk: volatilityRisk,
    valueAtRisk: calculateVaR(positions),
    maxDrawdown: estimateMaxDrawdown(positions)
  };
}

function calculateCorrelationRisk(positions: any[]) {
  // Simplified correlation analysis
  const assetTypes = positions.map(p => {
    if (p.asset.includes('ETH')) return 'ETH';
    if (['USDC', 'USDT', 'DAI'].some(stable => p.asset.includes(stable))) return 'STABLE';
    return 'ALT';
  });
  
  const typeCount = new Set(assetTypes).size;
  return typeCount === 1 ? 8 : typeCount === 2 ? 5 : 3;
}

function calculateVolatilityRisk(positions: any[]) {
  // Asset volatility estimates
  const volatilities = positions.map(p => {
    if (p.asset.includes('ETH')) return 0.8;
    if (['USDC', 'USDT', 'DAI'].some(stable => p.asset.includes(stable))) return 0.1;
    return 1.2; // Alt coins
  });
  
  const weightedVol = positions.reduce((acc, p, idx) => {
    const weight = p.amount / positions.reduce((sum, pos) => sum + pos.amount, 0);
    return acc + weight * volatilities[idx];
  }, 0);
  
  return Math.round(weightedVol * 100) / 100;
}

function calculateVaR(positions: any[]) {
  // 95% Value at Risk estimation
  const totalValue = positions.reduce((acc, p) => acc + p.amount, 0);
  const portfolioVolatility = calculateVolatilityRisk(positions);
  return Math.round(totalValue * portfolioVolatility * 1.65 * 100) / 100; // 95% confidence
}

function estimateMaxDrawdown(positions: any[]) {
  const portfolioVolatility = calculateVolatilityRisk(positions);
  return Math.round(portfolioVolatility * 2.5 * 100); // Rough estimate in %
}

function assessLiquidityRisk(positions: any[]) {
  return {
    averageExitTime: estimateExitTime(positions),
    slippageCost: estimateSlippage(positions),
    emergencyExitCost: estimateEmergencyExit(positions)
  };
}

function estimateExitTime(positions: any[]) {
  const exitTimes = positions.map(p => {
    if (p.amount > 100000) return '2-4 hours';
    if (p.amount > 10000) return '30-60 minutes';
    return '5-15 minutes';
  });
  
  return exitTimes[0] || '5-15 minutes';
}

function estimateSlippage(positions: any[]) {
  const totalValue = positions.reduce((acc, p) => acc + p.amount, 0);
  if (totalValue > 1000000) return '2-5%';
  if (totalValue > 100000) return '0.5-2%';
  return '0.1-0.5%';
}

function estimateEmergencyExit(positions: any[]) {
  const totalValue = positions.reduce((acc, p) => acc + p.amount, 0);
  return Math.round(totalValue * 0.05 * 100) / 100; // 5% emergency exit cost
}

function evaluateProtocolRisk(protocols: string[]) {
  return {
    auditStatus: getAuditStatus(protocols),
    upgradeability: getUpgradeRisk(protocols),
    teamTransparency: getTeamRisk(protocols),
    tokenomics: getTokenomicsRisk(protocols)
  };
}

function getAuditStatus(protocols: string[]) {
  const auditGrades = protocols.map(p => {
    const grades = {
      'Aave': 'A+',
      'Compound': 'A+',
      'Uniswap': 'A+',
      'Curve': 'A',
      'Velodrome': 'B+',
      'Aerodrome': 'B+',
      'GMX': 'B',
      'Synthetix': 'B'
    };
    return grades[p as keyof typeof grades] || 'C';
  });
  
  return auditGrades;
}

function getUpgradeRisk(protocols: string[]) {
  // Simplified upgrade risk assessment
  return protocols.map(p => {
    const isUpgradeable = ['Aave', 'Compound', 'Synthetix'].includes(p);
    return isUpgradeable ? 'Upgradeable' : 'Immutable';
  });
}

function getTeamRisk(protocols: string[]) {
  return protocols.map(p => ({
    protocol: p,
    transparency: 'High',
    track_record: 'Proven',
    decentralization: p === 'Uniswap' ? 'High' : 'Medium'
  }));
}

function getTokenomicsRisk(protocols: string[]) {
  return protocols.map(p => ({
    protocol: p,
    inflation: 'Controlled',
    utility: 'Governance + Rewards',
    distribution: 'Fair'
  }));
}

function assessMarketRisk(positions: any[]) {
  return {
    marketCorrelation: 0.75,
    sectorConcentration: 'DeFi',
    macroSensitivity: 'High',
    seasonality: 'Q4 typically stronger'
  };
}

function calculateAIRiskScore(factors: RiskFactor[], portfolioRisk: any) {
  const factorScore = factors.reduce((acc, f) => acc + f.score, 0) / factors.length;
  const portfolioMultiplier = portfolioRisk.correlationRisk / 10 + portfolioRisk.volatilityRisk;
  
  return Math.min(10, Math.round((factorScore + portfolioMultiplier) * 10) / 10);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  if (score <= 8) return 'high';
  return 'critical';
}

function generateRiskAlerts(factors: RiskFactor[]) {
  const alerts: any[] = [];
  
  factors.forEach(factor => {
    if (factor.severity === 'critical' || factor.severity === 'high') {
      alerts.push({
        type: 'warning',
        category: factor.category,
        message: `High ${factor.category.toLowerCase()} detected`,
        action: factor.mitigation,
        priority: factor.severity === 'critical' ? 1 : 2
      });
    }
  });
  
  return alerts.sort((a, b) => a.priority - b.priority);
}

function getImmediateActions(factors: RiskFactor[]) {
  const actions = [];
  
  factors.forEach(factor => {
    if (factor.severity === 'critical') {
      actions.push(`URGENT: Address ${factor.category} - ${factor.mitigation}`);
    }
  });
  
  if (actions.length === 0) {
    actions.push('Monitor key risk metrics daily');
    actions.push('Set up price alerts for major positions');
  }
  
  return actions;
}

function getShortTermActions(factors: RiskFactor[]) {
  return [
    'Review and rebalance portfolio allocation',
    'Implement partial hedging strategies',
    'Monitor governance proposals across protocols',
    'Set up automated risk monitoring alerts'
  ];
}

function getLongTermActions(factors: RiskFactor[]) {
  return [
    'Diversify across additional chains and protocols',
    'Develop systematic risk management framework',
    'Build emergency exit procedures',
    'Consider professional risk management tools'
  ];
}

function suggestHedgeStrategies(factors: RiskFactor[], positions: any[]) {
  const strategies = [];
  
  // Impermanent Loss Hedging
  if (factors.some(f => f.category === 'Impermanent Loss' && f.severity === 'high')) {
    strategies.push({
      type: 'Impermanent Loss Hedge',
      description: 'Use perpetual futures to hedge price divergence',
      implementation: 'Short ETH perps when providing ETH/ALT liquidity',
      cost: '0.1-0.3% annually',
      effectiveness: '70-90%'
    });
  }
  
  // Portfolio Hedging
  if (factors.some(f => f.category === 'Concentration Risk')) {
    strategies.push({
      type: 'Portfolio Diversification',
      description: 'Add uncorrelated assets and strategies',
      implementation: 'Include stablecoin strategies, different chains',
      cost: 'Opportunity cost',
      effectiveness: '80-95%'
    });
  }
  
  // Liquidity Hedging
  strategies.push({
    type: 'Liquidity Buffer',
    description: 'Maintain 10-20% in liquid assets',
    implementation: 'Keep funds in high-liquidity protocols',
    cost: 'Lower yields',
    effectiveness: '100%'
  });
  
  return strategies;
}

function getMonitoringFrequency(riskScore: number) {
  if (riskScore > 7) return 'Daily';
  if (riskScore > 5) return 'Every 2-3 days';
  if (riskScore > 3) return 'Weekly';
  return 'Bi-weekly';
}

function getKeyMetrics(positions: any[]) {
  return [
    'TVL changes in protocols',
    'Utilization rates',
    'Token price correlations',
    'Gas costs',
    'Governance proposals',
    'Protocol yields',
    'Market volatility'
  ];
}

function getRiskTriggers(riskScore: number) {
  const baseTriggers = [
    'Protocol TVL drops >30%',
    'Yield changes >50%',
    'Major governance changes',
    'Smart contract vulnerabilities'
  ];
  
  if (riskScore > 6) {
    baseTriggers.push('Daily position value >10% change');
    baseTriggers.push('Correlation spike >0.9');
  }
  
  return baseTriggers;
}