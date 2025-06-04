import { NextRequest, NextResponse } from 'next/server';

// This would be imported from subscribe route in production
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

// Temporary - in production, share this with subscribe route
const subscriptions = new Map<string, Subscription>();

export async function POST(request: NextRequest) {
  try {
    const token = await request.json();
    
    // Notify all matching subscribers
    const notifications = [];
    
    for (const [id, subscription] of subscriptions) {
      if (matchesFilters(token, subscription.filters)) {
        notifications.push(notifySubscriber(subscription, token));
      }
    }
    
    await Promise.allSettled(notifications);
    
    return NextResponse.json({
      success: true,
      notified: notifications.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Notification failed'
    }, { status: 500 });
  }
}

function matchesFilters(token: any, filters: NotificationFilter): boolean {
  // Check chain
  if (filters.chains.length > 0 && !filters.chains.includes(token.chain)) {
    return false;
  }

  // Check liquidity
  if (filters.hasLiquidity && token.lp_info.status !== 'YES') {
    return false;
  }

  if (filters.minLiquidity && token.dex_data?.liquidity) {
    const liquidity = parseFloat(token.dex_data.liquidity);
    if (liquidity < filters.minLiquidity) {
      return false;
    }
  }

  // Check name pattern
  if (filters.tokenNamePattern) {
    const pattern = new RegExp(filters.tokenNamePattern, 'i');
    if (!pattern.test(token.metadata.name)) {
      return false;
    }
  }

  // Check symbol pattern
  if (filters.tokenSymbolPattern) {
    const pattern = new RegExp(filters.tokenSymbolPattern, 'i');
    if (!pattern.test(token.metadata.symbol)) {
      return false;
    }
  }

  return true;
}

async function notifySubscriber(subscription: Subscription, token: any) {
  const promises = [];
  
  if (subscription.webhookUrl) {
    promises.push(sendWebhook(subscription.webhookUrl, token));
  }
  
  if (subscription.email) {
    promises.push(sendEmail(subscription.email, token));
  }
  
  if (subscription.telegram) {
    promises.push(sendTelegram(subscription.telegram, token));
  }
  
  return Promise.allSettled(promises);
}

async function sendWebhook(url: string, token: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'new_token',
        timestamp: new Date().toISOString(),
        data: token
      })
    });

    if (!response.ok) {
      console.error('Webhook failed:', response.status);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

async function sendEmail(email: string, token: any) {
  // TODO: Implement with SendGrid or similar
  console.log(`Would send email to ${email} about token ${token.metadata.symbol}`);
}

async function sendTelegram(chatId: string, token: any) {
  // TODO: Implement with Telegram Bot API
  console.log(`Would send Telegram to ${chatId} about token ${token.metadata.symbol}`);
}
