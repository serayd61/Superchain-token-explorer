import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;
    
    // Basit mock response - gerçek AI olmadan test için
    const mockIntent = {
      originalText: userInput,
      intentType: userInput.includes('earn') || userInput.includes('yield') ? 'yield' : 'unknown',
      parameters: {
        fromToken: userInput.includes('ETH') ? 'ETH' : 'USDC',
        riskLevel: userInput.includes('safe') ? 'conservative' : 'moderate'
      },
      confidence: 0.8,
      reasoning: 'Mock analysis for testing',
      suggestedActions: ['Test action 1', 'Test action 2']
    };
    
    return NextResponse.json({
      success: true,
      intent: mockIntent,
      processingTime: 150
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse intent'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Intent Parser API is running',
    version: '1.0.0'
  });
}
