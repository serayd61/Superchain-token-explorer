"use client";
import React, { useEffect, useMemo, useState } from "react";

/**
 * PriceAlerts.tsx — single-piece rewrite
 * - All action buttons: type="button" (form submit engellenir)
 * - Edit button className tamam
 * - Fiyat input sanitize (boşluk/harf temizleme, tek nokta, virgül→nokta)
 * - Düzenlemede kopya uyarı kontrolü (mevcut id hariç)
 * - İlk yüklemede loading state (flicker yok)
 * - A11y: aria-live, aria-invalid vs.
 */

type Currency = "USD" | "CHF" | "EUR";
type Comparator = "above" | "below" | "crosses";

type Alert = {
  id: string;
  coin: string;
  comparator: Comparator;
  price: number; // threshold in selected currency
  currency: Currency;
  note?: string;
  enabled: boolean;
  createdAt: string; // ISO
};

const SUPPORTED_COINS = [
  "BTC",
  "ETH",
  "OP",
  "ENA",
  "HDX",
  "MODE",
  "HEU",
  "EXTRA",
] as const;

const SUPPORTED_CURRENCIES: Currency[] = ["USD", "CHF", "EUR"];
const STORAGE_KEY = "price_alerts_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
function validatePositiveNumber(value: string): number | null {
  if (!value) return null;
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) return num;
  return null;
}
// allow digits + single dot, trim spaces, comma->dot
function sanitizePriceInput(raw: string): string {
  const trimmed = raw.replace(/\s+/g, "").replace(/,/g, ".");
  const only = trimmed.replace(/[^0-9.]/g, "");
  const parts = only.split(".");
  if (parts.length <= 1) return only;
  return parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
}

export default function PriceAlerts() {
  // ---------------- State ----------------
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [coin, setCoin] = useState<string>(SUPPORTED_COINS[0]);
  const [comparator, setComparator] = useState<Comparator>("above");
  const [priceInput, setPriceInput] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("CHF");
  const [note, setNote] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false);

  // -------------- Persistence --------------
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
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
      // Optional external event
      window.dispatchEvent(
        new CustomEvent("price-alerts-changed", { detail: { alerts } })
      );
    } catch (e) {
      console.warn("Failed to persist alerts", e);
    }
  }, [alerts]);

  // -------------- Derived --------------
  const totalCount = alerts.length;
  const activeCount = useMemo(
    () => alerts.filter((a) => a.enabled).length,
    [alerts]
  );

  // -------------- Handlers --------------
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

    // Prevent duplicates (exclude currently edited id)
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
              }
            : a
        )
      );
      resetForm();
      return;
    }

    const newAlert: Alert = {
      id: uid(),
      coin,
      comparator,
      price,
      currency,
      note: note || undefined,
      enabled: true,
      createdAt: new Date().toISOString(),
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
    document.getElementById("price-alerts-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  // -------------- UI --------------
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 md:p-8 border border-black/5 dark:border-white/10">
      {/* Live region for status updates */}
      <p className="sr-only" aria-live="polite">
        {activeCount} active alerts out of {totalCount} total.
      </p>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Price Alerts
          </h2>
          <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            Local only
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm" role="status" aria-live="polite">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200">
            Total: <strong className="font-semibold">{totalCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            Active: <strong className="font-semibold">{activeCount}</strong>
          </span>
        </div>
      </div>

      {/* Form */}
      <form
        id="price-alerts-form"
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-8"
        aria-label={editingId ? "Edit alert" : "Create alert"}
      >
        {/* Coin */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Coin
          </label>
          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUPPORTED_COINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Comparator */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Condition
          </label>
          <select
            value={comparator}
            onChange={(e) => setComparator(e.target.value as Comparator)}
            className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
            <option value="crosses">Crosses</option>
          </select>
        </div>

        {/* Price */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Price
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={priceInput}
            onChange={(e) => setPriceInput(sanitizePriceInput(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault(); // space blok
            }}
            aria-invalid={!!error}
            className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Currency */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., scalp alert"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit / Cancel */}
        <div className="md:col-span-12 flex items-center gap-3">
          <button
            type="submit"
            className={classNames(
              "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm",
              "bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={!priceInput}
          >
            {editingId ? "Save changes" : "Create alert"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm border border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          )}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
              {error}
            </p>
          )}
        </div>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Coin</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Threshold</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Note</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-neutral-900">
            {!loaded ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading alerts…
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
                  No alerts yet. Create your first one above.
                </td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{a.coin}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 capitalize">{a.comparator}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {a.price.toLocaleString(undefined, { maximumFractionDigits: 8 })} {a.currency}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[240px] truncate" title={a.note}>
                    {a.note ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={classNames(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                        a.enabled
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
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
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                      >
                        {a.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditStart(a)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-indigo-300 text-indigo-700 dark:text-indigo-300 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-300 text-red-700 dark:text-red-300 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300"
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

      {/* Footer helper */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
        These alerts are stored locally in your browser (localStorage). Hook them up to your
        real-time price feed and notification system (e.g., toasts, email, Telegram) as needed.
      </p>
    </div>
  );
}
