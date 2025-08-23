// app/api/intent/parse/route.ts - IMPROVED VERSION
import { NextRequest, NextResponse } from 'next/server';

interface UserIntent {
  originalText: string;
  detectedLanguage: string;
  translatedText: string;
  intentType: 'yield' | 'swap' | 'arbitrage' | 'hedge' | 'bridge' | 'portfolio' | 'unknown';
  parameters: {
    amount?: number;
    fromToken?: string;
    toToken?: string;
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    timeframe?: 'short' | 'medium' | 'long';
    targetYield?: number;
    networks?: string[];
    currency?: string;
  };
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
  riskAssessment: {
    score: number;
    factors: string[];
    warnings: string[];
  };
  estimatedGas: string;
  timeToExecute: string;
  contradictions?: string[];
}

interface DeFiProtocol {
  name: string;
  network: string;
  type: 'dex' | 'lending' | 'yield' | 'bridge';
  apy: number;
  tvl: string;
  riskScore: number; // 1-10
  contractAddress: string;
  isActive: boolean;
  category: 'conservative' | 'moderate' | 'aggressive';
  description: string;
  minAmount?: number;
}

// ENHANCED PROTOCOL DATABASE
const ENHANCED_PROTOCOLS: DeFiProtocol[] = [
  // CONSERVATIVE PROTOCOLS (Risk 1-3)
  {
    name: 'Compound Base',
    network: 'base',
    type: 'lending',
    apy: 6.8,
    tvl: '890M',
    riskScore: 1,
    category: 'conservative',
    contractAddress: '0x...',
    isActive: true,
    description: 'Blue-chip lending protocol with proven track record',
    minAmount: 100
  },
  {
    name: 'Aave V3 OP',
    network: 'optimism',
    type: 'lending',
    apy: 7.2,
    tvl: '1.2B',
    riskScore: 2,
    category: 'conservative',
    contractAddress: '0x...',
    isActive: true,
    description: 'Established lending protocol with insurance coverage',
    minAmount: 100
  },
  {
    name: 'Moonwell',
    network: 'base',
    type: 'lending',
    apy: 8.4,
    tvl: '650M',
    riskScore: 3,
    category: 'conservative',
    contractAddress: '0x...',
    isActive: true,
    description: 'Audited lending protocol optimized for Base',
    minAmount: 50
  },
  
  // MODERATE PROTOCOLS (Risk 4-6)
  {
    name: 'Aerodrome',
    network: 'base',
    type: 'dex',
    apy: 12.5,
    tvl: '2.8B',
    riskScore: 4,
    category: 'moderate',
    contractAddress: '0x...',
    isActive: true,
    description: 'Leading DEX on Base with concentrated liquidity',
    minAmount: 500
  },
  {
    name: 'Velodrome',
    network: 'optimism',
    type: 'dex',
    apy: 15.8,
    tvl: '2.1B',
    riskScore: 5,
    category: 'moderate',
    contractAddress: '0x...',
    isActive: true,
    description: 'Next-generation AMM with ve(3,3) tokenomics',
    minAmount: 1000
  },
  
  // AGGRESSIVE PROTOCOLS (Risk 7-10)
  {
    name: 'Camelot',
    network: 'arbitrum',
    type: 'dex',
    apy: 18.3,
    tvl: '1.5B',
    riskScore: 7,
    category: 'aggressive',
    contractAddress: '0x...',
    isActive: true,
    description: 'High-yield DEX with innovative features',
    minAmount: 1000
  },
  {
    name: 'GMX V2',
    network: 'arbitrum',
    type: 'yield',
    apy: 22.7,
    tvl: '800M',
    riskScore: 8,
    category: 'aggressive',
    contractAddress: '0x...',
    isActive: true,
    description: 'High-risk perpetual trading protocol',
    minAmount: 2000
  }
];

function detectLanguage(input: string): string {
  const lowerInput = input.toLowerCase();
  
  const turkishIndicators = ['bana', 'en', 'faiz', 'getiri', 'bul', 'proje', 'için', 'ile', 've', 'bir', 'güvenli'];
  const turkishScore = turkishIndicators.filter(word => lowerInput.includes(word)).length;
  
  const germanIndicators = ['ich', 'möchte', 'finden', 'beste', 'mit', 'und', 'für', 'der', 'die', 'das', 'sicher'];
  const germanScore = germanIndicators.filter(word => lowerInput.includes(word)).length;
  
  const frenchIndicators = ['je', 'veux', 'trouve', 'meilleur', 'avec', 'et', 'pour', 'le', 'la', 'les', 'sûr'];
  const frenchScore = frenchIndicators.filter(word => lowerInput.includes(word)).length;
  
  if (turkishScore >= 2 || turkishScore > germanScore && turkishScore > frenchScore) {
    return 'turkish';
  } else if (germanScore >= 2 || germanScore > frenchScore) {
    return 'german';
  } else if (frenchScore >= 2) {
    return 'french';
  }
  
  return 'english';
}

function translateToEnglish(input: string, detectedLanguage: string): string {
  if (detectedLanguage === 'english') return input;
  
  let translated = input.toLowerCase();
  
  const translations: Record<string, string> = {
    // Turkish
    'faiz': 'yield', 'getiri': 'yield', 'kazanç': 'earn', 'bul': 'find',
    'en': 'best', 'yüksek': 'high', 'güvenli': 'safe', 'proje': 'project',
    'strateji': 'strategy', 'düşük': 'low', 'risk': 'risk',
    
    // German  
    'zinsen': 'yield', 'ertrag': 'yield', 'rendite': 'yield', 'finden': 'find',
    'beste': 'best', 'sicher': 'safe', 'projekte': 'projects', 'hoch': 'high',
    
    // French
    'rendement': 'yield', 'profit': 'yield', 'trouve': 'find', 'meilleur': 'best',
    'projets': 'projects', 'sûr': 'safe', 'élevé': 'high'
  };
  
  Object.entries(translations).forEach(([foreign, english]) => {
    const regex = new RegExp('\\b' + foreign + '\\b', 'gi');
    translated = translated.replace(regex, english);
  });
  
  return translated;
}

class ImprovedSmartParser {
  
  async parseUserIntent(userInput: string): Promise<UserIntent> {
    const startTime = Date.now();
    
    try {
      console.log(`🧠 Improved parsing: "${userInput}"`);
      
      const detectedLanguage = detectLanguage(userInput);
      const translatedText = translateToEnglish(userInput, detectedLanguage);
      
      const intent = this.analyzeIntent(userInput, translatedText, detectedLanguage);
      const protocols = this.smartProtocolMatching(intent);
      const enhancedIntent = this.enhanceWithSmartRecommendations(intent, protocols);
      
      enhancedIntent.detectedLanguage = detectedLanguage;
      enhancedIntent.translatedText = translatedText;
      
      console.log(`✅ Improved parsing completed in ${Date.now() - startTime}ms`);
      return enhancedIntent;
      
    } catch (error) {
      console.error('❌ Improved parsing failed:', error);
      return this.getFallbackIntent(userInput);
    }
  }
  
  private analyzeIntent(originalText: string, translatedText: string, language: string): UserIntent {
    const input = translatedText.toLowerCase();
    const original = originalText.toLowerCase();
    
    // ENHANCED INTENT DETECTION
    let intentType: UserIntent['intentType'] = 'unknown';
    let intentScore = 0;
    
    // YIELD DETECTION - More comprehensive
    const yieldKeywords = [
      'earn', 'yield', 'apy', 'interest', 'income', 'profit', 'return', 'gains',
      'make money', 'passive income', 'farming', 'lending', 'staking', 'best', 
      'strategy', 'investment', 'grow', 'generate'
    ];
    
    const yieldScore = yieldKeywords.filter(keyword => 
      input.includes(keyword) || original.includes(keyword)
    ).length;
    
    if (input.match(/(\d+)\s*%/) || input.includes('apy') || yieldScore > 0) {
      intentType = 'yield';
      intentScore = yieldScore + (input.includes('%') ? 2 : 0);
    }
    
    // OTHER INTENT TYPES...
    const swapKeywords = ['swap', 'exchange', 'convert', 'trade', 'change'];
    const swapScore = swapKeywords.filter(k => input.includes(k) || original.includes(k)).length;
    
    if (swapScore > intentScore) {
      intentType = 'swap';
      intentScore = swapScore;
    }
    
    // FALLBACK LOGIC
    if (intentType === 'unknown') {
      const financialKeywords = ['money', 'crypto', 'defi', 'investment', 'strategy', 'protocol'];
      const hasFinancialContext = financialKeywords.some(k => input.includes(k) || original.includes(k));
      
      if (hasFinancialContext) {
        intentType = 'yield';
        intentScore = 1;
      }
    }
    
    // ENHANCED PARAMETER EXTRACTION
    const params = this.extractParameters(input, original);
    
    // DETECT CONTRADICTIONS
    const contradictions = this.detectContradictions(params, input, original);
    
    // CONFIDENCE CALCULATION
    let confidence = 0.4;
    if (intentType !== 'unknown') confidence += 0.3;
    if (intentScore > 2) confidence += 0.1;
    if (params.amount) confidence += 0.15;
    if (params.fromToken) confidence += 0.1;
    if (params.targetYield) confidence += 0.1;
    if (contradictions.length === 0) confidence += 0.1; // Bonus for no contradictions
    
    const languageEmoji = {
      'turkish': '🇹🇷', 'german': '🇩🇪', 'french': '🇫🇷', 'english': '🇺🇸'
    }[language] || '🌍';
    
    return {
      originalText,
      detectedLanguage: language,
      translatedText: input,
      intentType,
      parameters: params,
      confidence: Math.min(confidence, 0.95),
      reasoning: `${languageEmoji} Detected ${intentType} intent from ${language} input with ${params.riskLevel} risk preference`,
      suggestedActions: [],
      riskAssessment: { score: 5, factors: [], warnings: [] },
      estimatedGas: '$5-15',
      timeToExecute: '2-5 minutes',
      contradictions
    };
  }
  
  private extractParameters(input: string, original: string): any {
    // AMOUNT EXTRACTION
    let amount: number | undefined;
    let currency = 'USD';
    
    const amountPatterns = [
      /\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?/g,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*\$\s*k?/g,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*usd/gi,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*euro?s?/gi,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(bin|tausend|mille|k)/gi,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(milyon|million|m)/gi
    ];
    
    for (const pattern of amountPatterns) {
      const matches = [...input.matchAll(pattern), ...original.matchAll(pattern)];
      for (const match of matches) {
        let value = parseFloat(match[1] || match[0].replace(/[^\d.]/g, ''));
        const unit = match[2] || match[0];
        
        if (/k$/i.test(unit) || /bin|tausend|mille/i.test(unit)) value *= 1000;
        if (/m$/i.test(unit) || /milyon|million/i.test(unit)) value *= 1000000;
        
        if (value > 0) {
          amount = value;
          break;
        }
      }
      if (amount) break;
    }
    
    // CURRENCY DETECTION
    if (original.includes('euro') || original.includes('€')) currency = 'EUR';
    if (original.includes('tl') || original.includes('lira')) currency = 'TRY';
    
    // TOKEN DETECTION
    let fromToken: string | undefined;
    if (input.includes('eth') || original.includes('ethereum')) fromToken = 'ETH';
    else if (input.includes('usdc')) fromToken = 'USDC';
    else if (input.includes('usdt')) fromToken = 'USDT';
    else if (input.includes('btc') || input.includes('bitcoin')) fromToken = 'WBTC';
    
    // TARGET YIELD EXTRACTION
    let targetYield: number | undefined;
    const yieldMatch = input.match(/(\d+(?:\.\d+)?)\s*%/) || original.match(/(\d+(?:\.\d+)?)\s*%/);
    if (yieldMatch) {
      targetYield = parseFloat(yieldMatch[1]);
    }
    
    // ENHANCED RISK LEVEL DETECTION
    let riskLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
    
    const safeWords = [
      'safe', 'secure', 'low risk', 'conservative', 'stable', 'guaranteed', 'insured',
      'güvenli', 'emniyetli', 'düşük risk', 'stabil', 'garanti',
      'sicher', 'stabil', 'risikolos', 'konservativ', 'garantiert',
      'sûr', 'sécurisé', 'stable', 'conservateur', 'garanti'
    ];
    
    const riskyWords = [
      'aggressive', 'high risk', 'risky', 'volatile', 'speculative', 'maximum',
      'agresif', 'yüksek risk', 'riskli', 'spekülatif', 'maksimum',
      'aggressiv', 'risikoreich', 'spekulativ', 'maximum',
      'agressif', 'risqué', 'spéculatif', 'maximum'
    ];
    
    const safeScore = safeWords.filter(w => input.includes(w) || original.includes(w)).length;
    const riskyScore = riskyWords.filter(w => input.includes(w) || original.includes(w)).length;
    
    if (safeScore > riskyScore) riskLevel = 'conservative';
    else if (riskyScore > safeScore) riskLevel = 'aggressive';
    
    // ADJUST RISK BASED ON TARGET YIELD
    if (targetYield) {
      if (targetYield > 20) riskLevel = 'aggressive';
      else if (targetYield > 15 && riskLevel === 'conservative') riskLevel = 'moderate';
      else if (targetYield < 8 && riskLevel === 'aggressive') riskLevel = 'moderate';
    }
    
    return {
      amount,
      fromToken,
      targetYield,
      riskLevel,
      timeframe: 'medium',
      networks: ['base', 'optimism', 'arbitrum'],
      currency
    };
  }
  
  private detectContradictions(params: any, input: string, original: string): string[] {
    const contradictions: string[] = [];
    
    // SAFE + HIGH YIELD CONTRADICTION
    const hasSafeWords = ['safe', 'secure', 'conservative', 'güvenli', 'sicher', 'sûr']
      .some(w => input.includes(w) || original.includes(w));
    
    const hasHighYieldWords = ['high', 'maximum', 'best', 'yüksek', 'en', 'hoch', 'élevé']
      .some(w => input.includes(w) || original.includes(w));
    
    if (hasSafeWords && hasHighYieldWords) {
      contradictions.push('Requesting both "safe" and "high yield" - these typically trade off against each other');
    }
    
    if (params.targetYield && params.targetYield > 15 && params.riskLevel === 'conservative') {
      contradictions.push(`Target yield ${params.targetYield}% is high for conservative risk tolerance`);
    }
    
    if (params.amount && params.amount < 100 && hasHighYieldWords) {
      contradictions.push('Small amounts may have limited high-yield options due to gas costs');
    }
    
    return contradictions;
  }
  
  private smartProtocolMatching(intent: UserIntent): DeFiProtocol[] {
    let eligibleProtocols = ENHANCED_PROTOCOLS.filter(p => p.isActive);
    
    console.log(`🎯 Smart matching for ${intent.parameters.riskLevel} risk level`);
    
    // FILTER BY RISK LEVEL - This is the key fix!
    if (intent.parameters.riskLevel === 'conservative') {
      eligibleProtocols = eligibleProtocols.filter(p => p.category === 'conservative');
    } else if (intent.parameters.riskLevel === 'moderate') {
      eligibleProtocols = eligibleProtocols.filter(p => 
        p.category === 'conservative' || p.category === 'moderate'
      );
    }
    // For aggressive, all protocols are eligible
    
    // FILTER BY TARGET YIELD
    if (intent.parameters.targetYield) {
      eligibleProtocols = eligibleProtocols.filter(p => 
        p.apy >= intent.parameters.targetYield! * 0.8 // Allow 80% of target
      );
    }
    
    // FILTER BY MINIMUM AMOUNT
    if (intent.parameters.amount) {
      eligibleProtocols = eligibleProtocols.filter(p => 
        !p.minAmount || intent.parameters.amount! >= p.minAmount
      );
    }
    
    // SORT BY APY DESCENDING
    eligibleProtocols.sort((a, b) => b.apy - a.apy);
    
    console.log(`✅ Found ${eligibleProtocols.length} matching protocols`);
    
    return eligibleProtocols.slice(0, 5); // Top 5
  }
  
  private enhanceWithSmartRecommendations(intent: UserIntent, protocols: DeFiProtocol[]): UserIntent {
    const suggestions: string[] = [];
    
    if (protocols.length === 0) {
      // NO MATCHING PROTOCOLS - PROVIDE HELPFUL GUIDANCE
      if (intent.parameters.riskLevel === 'conservative' && intent.parameters.targetYield && intent.parameters.targetYield > 10) {
        suggestions.push('⚠️ Conservative protocols typically offer 6-9% APY. Consider moderate risk for higher yields.');
        suggestions.push('💡 Alternative: Split allocation between conservative (70%) and moderate risk (30%)');
      } else {
        suggestions.push('❌ No protocols match your exact criteria');
        suggestions.push('💡 Try adjusting risk tolerance or target yield requirements');
      }
    } else {
      // ADD PROTOCOL RECOMMENDATIONS
      protocols.forEach(p => {
        suggestions.push(`${p.name} on ${p.network}: ${p.apy}% APY (Risk: ${p.riskScore}/10, TVL: ${p.tvl})`);
      });
      
      // ADD CONTEXTUAL ADVICE
      if (intent.parameters.riskLevel === 'conservative') {
        suggestions.push('💡 All recommendations are low-risk, audited protocols');
      } else if (intent.contradictions && intent.contradictions.length > 0) {
        suggestions.push('⚠️ Note: Your request has some trade-offs - see risk assessment below');
      }
    }
    
    // ENHANCED RISK ASSESSMENT
    const riskFactors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 3; // Default conservative
    
    if (intent.parameters.riskLevel === 'aggressive') {
      riskScore = 7;
      riskFactors.push('High-risk protocols selected');
      warnings.push('Potential for significant losses');
    } else if (intent.parameters.riskLevel === 'moderate') {
      riskScore = 5;
      riskFactors.push('Moderate risk tolerance');
    } else {
      riskScore = 2;
      riskFactors.push('Conservative approach prioritizing safety');
    }
    
    if (intent.parameters.targetYield && intent.parameters.targetYield > 15) {
      riskScore += 2;
      riskFactors.push('High yield target increases risk');
      warnings.push('High yields often indicate higher protocol risks');
    }
    
    if (intent.contradictions && intent.contradictions.length > 0) {
      riskScore += 1;
      warnings.push(...intent.contradictions);
    }
    
    intent.suggestedActions = suggestions;
    intent.riskAssessment = {
      score: Math.min(riskScore, 10),
      factors: riskFactors,
      warnings: warnings
    };
    
    return intent;
  }
  
  private getFallbackIntent(originalInput: string): UserIntent {
    const language = detectLanguage(originalInput);
    return {
      originalText: originalInput,
      detectedLanguage: language,
      translatedText: originalInput,
      intentType: 'unknown',
      parameters: {},
      confidence: 0.3,
      reasoning: `Could not parse ${language} intent`,
      suggestedActions: ['Please be more specific about your DeFi goals'],
      riskAssessment: { score: 5, factors: [], warnings: [] },
      estimatedGas: '$5-10',
      timeToExecute: 'Unknown'
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { userInput, userId } = body;
    
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User input is required',
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }
    
    const parser = new ImprovedSmartParser();
    const intent = await parser.parseUserIntent(userInput);
    
    const response = {
      success: true,
      intent,
      metadata: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '3.1.0-improved',
        supportedLanguages: ['English', 'Turkish', 'German', 'French'],
        detectedLanguage: intent.detectedLanguage,
        advanced: true,
        improvements: ['Smart protocol filtering', 'Contradiction detection', 'Risk-based recommendations']
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Improved API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Improved processing failed',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'IMPROVED-SMART',
    message: 'Improved Smart Parser with Risk-Based Filtering',
    version: '3.1.0-improved',
    supportedLanguages: ['🇺🇸 English', '🇹🇷 Turkish', '🇩🇪 German', '🇫🇷 French'],
    improvements: [
      'Smart protocol filtering by risk level',
      'Contradiction detection and handling',
      'Enhanced parameter extraction',
      'Risk-appropriate recommendations',
      'Better context awareness'
    ]
  });
}
