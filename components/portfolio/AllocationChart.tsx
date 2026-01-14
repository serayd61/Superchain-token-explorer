'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface AllocationItem {
  name: string
  value: number
}

const COLORS = ['#2563eb', '#9333ea', '#16a34a', '#f59e0b', '#dc2626']

export default function AllocationChart({ data }: { data: AllocationItem[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
