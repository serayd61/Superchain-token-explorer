'use client'

import { useState } from "react"

interface Holding {
  symbol: string
  amount: number
  value: number
}

interface Props {
  isOpen: boolean
  onAdd: (holding: Holding) => void
  onClose: () => void
}

export default function AddTokenModal({ isOpen, onAdd, onClose }: Props) {
  const [symbol, setSymbol] = useState('')
  const [amount, setAmount] = useState(0)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ symbol, amount, value: 0 })
    setSymbol('')
    setAmount(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg space-y-4 w-80">
        <h3 className="text-lg font-semibold">Add Token</h3>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="Symbol"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(parseFloat(e.target.value))}
          placeholder="Amount"
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
            Add
          </button>
        </div>
      </form>
    </div>
  )
}
