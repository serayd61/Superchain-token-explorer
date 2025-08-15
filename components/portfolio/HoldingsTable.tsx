'use client'

interface Holding {
  symbol: string
  amount: number
  value: number
}

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left text-sm font-medium">Token</th>
          <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
          <th className="px-4 py-2 text-right text-sm font-medium">Value ($)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {holdings.map(h => (
          <tr key={h.symbol}>
            <td className="px-4 py-2">{h.symbol}</td>
            <td className="px-4 py-2 text-right">{h.amount}</td>
            <td className="px-4 py-2 text-right">{h.value.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
