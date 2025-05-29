// components/TokenTable.tsx
import { useEffect, useState } from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export type TokenEntry = {
  chain: string
  block: number
  hash: string
  from: string
  timestamp: string
  lp_status: string
  price_chart: number[] | "none"
}

export function TokenTable() {
  const [tokens, setTokens] = useState<TokenEntry[]>([])
  const [filteredTokens, setFilteredTokens] = useState<TokenEntry[]>([])

  useEffect(() => {
    fetch("/base_tokenlar_lp.json")
      .then((res) => res.json())
      .then((data: TokenEntry[]) => {
        setTokens(data)
        setFilteredTokens(data)
      })
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">New Token Deployments</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Chain</th>
            <th className="border p-2">Block</th>
            <th className="border p-2">Tx Hash</th>
            <th className="border p-2">From</th>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">LP</th>
            <th className="border p-2">Price Chart</th> {/* ← yeni sütun */}
          </tr>
        </thead>
        <tbody>
          {filteredTokens.map((t, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border p-2">{t.chain}</td>
              <td className="border p-2">{t.block}</td>
              <td className="border p-2">
                <a
                  href={`https://explorer.base.org/tx/${t.hash}`}
                  target="_blank"
                  className="text-blue-600 underline"
                  rel="noreferrer"
                >
                  {t.hash.slice(0, 10)}…
                </a>
              </td>
              <td className="border p-2">{t.from.slice(0, 10)}…</td>
              <td className="border p-2">
                {new Date(t.timestamp).toLocaleString()}
              </td>
              <td className="border p-2">
                <span
                  className={`font-bold ${
                    t.lp_status === "YES"
                      ? "text-green-600"
                      : t.lp_status === "NO"
                      ? "text-gray-400"
                      : "text-red-500"
                  }`}
                >
                  {t.lp_status}
                </span>
              </td>
              <td className="border p-2 w-24 h-12">
                {Array.isArray(t.price_chart) ? (
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={t.price_chart.map((p, idx) => ({ idx, price: p }))}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8884d8"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
