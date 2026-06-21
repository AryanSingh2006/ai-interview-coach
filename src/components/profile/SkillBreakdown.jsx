import React from 'react'
import { Lightbulb } from 'lucide-react'

const SKILLS = [
  { label: 'Frontend Core', value: 94 },
  { label: 'Data Structures', value: 78 },
  { label: 'System Architecture', value: 65 },
  { label: 'Behavioral', value: 88 },
]

function barColor(value) {
  if (value >= 85) return 'bg-success'
  if (value >= 70) return 'bg-primary'
  return 'bg-gray-400'
}

export default function SkillBreakdown() {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
      <h3 className="font-semibold text-ink">Skill Breakdown</h3>

      <div className="mt-5 space-y-5">
        {SKILLS.map(({ label, value }) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-600 font-medium">{label}</span>
              <span className="font-semibold text-ink">{value}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full ${barColor(value)}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-border">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recommended Next Step</p>
        <div className="mt-3 flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
          <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-ink text-sm">System Design Intensive</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Focus on caching strategies to boost your score.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
