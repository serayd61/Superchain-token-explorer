"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

type Currency = "USD" | "CHF" | "EUR";
type Comparator = "above" | "below" | "crosses";

type Alert = {
  id: string;
  coin: string;
  comparator: Comparator;
  price: number;
  currency: Currency;
  note?: string;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
};

const SUPPORTED_COINS = ["BTC","ETH","OP","ENA","HDX","MODE","HEU","EXTRA"] as const;
const SUPPORTED_CURRENCIES: Currency[] = ["USD","CHF","EUR"];
const STORAGE_KEY = "price_alerts_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function validatePositiveNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const num = Number(cleaned);
  if (Number.isFinite(num) && num > 0) return num;
  return null;
}

function sanitizePriceInput(raw: string): string {
  const trimmed = raw.replace(/\s+/g, "").replace(/,/g, ".");
  const only = trimmed.replace(/[^0-9.]/g, "");
  const parts = only.split(".");
  if (parts.length <= 1) return only;
  return parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
}

function formatDateTime() {
  return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [coin, setCoin] = useState<string>(SUPPORTED_COINS[0]);
  const [comparator, setComparator] = useState<Comparator>("above");
  const [priceInput, setPriceInput] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("CHF");
  const [note, setNote] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<string>("serayd61");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Alert[];
        if (Array.isArray(parsed)) setAlerts(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse saved alerts", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
      window.dispatchEvent(
        new CustomEvent("price-alerts-changed", { detail: { alerts } })
      );
    } catch (e) {
      console.warn("Failed to persist alerts", e);
    }
  }, [alerts]);

  useEffect(() => {
    setCurrentDateTime(formatDateTime());
    const timer = setInterval(() => setCurrentDateTime(formatDateTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCount = alerts.length;
  const activeCount = useMemo(
    () => alerts.filter((a) => a.enabled).length,
    [alerts]
  );

  function resetForm() {
    setCoin(SUPPORTED_COINS[0]);
    setComparator("above");
    setPriceInput("");
    setCurrency("CHF");
    setNote("");
    setEditingId(null);
    setError("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const price = validatePositiveNumber(priceInput);
    if (price === null) {
      setError("Please enter a valid price greater than 0.");
      return;
    }

    const duplicate = alerts.some(
      (a) =>
        a.coin === coin &&
        a.comparator === comparator &&
        a.currency === currency &&
        a.price === price &&
        a.id !== (editingId ?? "__none__")
    );
    if (duplicate) {
      setError("An identical alert already exists.");
      return;
    }

    if (editingId) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                coin,
                comparator,
                price,
                currency,
                note: note || undefined,
                lastModifiedAt: currentDateTime,
                lastModifiedBy: currentUser,
              }
            : a
        )
      );
      resetForm();
      return;
    }

    const now = currentDateTime;
    const user = currentUser;

    const newAlert: Alert = {
      id: uid(),
      coin,
      comparator,
      price,
      currency,
      note: note || undefined,
      enabled: true,
      createdAt: now,
      createdBy: user,
      lastModifiedAt: now,
      lastModifiedBy: user,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    resetForm();
  }

  function onEditStart(a: Alert) {
    setEditingId(a.id);
    setCoin(a.coin);
    setComparator(a.comparator);
    setPriceInput(String(a.price));
    setCurrency(a.currency);
    setNote(a.note ?? "");
    setError("");
  }

  function onDelete(id: string) {
    if (!confirm("Delete this alert? This cannot be undone.")) return;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) resetForm();
  }

  function onToggle(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Price Alerts
          </h2>
          <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-indigo-100/20 text-indigo-300">
            Local only
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-gray-200">
            Total: <strong className="font-semibold">{totalCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/20 text-emerald-300">
            Active: <strong className="font-semibold">{activeCount}</strong>
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6 p-4 bg-white/5 rounded-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              Current Date and Time:
            </span>
            <span className="text-sm text-gray-100 font-mono">
              {currentDateTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              Current User Login:
            </span>
            <span className="text-sm text-gray-100">
              {currentUser}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-8">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-300 mb-1">Coin</label>
          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/10 backdrop-blur-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUPPORTED_COINS.map((c) => (
              <option key={c} value={c} className="bg-gray-800">{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-300 mb-1">Condition</label>
          <select
            value={comparator}
            onChange={(e) => setComparator(e.target.value as Comparator)}
            className="w-full rounded-lg border border-white/10 bg-white/10 backdrop-blur-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="above" className="bg-gray-800">Above</option>
            <option value="below" className="bg-gray-800">Below</option>
            <option value="crosses" className="bg-gray-800">Crosses</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">Price</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={priceInput}
            onChange={(e) => setPriceInput(sanitizePriceInput(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-white/10 backdrop-blur-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-300 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full rounded-lg border border-white/10 bg-white/10 backdrop-blur-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c} className="bg-gray-800">{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">Note (optional)</label>
          <input
            type="text"
            placeholder="e.g., scalp alert"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/10 backdrop-blur-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-12 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!priceInput}
          >
            {editingId ? "Save changes" : "Create alert"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-white/10 text-gray-100 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          )}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Coin</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Threshold</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Note</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  Loading alerts…
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No alerts yet. Create your first one above.
                </td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm font-medium text-gray-100">{a.coin}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 capitalize">{a.comparator}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {a.price.toLocaleString(undefined, { maximumFractionDigits: 8 })} {a.currency}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 max-w-[240px] truncate">
                    {a.note ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={classNames(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                        a.enabled
                          ? "bg-emerald-100/20 text-emerald-300"
                          : "bg-white/10 text-gray-300"
                      )}
                    >
                      {a.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggle(a.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/10 hover:bg-white/5 focus:outline-none"
                      >
                        {a.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditStart(a)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-indigo-300/50 text-indigo-300 hover:bg-indigo-900/20 focus:outline-none"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-300/50 text-red-300 hover:bg-red-900/20 focus:outline-none"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        These alerts are stored locally in your browser. Hook them up to your real-time price feed and notification system as needed.
      </p>
    </div>
  );
}
