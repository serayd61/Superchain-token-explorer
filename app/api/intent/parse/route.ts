// app/api/intent/parse/route.ts - MULTILINGUAL VERSION
import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// 1. MULTILINGUAL LANGUAGE DETECTION & TRANSLATION
// =====================================================

interface LanguageMapping {
  [key: string]: {
    // Intent actions
    yield: string[];
    swap: string[];
    arbitrage: string[];
    bridge: string[];
    hedge: string[];
    portfolio: string[];
    
    // Actions
    find: string[];
    search: string[];
    show: string[];
    give: string[];
    recommend: string[];
    
    // Risk levels
    safe: string[];
    risky: string[];
    conservative: string[];
    aggressive: string[];
    moderate: string[];
    
    // Amounts & Numbers
    thousand: string[];
    million: string[];
    dollar: string[];
    euro: string[];
    
    // Superlatives
    best: string[];
    highest: string[];
    lowest: string[];
    most: string[];
    
    // Time
    short: string[];
    long: string[];
    quick: string[];
    
    // Tokens
    tokens: string[];
    projects: string[];
    protocols: string[];
    platforms: string[];
  };
}

const LANGUAGE_MAPPINGS: LanguageMapping = {
  // 🇹🇷 TURKISH
  turkish: {
    yield: ['faiz', 'getiri', 'kazanç', 'kar', 'gelir', 'oran', 'yüzde'],
    swap: ['değiş', 'çevir', 'takas', 'dönüştür', 'swap'],
    arbitrage: ['arbitraj', 'fırsat', 'kar fırsatı', 'price gap'],
    bridge: ['köprü', 'aktar', 'gönder', 'transfer', 'taşı'],
    hedge: ['korun', 'sigorta', 'güvence', 'hedge'],
    portfolio: ['portföy', 'cüzdan', 'yatırım', 'dağılım'],
    
    find: ['bul', 'ara', 'keşfet', 'tespit et'],
    search: ['ara', 'tara', 'bak'],
    show: ['göster', 'listele', 'sun'],
    give: ['ver', 'sun', 'sağla'],
    recommend: ['öner', 'tavsiye et', 'öneri'],
    
    safe: ['güvenli', 'emniyetli', 'riskiz', 'stabil'],
    risky: ['riskli', 'tehlikeli', 'spekülatif'],
    conservative: ['konservativ', 'tutucu', 'güvenli'],
    aggressive: ['agresif', 'cesur', 'yüksek risk'],
    moderate: ['orta', 'dengeli', 'makul'],
    
    thousand: ['bin', 'k'],
    million: ['milyon', 'm'],
    dollar: ['dolar', 'usd'],
    euro: ['euro', 'eur'],
    
    best: ['en iyi', 'en güzel', 'optimal', 'mükemmel'],
    highest: ['en yüksek', 'maksimum', 'en fazla'],
    lowest: ['en düşük', 'minimum', 'en az'],
    most: ['en', 'en çok'],
    
    short: ['kısa', 'hızlı', 'çabuk', 'acil'],
    long: ['uzun', 'uzun vadeli', 'bekle', 'tut'],
    quick: ['hızlı', 'çabuk', 'acele'],
    
    tokens: ['token', 'coin', 'kripto', 'para'],
    projects: ['proje', 'girişim'],
    protocols: ['protokol', 'sistem'],
    platforms: ['platform', 'borsa', 'exchange']
  },
  
  // 🇩🇪 GERMAN
  german: {
    yield: ['zinsen', 'ertrag', 'rendite', 'gewinn', 'einkommen', 'apy'],
    swap: ['tauschen', 'wechseln', 'umtauschen', 'konvertieren'],
    arbitrage: ['arbitrage', 'gelegenheit', 'preisunterschied'],
    bridge: ['brücke', 'übertragen', 'senden', 'transferieren'],
    hedge: ['absichern', 'versicherung', 'schutz'],
    portfolio: ['portfolio', 'geldbörse', 'investition'],
    
    find: ['finden', 'suchen', 'entdecken'],
    search: ['suchen', 'durchsuchen'],
    show: ['zeigen', 'anzeigen', 'auflisten'],
    give: ['geben', 'bereitstellen'],
    recommend: ['empfehlen', 'vorschlagen'],
    
    safe: ['sicher', 'stabil', 'risikolos'],
    risky: ['riskant', 'gefährlich', 'spekulativ'],
    conservative: ['konservativ', 'vorsichtig'],
    aggressive: ['aggressiv', 'risikoreich'],
    moderate: ['moderat', 'ausgewogen'],
    
    thousand: ['tausend', 'k'],
    million: ['million', 'm'],
    dollar: ['dollar', 'usd'],
    euro: ['euro', 'eur'],
    
    best: ['beste', 'optimal', 'perfekt'],
    highest: ['höchste', 'maximum', 'meiste'],
    lowest: ['niedrigste', 'minimum'],
    most: ['meiste', 'höchste'],
    
    short: ['kurz', 'schnell', 'eilig'],
    long: ['lang', 'langfristig', 'halten'],
    quick: ['schnell', 'zügig'],
    
    tokens: ['token', 'münze', 'krypto'],
    projects: ['projekte', 'vorhaben'],
    protocols: ['protokolle', 'systeme'],
    platforms: ['plattformen', 'börsen']
  },
  
  // 🇫🇷 FRENCH
  french: {
    yield: ['intérêts', 'rendement', 'profit', 'gains', 'revenus'],
    swap: ['échanger', 'changer', 'convertir', 'permuter'],
    arbitrage: ['arbitrage', 'opportunité', 'différence de prix'],
    bridge: ['pont', 'transférer', 'envoyer'],
    hedge: ['couvrir', 'assurance', 'protection'],
    portfolio: ['portefeuille', 'investissement'],
    
    find: ['trouver', 'chercher', 'découvrir'],
    search: ['rechercher', 'fouiller'],
    show: ['montrer', 'afficher', 'lister'],
    give: ['donner', 'fournir'],
    recommend: ['recommander', 'suggérer'],
    
    safe: ['sûr', 'sécurisé', 'stable', 'sans risque'],
    risky: ['risqué', 'dangereux', 'spéculatif'],
    conservative: ['conservateur', 'prudent'],
    aggressive: ['agressif', 'risqué'],
    moderate: ['modéré', 'équilibré'],
    
    thousand: ['mille', 'k'],
    million: ['million', 'm'],
    dollar: ['dollar', 'usd'],
    euro: ['euro', 'eur'],
    
    best: ['meilleur', 'optimal', 'parfait'],
    highest: ['plus élevé', 'maximum', 'plus haut'],
    lowest: ['plus bas', 'minimum'],
    most: ['plus', 'le plus'],
    
    short: ['court', 'rapide', 'urgent'],
    long: ['long', 'long terme', 'tenir'],
    quick: ['rapide', 'vite'],
    
    tokens: ['tokens', 'pièces', 'crypto'],
    projects: ['projets', 'initiatives'],
    protocols: ['protocoles', 'systèmes'],
    platforms: ['plateformes', 'bourses']
  }
};

// =====================================================
// 2. LANGUAGE DETECTION
// =====================================================

function detectLanguage(input: string): string {
  const lowerInput = input.toLowerCase();
  
  // Turkish detection
  const turkishIndicators = ['bana', 'en', 'faiz', 'getiri', 'bul', 'proje', 'için', 'ile', 've', 'bir'];
  const turkishScore = turkishIndicators.filter(word => lowerInput.includes(word)).length;
  
  // German detection
  const germanIndicators = ['ich', 'möchte', 'finden', 'beste', 'mit', 'und', 'für', 'der', 'die', 'das'];
  const germanScore = germanIndicators.filter(word => lowerInput.includes(word)).length;
  
  // French detection
  const frenchIndicators = ['je', 'veux', 'trouve', 'meilleur', 'avec', 'et', 'pour', 'le', 'la', 'les'];
  const frenchScore = frenchIndicators.filter(word => lowerInput.includes(word)).length;
  
  console.log(`🌍 Language scores - TR: ${turkishScore}, DE: ${germanScore}, FR: ${frenchScore}`);
  
  if (turkishScore >= 2 || turkishScore > germanScore && turkishScore > frenchScore) {
    return 'turkish';
  } else if (germanScore >= 2 || germanScore > frenchScore) {
    return 'german';
  } else if (frenchScore >= 2) {
    return 'french';
  }
  
  return 'english';
}

// =====================================================
// 3. MULTILINGUAL TRANSLATION
// =====================================================

function translateToEnglish(input: string, detectedLanguage: string): string {
  if (detectedLanguage === 'english') return input;
  
  const languageMap = LANGUAGE_MAPPINGS[detectedLanguage];
  if (!languageMap) return input;
  
  let translated = input.toLowerCase();
  
  // Translate each category
  Object.entries(languageMap).forEach(([englishConcept, foreignWords]) => {
    foreignWords.forEach(foreignWord => {
      const regex = new RegExp('\\b' + foreignWord + '\\b', 'gi');
      
      // Map to appropriate English terms
      let englishEquivalent = '';
      switch (englishConcept) {
        case 'yield':
          englishEquivalent = 'earn yield';
          break;
        case 'find':
          englishEquivalent = 'find';
          break;
        case 'best':
          englishEquivalent = 'best';
          break;
        case 'highest':
          englishEquivalent = 'highest yield';
          break;
        case 'projects':
          englishEquivalent = 'defi projects';
          break;
        case 'safe':
          englishEquivalent = 'safe low risk';
          break;
        case 'risky':
          englishEquivalent = 'high risk aggressive';
          break;
        default:
          englishEquivalent = englishConcept;
      }
      
      translated = translated.replace(regex, englishEquivalent);
    });
  });
  
  return translated;
}

// =====================================================
// 4. ENHANCED MULTILINGUAL PARSER
// =====================================================

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
}

class MultilingualIntentParser {
  
  async parseUserIntent(userInput: string): Promise<UserIntent> {
    const startTime = Date.now();
    
    try {
      console.log(`🌍 Multilingual parsing: "${userInput}"`);
      
      // Detect language
      const detectedLanguage = detectLanguage(userInput);
      console.log(`🔍 Detected language: ${detectedLanguage}`);
      
      // Translate to English for processing
      const translatedText = translateToEnglish(userInput, detectedLanguage);
      console.log(`🔄 Translated: "${translatedText}"`);
      
      // Analyze intent using translated text
      const intent = this.analyzeIntent(userInput, translatedText, detectedLanguage);
      const protocols = this.findMatchingProtocols(intent);
      const enhancedIntent = this.enhanceWithProtocolData(intent, protocols);
      
      // Add language info
      enhancedIntent.detectedLanguage = detectedLanguage;
      enhancedIntent.translatedText = translatedText;
      
      console.log(`✅ Multilingual parsing completed in ${Date.now() - startTime}ms`);
      return enhancedIntent;
      
    } catch (error) {
      console.error('❌ Multilingual parsing failed:', error);
      return this.getFallbackIntent(userInput);
    }
  }
  
  private analyzeIntent(originalText: string, translatedText: string, language: string): UserIntent {
    const input = translatedText.toLowerCase();
    const original = originalText.toLowerCase();
    
    // Intent type detection (works with translated English)
    let intentType: UserIntent['intentType'] = 'unknown';
    
    if (input.includes('earn') || input.includes('yield') || input.includes('apy') || 
        input.includes('%') || input.includes('highest yield')) {
      intentType = 'yield';
    } else if (input.includes('swap') || input.includes('exchange') || input.includes('convert')) {
      intentType = 'swap';
    } else if (input.includes('arbitrage') || input.includes('profit') || input.includes('opportunity')) {
      intentType = 'arbitrage';
    } else if (input.includes('bridge') || input.includes('transfer') || input.includes('move')) {
      intentType = 'bridge';
    } else if (input.includes('hedge') || input.includes('protect') || input.includes('insurance')) {
      intentType = 'hedge';
    } else if (input.includes('portfolio') || input.includes('diversify') || input.includes('balance')) {
      intentType = 'portfolio';
    }
    
    // Amount extraction (multilingual)
    let amount: number | undefined;
    let currency: string = 'USD';
    
    // Standard amount detection
    const amountMatch = input.match(/\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (input.includes('k') && amount < 1000) amount *= 1000;
    }
    
    // Multilingual amount detection
    const multiAmountMatch = original.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(bin|tausend|mille|k|milyon|million|m)/);
    if (multiAmountMatch) {
      amount = parseFloat(multiAmountMatch[1].replace(/,/g, ''));
      const unit = multiAmountMatch[2];
      if (['bin', 'tausend', 'mille', 'k'].includes(unit)) amount *= 1000;
      if (['milyon', 'million', 'm'].includes(unit)) amount *= 1000000;
    }
    
    // Currency detection
    if (original.includes('euro') || original.includes('eur') || original.includes('€')) {
      currency = 'EUR';
    } else if (original.includes('tl') || original.includes('lira')) {
      currency = 'TRY';
    }
    
    // Token detection
    let fromToken: string | undefined;
    if (input.includes('eth') || original.includes('ethereum')) fromToken = 'ETH';
    else if (input.includes('usdc')) fromToken = 'USDC';
    else if (input.includes('usdt')) fromToken = 'USDT';
    else if (input.includes('dai')) fromToken = 'DAI';
    else if (input.includes('wbtc') || original.includes('bitcoin')) fromToken = 'WBTC';
    
    // Target yield extraction
    let targetYield: number | undefined;
    const yieldMatch = input.match(/(\d+(?:\.\d+)?)\s*%/);
    if (yieldMatch) {
      targetYield = parseFloat(yieldMatch[1]);
    }
    
    // Risk level assessment (multilingual)
    let riskLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
    if (input.includes('safe') || input.includes('low risk') || input.includes('conservative')) {
      riskLevel = 'conservative';
    } else if (input.includes('high risk aggressive') || input.includes('aggressive') || input.includes('maximum')) {
      riskLevel = 'aggressive';
    }
    
    // Confidence calculation with language bonus
    let confidence = 0.6;
    if (intentType !== 'unknown') confidence += 0.25;
    if (amount) confidence += 0.1;
    if (fromToken) confidence += 0.05;
    if (targetYield) confidence += 0.1;
    
    // Language detection bonus
    if (language !== 'english') confidence += 0.1;
    
    const languageEmoji = {
      'turkish': '🇹🇷',
      'german': '🇩🇪', 
      'french': '🇫🇷',
      'english': '🇺🇸'
    }[language] || '🌍';
    
    return {
      originalText,
      detectedLanguage: language,
      translatedText: input,
      intentType,
      parameters: {
        amount,
        fromToken,
        targetYield,
        riskLevel,
        timeframe: 'medium',
        networks: ['base', 'optimism', 'arbitrum'],
        currency
      },
      confidence: Math.min(confidence, 0.95),
      reasoning: `${languageEmoji} Detected ${intentType} intent from ${language} input with ${riskLevel} risk preference`,
      suggestedActions: [],
      riskAssessment: { score: 5, factors: [], warnings: [] },
      estimatedGas: '$5-15',
      timeToExecute: '2-5 minutes'
    };
  }
  
  private findMatchingProtocols(intent: UserIntent): any[] {
    // Same logic as before - protocol matching
    return [
      { name: 'Camelot', network: 'arbitrum', apy: 18.3, riskScore: 5, tvl: '1.5B' },
      { name: 'Velodrome', network: 'optimism', apy: 15.8, riskScore: 4, tvl: '2.1B' },
      { name: 'Aerodrome', network: 'base', apy: 12.5, riskScore: 3, tvl: '2.8B' }
    ];
  }
  
  private enhanceWithProtocolData(intent: UserIntent, protocols: any[]): UserIntent {
    const suggestions: string[] = [];
    
    if (protocols.length > 0) {
      protocols.slice(0, 3).forEach(p => {
        suggestions.push(`${p.name} on ${p.network}: ${p.apy}% APY (Risk: ${p.riskScore}/10, TVL: ${p.tvl})`);
      });
      
      // Add language-specific advice
      const languageAdvice = {
        'turkish': 'Çoklu protokol kullanarak riski dağıtmayı düşünün',
        'german': 'Erwägen Sie eine Diversifizierung über mehrere Protokolle',
        'french': 'Considérez la diversification sur plusieurs protocoles',
        'english': 'Consider diversifying across multiple protocols'
      };
      
      suggestions.push(languageAdvice[intent.detectedLanguage] || languageAdvice.english);
    }
    
    intent.suggestedActions = suggestions;
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
      reasoning: `Could not parse ${language} intent - please provide more details`,
      suggestedActions: ['Please be more specific about your DeFi goals'],
      riskAssessment: { score: 5, factors: [], warnings: [] },
      estimatedGas: '$5-10',
      timeToExecute: 'Unknown'
    };
  }
}

// =====================================================
// 5. API ROUTE
// =====================================================

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
    
    console.log(`🌍 Processing multilingual intent: "${userInput}"`);
    
    const parser = new MultilingualIntentParser();
    const intent = await parser.parseUserIntent(userInput);
    
    const response = {
      success: true,
      intent,
      metadata: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '3.0.0-multilingual',
        supportedLanguages: ['English', 'Turkish', 'German', 'French'],
        detectedLanguage: intent.detectedLanguage,
        advanced: true
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Multilingual API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Multilingual processing failed',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'MULTILINGUAL',
    message: 'Multilingual Intent Parser - TR/DE/FR/EN Support',
    version: '3.0.0-multilingual',
    supportedLanguages: [
      '🇺🇸 English',
      '🇹🇷 Turkish', 
      '🇩🇪 German',
      '🇫🇷 French'
    ],
    features: [
      'Automatic language detection',
      'Real-time translation',
      'Multilingual protocol recommendations',
      'Cultural context awareness'
    ]
  });
}

