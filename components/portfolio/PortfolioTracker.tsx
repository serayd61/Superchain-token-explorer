'use client'

import { useState } from "react"
import StatsHeader from "@/components/portfolio/StatsHeader"
import PerformanceChart from "@/components/portfolio/PerformanceChart"
import AllocationChart from "@/components/portfolio/AllocationChart"
import HoldingsTable from "@/components/portfolio/HoldingsTable"
import AddTokenModal from "@/components/portfolio/AddTokenModal"
import PerformanceHighlights from "@/components/portfolio/PerformanceHighlights"

interface Holding {
  symbol: string
  amount: number
  value: number
}

interface Stats {
  totalValue: number
  totalChange: number
}

interface PerformancePoint {
  date: string
  value: number
}

interface AllocationItem {
  name: string
  value: number
}

interface Highlight {
  label: string
  value: string
}

export default function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState<Holding[]>([
    { symbol: 'ETH', amount: 1, value: 3200 },
    { symbol: 'OP', amount: 500, value: 900 }
  ])

  const [stats] = useState<Stats>({
    totalValue: portfolio.reduce((sum, h) => sum + h.value, 0),
    totalChange: 2.5
  })

  const [performanceData] = useState<PerformancePoint[]>([
    { date: 'Mon', value: 1000 },
    { date: 'Tue', value: 1200 },
    { date: 'Wed', value: 1300 },
    { date: 'Thu', value: 1250 },
    { date: 'Fri', value: 1500 }
  ])

  const [allocationData] = useState<AllocationItem[]>([
    { name: 'ETH', value: 3200 },
    { name: 'OP', value: 900 }
  ])

  const [highlights] = useState<Highlight[]>([
    { label: 'Best Performer', value: 'ETH' },
    { label: 'Worst Performer', value: 'OP' },
    { label: 'New Tokens', value: '0' }
  ])

  const [isModalOpen, setModalOpen] = useState(false)

  const handleAddToken = (holding: Holding) => {
    setPortfolio([...portfolio, holding])
  }

  return (
    <div className="space-y-6">
      <StatsHeader stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceChart data={performanceData} />
        <AllocationChart data={allocationData} />
      </div>

      <HoldingsTable holdings={portfolio} />

      <PerformanceHighlights highlights={highlights} />

      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Token
      </button>

      <AddTokenModal
        isOpen={isModalOpen}
        onAdd={handleAddToken}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
