// components/PriceAlerts.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Bell, BellRing, Plus, Trash2, Edit3, Check, X,
  TrendingUp, TrendingDown, AlertTriangle, Clock,
  Mail, Webhook, Volume2, VolumeX
} from 'lucide-react';

interface PriceAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: string;
  alertType: 'price_above' | 'price_below' | 'price_change' | 'volume_spike' | 'new_listing';
  targetValue: number;
  currentValue: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  notificationMethods: {
    browser: boolean;
    email: boolean;
    webhook: boolean;
    sound: boolean;
  };
  webhookUrl?: string;
  email?: string;
}

interface AlertFormData {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: string;
  alertType: string;
  targetValue: string;
  notificationMethods: {
    browser: boolean;
    email: boolean;
    webhook: boolean;
    sound: boolean;
  };
  webhookUrl: string;
  email: string;
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [formData, setFormData] = useState<AlertFormData>({
    tokenAddress: '',
    tokenSymbol: '',
    tokenName: '',
    chain: 'base',
    alertType: 'price_above',
    targetValue: '',
    notificationMethods: {
      browser: true,
      email: false,
      webhook: false,
      sound: true,
    },
    webhookUrl: '',
    email: '',
  });

  useEffect(() => {
    loadAlerts();
    requestNotificationPermission();
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    const saved = localStorage.getItem('price_alerts');
    if (saved) setAlerts(JSON.parse(saved));
  };

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    localStorage.setItem('price_alerts', JSON.stringify(newAlerts));
    setAlerts(newAlerts);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const createAlert = async () => {
    if (!formData.tokenAddress || !formData.targetValue) return;
    const currentPrice = Math.random() * 100;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      tokenAddress: formData.tokenAddress,
      tokenSymbol: formData.tokenSymbol || 'TOKEN',
      tokenName: formData.tokenName || 'Unknown Token',
      chain: formData.chain,
      alertType: formData.alertType as any,
      targetValue: parseFloat(formData.targetValue),
      currentValue: currentPrice,
      isActive: true,
      createdAt: new Date().toISOString(),
      notificationMethods: formData.notificationMethods,
      webhookUrl: formData.webhookUrl || undefined,
      email: formData.email || undefined,
    };

    saveAlerts([...alerts, newAlert]);
    resetForm();
    setShowCreateForm(false);
  };

  const updateAlert = (id: string, updates: Partial<PriceAlert>) => {
    const updatedAlerts = alerts.map(a => (a.id === id ? { ...a, ...updates } : a));
    saveAlerts(updatedAlerts);
  };

  const deleteAlert = (id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    const current = alerts.find(a => a.id === id);
    if (current) updateAlert(id, { isActive: !current.isActive });
  };

  const checkAlerts = async () => {
    for (const alert of alerts.filter(a => a.isActive && !a.triggeredAt)) {
      const newPrice = alert.currentValue * (1 + (Math.random() - 0.5) * 0.1);
      updateAlert(alert.id, { currentValue: newPrice });

      let shouldTrigger = false;
      let message = '';

      switch (alert.alertType) {
        case 'price_above':
          if (newPrice >= alert.targetValue) {
            shouldTrigger = true;
            message = `${alert.tokenSymbol} şu anda $${alert.targetValue.toFixed(6)} değerinin üzerinde! Güncel fiyat: $${newPrice.toFixed(6)}`;
          }
          break;
        case 'price_below':
          if (newPrice <= alert.targetValue) {
            shouldTrigger = true;
            message = `${alert.tokenSymbol} şu anda $${alert.targetValue.toFixed(6)} değerinin altında! Güncel fiyat: $${newPrice.toFixed(6)}`;
          }
          break;
        case 'price_change':
          const percentChange = Math.abs((newPrice - alert.currentValue) / alert.currentValue) * 100;
          if (percentChange >= alert.targetValue) {
            shouldTrigger = true;
            message = `${alert.tokenSymbol} fiyatı %${percentChange.toFixed(2)} değişti! Güncel fiyat: $${newPrice.toFixed(6)}`;
          }
          break;
      }

      if (shouldTrigger) {
        await triggerAlert(alert, message);
      }
    }
  };

  const triggerAlert = async (alert: PriceAlert, message: string) => {
    updateAlert(alert.id, { triggeredAt: new Date().toISOString() });

    if (alert.notificationMethods.browser && Notification.permission === 'granted') {
      new Notification('Fiyat Uyarısı!', {
        body: message,
        icon: '/favicon.ico',
      });
    }
    if (alert.notificationMethods.sound && soundEnabled) {
      new Audio('/notification-sound.mp3').play().catch(() => {});
    }
    if (alert.notificationMethods.webhook && alert.webhookUrl) {
      try {
        await fetch(alert.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert_id: alert.id,
            token: alert.tokenSymbol,
            message,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Webhook bildirimi başarısız oldu:', err);
      }
    }
    if (alert.notificationMethods.email && alert.email) {
      console.log(`E-posta bildirimi ${alert.email} adresine gönderildi: ${message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      tokenAddress: '',
      tokenSymbol: '',
      tokenName: '',
      chain: 'base',
      alertType: 'price_above',
      targetValue: '',
      notificationMethods: {
        browser: true,
        email: false,
        webhook: false,
        sound: true,
      },
      webhookUrl: '',
      email: '',
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_above':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'price_below':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'price_change':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAlertDescription = (alert: PriceAlert) => {
    switch (alert.alertType) {
      case 'price_above':
        return `${formatCurrency(alert.targetValue)} üzerine çıkınca uyar`;
      case 'price_below':
        return `${formatCurrency(alert.targetValue)} altına inince uyar`;
      case 'price_change':
        return `Fiyat %${alert.targetValue} değişince uyar`;
      default:
        return 'Fiyat uyarısı';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BellRing className="w-6 h-6" />
            Fiyat Uyarıları
          </h2>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'
            }`}
            title={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Uyarı Oluştur
        </button>
      </div>

      {/* İstatistik bölümü (kendi kodunuzu buraya ekleyin) */}

      {/* Uyarı listesi */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Henüz uyarı yok</p>
            <p className="text-sm">Fiyat hareketlerinden haberdar olmak için ilk uyarınızı oluşturun</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 transition-all ${
                alert.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
              } ${alert.triggeredAt ? 'border-green-200 bg-green-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Uyarı bilgilerinizi burada tutmaya devam edin */}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.isActive
                        ? 'text-orange-600 hover:bg-orange-100'
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                    title={alert.isActive ? 'Uyarıyı duraklat' : 'Uyarıyı etkinleştir'}
                  >
                    {alert.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditingAlert(alert)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    title="Uyarıyı düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Uyarıyı sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Uyarı Oluşturma Modali */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Uyarı Oluştur</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                createAlert();
              }}
              className="space-y-4"
            >
              {/* Form alanlarınızı buraya ekleyin */}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Uyarı Düzenleme Modali */}
      {editingAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Uyarıyı Düzenle</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                updateAlert(editingAlert.id, {
                  ...editingAlert,
                  targetValue: parseFloat(formData.targetValue || editingAlert.targetValue.toString()),
                  notificationMethods: formData.notificationMethods,
                  webhookUrl: formData.webhookUrl || undefined,
                  email: formData.email || undefined,
                });
                setEditingAlert(null);
                resetForm();
              }}
              className="space-y-4"
            >
              {/* Form alanlarınızı burada tekrarlayın */}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlert(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  İptal
                </button

