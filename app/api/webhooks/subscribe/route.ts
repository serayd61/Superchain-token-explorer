import { NextRequest, NextResponse } from 'next/server';

interface NotificationFilter {
  chains: string[];
  minLiquidity?: number;
  hasLiquidity: boolean;
  tokenNamePattern?: string;
  tokenSymbolPattern?: string;
}

interface Subscription {
  id: string;
  filters: NotificationFilter;
  webhookUrl?: string;
  email?: string;
  telegram?: string;
  createdAt: string;
  lastNotified?: string;
}

// In production, use a database
const subscriptions = new Map<string, Subscription>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, webhookUrl, email, telegram } = body;

    // Validate at least one notification method
    if (!webhookUrl && !email && !telegram) {
      return NextResponse.json({
        success: false,
        error: 'At least one notification method is required'
      }, { status: 400 });
    }

    // Generate subscription ID
    const subscriptionId = crypto.randomUUID();

    // Create subscription
    const subscription: Subscription = {
      id: subscriptionId,
      filters,
      webhookUrl,
      email,
      telegram,
      createdAt: new Date().toISOString()
    };

    // Store subscription
    subscriptions.set(subscriptionId, subscription);

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create subscription'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // List subscriptions (for debugging)
  return NextResponse.json({
    subscriptions: Array.from(subscriptions.values())
  });
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subscriptionId = searchParams.get('id');

  if (!subscriptionId) {
    return NextResponse.json({
      success: false,
      error: 'Subscription ID required'
    }, { status: 400 });
  }

  if (subscriptions.delete(subscriptionId)) {
    return NextResponse.json({
      success: true,
      message: 'Subscription deleted'
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Subscription not found'
    }, { status: 404 });
  }
}

