import React from 'react'
import { Pencil } from 'lucide-react'

export function ProfileCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 shadow-card">
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <img
          src="https://i.pravatar.cc/200?img=12"
          alt="Alex Johnson"
          className="w-20 h-20 rounded-full object-cover border border-border"
        />
        <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white">
          <Pencil size={12} />
        </span>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold text-ink">Alex Johnson</h2>
        <p className="text-sm text-gray-500">alex.johnson@example.com</p>
        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-xs font-medium bg-blue-50 text-primary px-3 py-1 rounded-full">
            Senior Frontend Engineer
          </span>
          <span className="text-xs font-medium bg-emerald-50 text-success px-3 py-1 rounded-full">
            Level: Expert
          </span>
        </div>
      </div>

      <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-center">
        <button className="flex-1 sm:flex-none bg-primary hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
          Edit Portfolio
        </button>
        <button className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-ink text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
          Download CV
        </button>
      </div>
    </div>
  )
}

export function TargetGoalCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
      <h3 className="font-semibold text-ink">Target Goal</h3>
      <p className="mt-1 text-sm text-gray-500">Aiming for top-tier tech companies.</p>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">Preparation Readiness</span>
        <span className="font-semibold text-primary">85%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: '85%' }} />
      </div>
      <p className="mt-3 text-xs text-gray-400 italic">Estimated 2 weeks to peak readiness</p>
    </div>
  )
}
