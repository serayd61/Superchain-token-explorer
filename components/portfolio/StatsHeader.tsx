'use client'

interface PortfolioStats {
  totalValue: number
  totalChange: number
}

export default function StatsHeader({ stats }: { stats: PortfolioStats }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold">
        Portfolio Value: ${stats.totalValue.toFixed(2)}
      </h2>
      <p className="text-sm text-gray-600">
        24h Change: {stats.totalChange.toFixed(2)}%
      </p>
    </div>
  )
}
