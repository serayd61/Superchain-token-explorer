"use client"

import { useEffect, useState } from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { Info } from "lucide-react"

export type TokenEntry = {
  chain: string
  block: number
  hash: string
  from: string
  timestamp: string
  lp_status: string
  top_holders?: {
    address: string
    balance: string
  }[]
}

export function TokenTable() {
  const [tokens, setTokens] = useState<TokenEntry[]>([])
  const [filteredTokens, setFilteredTokens] = useState<TokenEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedChain, setSelectedChain] = useState("all")

  useEffect(() => {
    fetch("/base_tokenlar_lp.json")
      .then((res) => res.json())
      .then((data: TokenEntry[]) => {
        setTokens(data)
        setFilteredTokens(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const filtered = tokens.filter((token) => {
      const matchesChain =
        selectedChain === "all" || token.chain === selectedChain
      const matchesSearch =
        token.hash.toLowerCase().includes(search.toLowerCase()) ||
        token.from.toLowerCase().includes(search.toLowerCase()) ||
        token.block.toString().includes(search)
      return matchesChain && matchesSearch
    })
    setFilteredTokens(filtered)
  }, [search, selectedChain, tokens])

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">New Token Deployments</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by hash, address or block..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Chains</option>
          <option value="base">Base</option>
          <option value="mode">Mode</option>
          <option value="zora">Zora</option>
        </select>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Chain</th>
            <th className="border p-2">Block</th>
            <th className="border p-2">Tx Hash</th>
            <th className="border p-2">Deployer</th>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">LP</th>
          </tr>
        </thead>
        <tbody>
          {filteredTokens.map((t, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border p-2">{t.chain}</td>
              <td className="border p-2">{t.block}</td>
              <td className="border p-2">
                <a
                  href={`https://explorer.${t.chain}.org/tx/${t.hash}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {t.hash.slice(0, 10)}...
                </a>
              </td>
              <td className="border p-2">{t.from.slice(0, 10)}...</td>
              <td className="border p-2">
                {new Date(t.timestamp).toLocaleString()}
              </td>
              <td className="border p-2 flex items-center gap-1">
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

                {t.top_holders && t.top_holders.length > 0 && (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button className="ml-1 text-gray-500 hover:text-black">
                        <Info size={16} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      side="top"
                      className="bg-white border shadow-md rounded p-2 text-xs max-w-xs z-50"
                    >
                      <div className="font-semibold mb-1">Top Holders:</div>
                      <ul className="list-disc pl-4">
                        {t.top_holders.map((holder, idx) => (
                          <li key={idx}>
                            {holder.address.slice(0, 6)}...
                            {holder.address.slice(-4)}:{" "}
                            {Number(holder.balance).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </Tooltip.Content>
                  </Tooltip.Root>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
