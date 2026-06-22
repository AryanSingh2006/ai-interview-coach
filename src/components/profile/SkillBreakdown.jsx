import React from 'react'
import { Lightbulb } from 'lucide-react'

function barColor(value) {
  if (value >= 85) return 'bg-success'
  if (value >= 70) return 'bg-primary'
  return 'bg-gray-400'
}

export default function SkillBreakdown({ skills }) {
  const hasSkills = skills && skills.length > 0

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
      <h3 className="font-semibold text-ink">Skill Breakdown</h3>

      {!hasSkills ? (
        <p className="mt-4 text-sm text-gray-400 italic">
          Complete an interview to see your skill breakdown.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {skills.map(({ dimension, avgScore }) => {
            const label = dimension.charAt(0).toUpperCase() + dimension.slice(1).replace(/_/g, ' ')
            const pct = Math.round(avgScore * 10)
            return (
              <div key={dimension}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="font-semibold text-ink">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
          <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-ink text-sm">Improve Your Score</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Complete more interviews to unlock detailed recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
