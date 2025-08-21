import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface NotificationFilter {
  chains: string[];
  minLiquidity?: number;
  hasLiquidity: boolean;
  tokenNamePattern?: string;
  tokenSymbolPattern?: string;
}

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

    const subscription = await prisma.subscription.create({
      data: {
        filters,
        webhookUrl,
        email,
        telegram
      }
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
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
  const subscriptions = await prisma.subscription.findMany();
  return NextResponse.json({
    subscriptions
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

  try {
    await prisma.subscription.delete({ where: { id: subscriptionId } });
    return NextResponse.json({
      success: true,
      message: 'Subscription deleted'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Subscription not found'
    }, { status: 404 });
  }
}

