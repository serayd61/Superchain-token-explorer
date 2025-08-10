import { NextRequest, NextResponse } from 'next/server';
import {
  createSubscription,
  listSubscriptions,
  deleteSubscription,
  NotificationFilter,
} from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, webhookUrl, email, telegram } = body as {
      filters: NotificationFilter;
      webhookUrl?: string;
      email?: string;
      telegram?: string;
    };

    // Validate at least one notification method
    if (!webhookUrl && !email && !telegram) {
      return NextResponse.json({
        success: false,
        error: 'At least one notification method is required'
      }, { status: 400 });
    }

    const subscription = await createSubscription({
      filters,
      webhookUrl,
      email,
      telegram,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      message: 'Subscription created successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create subscription'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const subs = await listSubscriptions();
  return NextResponse.json({ subscriptions: subs });
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
    await deleteSubscription(subscriptionId);
    return NextResponse.json({ success: true, message: 'Subscription deleted' });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: 'Subscription not found'
    }, { status: 404 });
  }
}

