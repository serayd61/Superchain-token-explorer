'use client'

import { useEffect, useState } from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"

export type TokenEntry = {
  chain: string
  block: number
  hash: string
  from: string
  timestamp: string
  lp_status: string
  price_chart: number[] | "none"
}

type Props = {
  tokens: TokenEntry[]
}

export default function TokenTable({ tokens }: Props) {
  const [search, setSearch] = useState("")

  const filtered = tokens.filter((t) =>
    t.hash.includes(search) ||
    t.from.includes(search) ||
    t.block.toString().includes(search)
  )

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">New Token Deployments</h1>
      <input
        className="mb-4 p-2 border rounded w-full"
        placeholder="Search by hash, address or block..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="border p-2">Chain</th>
            <th className="border p-2">Block</th>
            <th className="border p-2">Hash</th>
            <th className="border p-2">From</th>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">LP</th>
            <th className="border p-2">Price Chart</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="border p-2">{t.chain}</td>
              <td className="border p-2">{t.block}</td>
              <td className="border p-2 text-blue-500">
                <a
                  href={`https://basescan.org/tx/${t.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.hash.slice(0, 8)}...
                </a>
              </td>
              <td className="border p-2 text-blue-500">
                <a
                  href={`https://basescan.org/address/${t.from}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.from.slice(0, 6)}...
                </a>
              </td>
              <td className="border p-2">{t.timestamp}</td>
              <td className="border p-2">{t.lp_status}</td>
              <td className="border p-2 w-32">
                {Array.isArray(t.price_chart) && t.price_chart.length > 1 ? (
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={t.price_chart.map((y, i) => ({ x: i, y }))}>
                      <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} dot={false} />
                      <XAxis hide dataKey="x" />
                      <YAxis hide domain={['auto', 'auto']} />
                      <RechartsTooltip />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-gray-500 text-sm">No data</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
