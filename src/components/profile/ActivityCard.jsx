import React from 'react'
import { MessageSquare, Star, TrendingUp } from 'lucide-react'

const STATS = [
  { icon: MessageSquare, label: 'Total Interviews', value: '15', suffix: '' },
  { icon: Star, label: 'Best Score', value: '92', suffix: '%' },
  { icon: TrendingUp, label: 'Average Score', value: '81', suffix: '%' },
]

export default function StatsCard() {
  return (
    <div className="grid sm:grid-cols-3 gap-5">
      {STATS.map(({ icon: Icon, label, value, suffix }) => (
        <div
          key={label}
          className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4 shadow-card hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-ink">
              {value}
              <span className="text-base font-semibold text-gray-400">{suffix}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
