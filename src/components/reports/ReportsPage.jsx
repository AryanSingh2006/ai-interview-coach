"use client"

import React, { useState } from 'react'
import {
  Search,
  Bell,
  HelpCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Code2,
  Users,
  Layers,
  Binary,
  UserCheck,
} from 'lucide-react'

const STATS = [
  {
    label: 'Average Score',
    value: '82',
    suffix: '/100',
    note: '+4% from last month',
  },
  {
    label: 'Total Interviews',
    value: '24',
    note: '12 behavioral • 12 technical',
  },
]

const SESSIONS = [
  {
    date: 'May 24, 2024',
    time: '10:30 AM',
    type: 'Frontend Technical',
    icon: Code2,
    score: 88,
    improvement: 'Optimize React rendering cycles i...',
  },
  {
    date: 'May 21, 2024',
    time: '2:15 PM',
    type: 'Behavioral Leadership',
    icon: UserCheck,
    score: 92,
    improvement: 'Excellent STAR method applicatio...',
  },
  {
    date: 'May 18, 2024',
    time: '09:00 AM',
    type: 'System Design',
    icon: Layers,
    score: 74,
    improvement: 'Elaborate more on caching...',
  },
  {
    date: 'May 14, 2024',
    time: '4:45 PM',
    type: 'Algorithms & Data Structures',
    icon: Binary,
    score: 62,
    improvement: 'Struggled with Dynamic...',
  },
  {
    date: 'May 10, 2024',
    time: '11:00 AM',
    type: 'Team Fit & Cultural',
    icon: Users,
    score: 85,
    improvement: 'Very strong communication; refin...',
  },
]

function scoreStyles(score) {
  if (score >= 80) return { dot: 'bg-success', text: 'text-success', bg: 'bg-emerald-50' }
  if (score >= 70) return { dot: 'bg-gray-400', text: 'text-ink', bg: 'bg-gray-100' }
  return { dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' }
}

export default function Reports() {
  const [page, setPage] = useState(1)
  const totalPages = 3

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 sm:px-8 py-4">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
              <HelpCircle size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <img
                src="https://i.pravatar.cc/64?img=12"
                alt="Alex Rivera"
                className="w-9 h-9 rounded-full object-cover border border-border"
              />
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-ink">Alex Rivera</p>
                <p className="text-xs text-gray-400">Senior Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-ink">Interview Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your progress and review detailed performance analysis from your recent mock sessions.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Average Score</p>
            <p className="mt-2 text-3xl font-bold text-primary">
              82<span className="text-base font-semibold text-gray-400">/100</span>
            </p>
            <p className="mt-2 text-xs font-medium text-success">↗ +4% from last month</p>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Total Interviews</p>
            <p className="mt-2 text-3xl font-bold text-ink">24</p>
            <p className="mt-2 text-xs text-gray-400">12 behavioral &middot; 12 technical</p>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 shadow-card">
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Top Strength</p>
            <p className="mt-2 text-lg font-bold text-ink">System Architecture</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Scalability', 'Database Design', 'Load Balancing'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium bg-emerald-50 text-success px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions table */}
        <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-semibold text-ink">Recent Sessions</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                <Filter size={14} />
                Filter
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Table header - desktop */}
          <div className="hidden md:grid grid-cols-[1fr_1.4fr_0.8fr_1.6fr_0.8fr] gap-4 px-6 py-3 bg-surface border-y border-border text-xs font-semibold tracking-wide text-gray-400 uppercase">
            <span>Date</span>
            <span>Interview Type</span>
            <span>Score</span>
            <span>Primary Improvement</span>
            <span className="text-right">Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {SESSIONS.map((s) => {
              const styles = scoreStyles(s.score)
              const Icon = s.icon
              return (
                <div
                  key={s.date + s.type}
                  className="md:grid md:grid-cols-[1fr_1.4fr_0.8fr_1.6fr_0.8fr] gap-4 px-6 py-4 flex flex-col items-start"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{s.date}</p>
                    <p className="text-xs text-gray-400">{s.time}</p>
                  </div>

                  <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <Icon size={15} />
                    </span>
                    <span className="text-sm text-ink">{s.type}</span>
                  </div>

                  <div className="mt-2 md:mt-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${styles.bg} ${styles.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {s.score}/100
                    </span>
                  </div>

                  <p className="mt-2 md:mt-0 text-sm text-gray-500 truncate">{s.improvement}</p>

                  <div className="mt-3 md:mt-0 md:text-right">
                    <button className="text-sm font-medium text-primary border border-blue-200 rounded-lg px-4 py-1.5 hover:bg-blue-50 transition-colors">
                      View Report
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-gray-400">Showing 1 to 5 of 24 results</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                disabled={page === 1}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50 border border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                disabled={page === totalPages}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-base font-bold text-ink">InterviewPro</span>
          <p className="text-xs text-gray-400">&copy; 2024 InterviewPro SaaS. All rights reserved.</p>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-ink transition-colors">Contact Us</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
