// 🧠 INTENT PARSER - CORE IMPLEMENTATION
// File: app/api/intent/parse/route.ts

import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// 1. TYPE DEFINITIONS
// =====================================================

export interface UserIntent {
  originalText: string;
  intentType: 'yield' | 'swap' | 'arbitrage' | 'hedge' | 'bridge' | 'portfolio' | 'unknown';
  parameters: {
    amount?: number;
    fromToken?: string;
    toToken?: string;
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    timeframe?: 'short' | 'medium' | 'long';
    targetYield?: number;
    networks?: string[];
    maxGas?: number;
    urgency?: 'low' | 'medium' | 'high';
  };
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
}

interface IntentParsingResponse {
  success: boolean;
  intent?: UserIntent;
  error?: string;
  processingTime: number;
}

// =====================================================
// 2. CLAUDE API INTEGRATION
// =====================================================

class IntentParser {
  private readonly claudeApiUrl = "https://api.anthropic.com/v1/messages";
  
  async parseUserIntent(userInput: string): Promise<UserIntent> {
    const startTime = Date.now();
    
    try {
      console.log(`🧠 Parsing intent: "${userInput}"`);
      
      const prompt = this.buildIntentPrompt(userInput);
      const response = await this.callClaudeAPI(prompt);
      const parsedIntent = this.parseClaudeResponse(response, userInput);
      
      console.log(`✅ Intent parsed in ${Date.now() - startTime}ms`);
      return parsedIntent;
      
    } catch (error) {
      console.error('❌ Intent parsing failed:', error);
      throw new Error(`Intent parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private buildIntentPrompt(userInput: string): string {
    return `
You are a DeFi intent parsing AI. Analyze this user request and extract structured intent data.

USER INPUT: "${userInput}"

CONTEXT:
- User wants to perform DeFi operations across Superchain (Base, Optimism, Arbitrum, etc.)
- Available actions: yield farming, swapping, bridging, arbitrage, hedging, portfolio management
- Risk levels: conservative (safe protocols, 3-8% APY), moderate (established protocols, 8-15% APY), aggressive (new/high-risk protocols, 15%+ APY)
- Networks: base, optimism, arbitrum, polygon, ethereum

ANALYSIS STEPS:
1. Identify the primary intent type
2. Extract numerical values (amounts, percentages, timeframes)
3. Determine risk tolerance from language cues
4. Identify mentioned tokens/assets
5. Assess confidence level (0.0-1.0)

RESPONSE FORMAT - ONLY JSON:
{
  "intentType": "yield|swap|arbitrage|hedge|bridge|portfolio|unknown",
  "parameters": {
    "amount": number_or_null,
    "fromToken": "token_symbol_or_null",
    "toToken": "token_symbol_or_null", 
    "riskLevel": "conservative|moderate|aggressive|null",
    "timeframe": "short|medium|long|null",
    "targetYield": number_or_null,
    "networks": ["list_of_networks"] or null,
    "maxGas": number_or_null,
    "urgency": "low|medium|high|null"
  },
  "confidence": 0.95,
  "reasoning": "Explanation of the analysis",
  "suggestedActions": ["List of 2-3 specific actions to take"]
}

EXAMPLES:

Input: "I want to earn 15% on my $10k ETH"
Output: {
  "intentType": "yield",
  "parameters": {
    "amount": 10000,
    "fromToken": "ETH",
    "riskLevel": "moderate",
    "targetYield": 15,
    "timeframe": "medium"
  },
  "confidence": 0.95,
  "reasoning": "User wants yield farming with specific target APY and amount",
  "suggestedActions": ["Find high-yield ETH strategies", "Compare lending vs liquidity provision", "Analyze risk-adjusted returns"]
}

Input: "Safest way to earn on USDC, low risk please"
Output: {
  "intentType": "yield", 
  "parameters": {
    "fromToken": "USDC",
    "riskLevel": "conservative",
    "timeframe": "long"
  },
  "confidence": 0.9,
  "reasoning": "User explicitly requests low-risk options for stablecoin yield",
  "suggestedActions": ["Check Aave/Compound rates", "Consider blue-chip lending protocols", "Review insurance coverage"]
}

RESPOND ONLY WITH VALID JSON, NO OTHER TEXT:
`;
  }
  
  private async callClaudeAPI(prompt: string): Promise<string> {
    const response = await fetch(this.claudeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }
  
  private parseClaudeResponse(responseText: string, originalInput: string): UserIntent {
    try {
      // Clean the response (remove any markdown or extra text)
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('🔍 Claude response:', cleanedResponse);
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsed.intentType || !parsed.confidence) {
        throw new Error('Missing required fields in Claude response');
      }
      
      return {
        originalText: originalInput,
        intentType: parsed.intentType,
        parameters: parsed.parameters || {},
        confidence: parsed.confidence,
        reasoning: parsed.reasoning || 'No reasoning provided',
        suggestedActions: parsed.suggestedActions || []
      };
      
    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error);
      console.error('Raw response:', responseText);
      
      // Fallback intent for unparseable responses
      return {
        originalText: originalInput,
        intentType: 'unknown',
        parameters: {},
        confidence: 0.1,
        reasoning: 'Failed to parse user intent',
        suggestedActions: ['Please rephrase your request more clearly']
      };
    }
  }
}

// =====================================================
// 3. INTENT VALIDATION & ENHANCEMENT
// =====================================================

class IntentValidator {
  static validate(intent: UserIntent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check confidence threshold
    if (intent.confidence < 0.3) {
      errors.push('Low confidence in intent parsing - please be more specific');
    }
    
    // Validate amount if provided
    if (intent.parameters.amount && intent.parameters.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    // Validate tokens
    const validTokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'OP', 'ARB'];
    if (intent.parameters.fromToken && !validTokens.includes(intent.parameters.fromToken)) {
      errors.push(`Token ${intent.parameters.fromToken} not currently supported`);
    }
    
    // Check for impossible targets
    if (intent.parameters.targetYield && intent.parameters.targetYield > 100) {
      errors.push('Target yield above 100% is likely unrealistic');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static enhance(intent: UserIntent): UserIntent {
    // Add default values for missing parameters
    if (!intent.parameters.riskLevel && intent.intentType === 'yield') {
      intent.parameters.riskLevel = 'moderate';
    }
    
    if (!intent.parameters.timeframe) {
      intent.parameters.timeframe = 'medium';
    }
    
    if (!intent.parameters.networks) {
      intent.parameters.networks = ['base', 'optimism']; // Default to main Superchain networks
    }
    
    return intent;
  }
}

// =====================================================
// 4. API ROUTE IMPLEMENTATION
// =====================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { userInput, userId } = body;
    
    // Validate input
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User input is required and must be a non-empty string',
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }
    
    if (userInput.length > 500) {
      return NextResponse.json({
        success: false,
        error: 'User input too long (max 500 characters)',
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }
    
    console.log(`🚀 Processing intent for user: ${userId || 'anonymous'}`);
    console.log(`📝 Input: "${userInput}"`);
    
    // Parse intent using Claude
    const parser = new IntentParser();
    const rawIntent = await parser.parseUserIntent(userInput);
    
    // Validate and enhance intent
    const validation = IntentValidator.validate(rawIntent);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: `Intent validation failed: ${validation.errors.join(', ')}`,
        intent: rawIntent,
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }
    
    const enhancedIntent = IntentValidator.enhance(rawIntent);
    
    console.log(`✅ Intent parsed successfully:`, {
      type: enhancedIntent.intentType,
      confidence: enhancedIntent.confidence,
      parameters: enhancedIntent.parameters
    });
    
    // Return successful response
    const response: IntentParsingResponse = {
      success: true,
      intent: enhancedIntent,
      processingTime: Date.now() - startTime
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// =====================================================
// 5. HEALTH CHECK & TESTING ENDPOINT
// =====================================================

export async function GET() {
  const testCases = [
    "I want to earn 15% on my $10k ETH",
    "Safest way to earn on USDC", 
    "Find arbitrage opportunities",
    "Bridge my tokens to Base",
    "Swap 1000 USDC to ETH"
  ];
  
  return NextResponse.json({
    status: 'OK',
    message: 'Intent Parser API is running',
    version: '1.0.0',
    endpoints: {
      parse: 'POST /api/intent/parse',
      health: 'GET /api/intent/parse'
    },
    testCases,
    timestamp: new Date().toISOString()
  });
}

// =====================================================
// 6. UTILITY FUNCTIONS FOR TESTING
// =====================================================

export class IntentTester {
  static async runTests() {
    const parser = new IntentParser();
    const testCases = [
      {
        input: "I want to earn 15% on my $10k ETH",
        expected: { intentType: 'yield', confidence: '>0.8' }
      },
      {
        input: "Safest way to earn on USDC low risk",
        expected: { intentType: 'yield', riskLevel: 'conservative' }
      },
      {
        input: "Find me arbitrage opportunities over $500 profit", 
        expected: { intentType: 'arbitrage' }
      },
      {
        input: "Bridge 1000 USDC from Ethereum to Base",
        expected: { intentType: 'bridge', amount: 1000 }
      }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const result = await parser.parseUserIntent(testCase.input);
        results.push({
          input: testCase.input,
          result,
          passed: result.intentType === testCase.expected.intentType
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          error: error instanceof Error ? error.message : 'Unknown error',
          passed: false
        });
      }
    }
    
    return results;
  }
}
