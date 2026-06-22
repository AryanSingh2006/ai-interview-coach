import React from 'react'

function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function ProfileCard({ name, email }) {
  const initials = getInitials(name)
  const displayName = name || 'Your Profile'
  const displayEmail = email || ''

  return (
    <div className="bg-white border border-border rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 shadow-card">
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold text-ink">{displayName}</h2>
        {displayEmail && <p className="text-sm text-gray-500">{displayEmail}</p>}
      </div>
    </div>
  )
}

export function TargetGoalCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card flex flex-col gap-4">
      <h3 className="font-semibold text-ink">Your Goal</h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Complete more interviews to build your performance history and track your progress toward your target role.
      </p>
      <a
        href="/resume"
        className="inline-block w-fit text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        Start an Interview →
      </a>
    </div>
  )
}
