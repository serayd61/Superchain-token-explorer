import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Subscription as SubscriptionModel } from '@prisma/client';

interface NotificationFilter {
  chains: string[];
  minLiquidity?: number;
  hasLiquidity: boolean;
  tokenNamePattern?: string;
  tokenSymbolPattern?: string;
}

type Subscription = SubscriptionModel & { filters: NotificationFilter };

export async function POST(request: NextRequest) {
  try {
    const token = await request.json();

    const subs = await prisma.subscription.findMany();
    const notifications: Promise<any>[] = [];

    for (const sub of subs) {
      const subscription: Subscription = {
        ...sub,
        filters: sub.filters as unknown as NotificationFilter
      };

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
    promises.push(withRetry(() => sendWebhook(subscription.webhookUrl!, token), 'webhook', subscription.id));
  }

  if (subscription.email) {
    promises.push(withRetry(() => sendEmail(subscription.email!, token), 'email', subscription.id));
  }

  if (subscription.telegram) {
    promises.push(withRetry(() => sendTelegram(subscription.telegram!, token), 'telegram', subscription.id));
  }

  return Promise.allSettled(promises);
}

async function sendWebhook(url: string, token: any) {
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
    throw new Error(`Webhook failed: ${response.status}`);
  }
}

async function sendEmail(email: string, token: any) {
  const subject = `New token ${token.metadata.symbol}`;
  const text = `Token ${token.metadata.name} (${token.metadata.symbol}) detected on ${token.chain}`;

  if (process.env.SENDGRID_API_KEY) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: process.env.EMAIL_FROM || 'no-reply@example.com' },
        subject,
        content: [{ type: 'text/plain', value: text }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid failed: ${response.status}`);
    }
    return;
  }

  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    const auth = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64');
    const body = new URLSearchParams({
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
      to: email,
      subject,
      text
    }).toString();

    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    if (!response.ok) {
      throw new Error(`Mailgun failed: ${response.status}`);
    }
    return;
  }

  throw new Error('No email provider configured');
}

async function sendTelegram(chatId: string, token: any) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('Telegram bot token not configured');
  }

  const text = `Token ${token.metadata.name} (${token.metadata.symbol}) detected on ${token.chain}`;
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram failed: ${response.status}`);
  }
}

async function withRetry(
  fn: () => Promise<void>,
  channel: string,
  subscriptionId: string,
  maxRetries = 3
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await fn();
      return;
    } catch (error) {
      attempt++;
      console.error(`Notification ${channel} attempt ${attempt} failed`, error);
      if (attempt >= maxRetries) {
        await prisma.notificationLog.create({
          data: {
            subscriptionId,
            channel,
            error: String(error),
            attempts: attempt
          }
        });
      } else {
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  }
}
