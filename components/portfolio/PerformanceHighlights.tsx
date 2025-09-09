'use client'

interface Highlight {
  label: string
  value: string
}

export default function PerformanceHighlights({ highlights }: { highlights: Highlight[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {highlights.map((h, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">{h.label}</p>
          <p className="text-xl font-semibold">{h.value}</p>
        </div>
      ))}
    </div>
  )
}
