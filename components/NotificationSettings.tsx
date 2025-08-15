"use client";
import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Webhook } from 'lucide-react';

export function NotificationSettings() {
  const [filters, setFilters] = useState({
    chains: [] as string[],
    hasLiquidity: true,
    minLiquidity: 1000,
    tokenNamePattern: '',
    tokenSymbolPattern: ''
  });

  const [notificationMethods, setNotificationMethods] = useState({
    webhook: { enabled: false, url: '' },
    email: { enabled: false, address: '' },
    telegram: { enabled: false, chatId: '' }
  });

  const [loading, setLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const payload = {
        filters,
        webhookUrl: notificationMethods.webhook.enabled ? notificationMethods.webhook.url : undefined,
        email: notificationMethods.email.enabled ? notificationMethods.email.address : undefined,
        telegram: notificationMethods.telegram.enabled ? notificationMethods.telegram.chatId : undefined
      };

      const response = await fetch('/api/webhooks/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        setSubscriptionId(data.subscriptionId);
        alert('Subscription created successfully!');
      } else {
        alert('Failed to create subscription: ' + data.error);
      }
    } catch (error) {
      alert('Error creating subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Token Alert Notifications
      </h3>

      {/* Filter section */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">Filter Criteria</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chains to Monitor
          </label>
          <div className="flex flex-wrap gap-2">
            {['base', 'optimism', 'mode', 'zora'].map(chain => (
              <label key={chain} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.chains.includes(chain)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, chains: [...filters.chains, chain] });
                    } else {
                      setFilters({ ...filters, chains: filters.chains.filter(c => c !== chain) });
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span className="capitalize">{chain}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasLiquidity}
              onChange={(e) => setFilters({ ...filters, hasLiquidity: e.target.checked })}
              className="rounded text-blue-600"
            />
            Only tokens with liquidity
          </label>
        </div>
      </div>

      {/* Notification methods */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">Notification Methods</h4>
        
        {/* Webhook */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={notificationMethods.webhook.enabled}
              onChange={(e) => setNotificationMethods({
                ...notificationMethods,
                webhook: { ...notificationMethods.webhook, enabled: e.target.checked }
              })}
              className="rounded text-blue-600"
            />
            <Webhook className="w-4 h-4" />
            <span className="font-medium">Webhook</span>
          </label>
          {notificationMethods.webhook.enabled && (
            <input
              type="url"
              value={notificationMethods.webhook.url}
              onChange={(e) => setNotificationMethods({
                ...notificationMethods,
                webhook: { ...notificationMethods.webhook, url: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://your-webhook-url.com/notifications"
            />
          )}
        </div>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading || !notificationMethods.webhook.enabled}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
      >
        {loading ? 'Creating Subscription...' : 'Subscribe to Alerts'}
      </button>

      {subscriptionId && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            Subscription created! ID: <code className="font-mono">{subscriptionId}</code>
          </p>
        </div>
      )}
    </div>
  );
}
