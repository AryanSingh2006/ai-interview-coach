"use client";


import { useRouter } from "next/navigation";

 
import React, { useState } from "react";
import {
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Map,
  User,
  Settings,
  Search,
  Bell,
  HelpCircle,
  CalendarDays,
  Star,
  Zap,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";


const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Interviews", icon: MessageSquare },
  { label: "Reports", icon: BarChart3 },
  { label: "Learning Plan", icon: Map },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
];

const SKILLS = [
  { label: "Problem Solving", value: 92 },
  { label: "System Design", value: 78 },
  { label: "Communication", value: 85 },
  { label: "Algorithm efficiency", value: 64 },
];

const REPORTS = [
  {
    date: "Oct 24, 2023",
    title: "Full Stack Engineer",
    subtitle: "Mock Session #42",
    score: "88/100",
    status: "Excellent",
    statusStyle: "bg-emerald-50 text-emerald-600",
  },
  {
    date: "Oct 21, 2023",
    title: "Data Scientist",
    subtitle: "SQL Logic Deep Dive",
    score: "72/100",
    status: "Good",
    statusStyle: "bg-slate-100 text-slate-500",
  },
  {
    date: "Oct 18, 2023",
    title: "Backend Lead",
    subtitle: "Architecture Review",
    score: "54/100",
    status: "Needs Improvement",
    statusStyle: "bg-rose-50 text-rose-500",
  },
];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div className="min-h-screen w-full flex bg-[#F5F7FB] text-slate-900">
      
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-slate-100 sticky top-0 h-screen shrink-0">
        
        <div className="px-6 pt-7 pb-6">
          <h1 className="text-xl font-extrabold text-blue-700 leading-none">
            InterviewPro
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Tier</p>
        </div>

        
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveNav(label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
                {label}
              </button>
            );
          })}
        </nav>

       
        <div className="px-3 pb-7 pt-3">
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors duration-150"
          >
            New Interview
          </button>
        </div>
      </aside>

      
     
      <div className="flex-1 flex flex-col min-w-0">
       
        <header className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search data, interviews..."
              aria-label="Search data, interviews"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Notifications"
              className="text-slate-400 hover:text-blue-600 transition-colors duration-150"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Help"
              className="text-slate-400 hover:text-blue-600 transition-colors duration-150"
            >
              <HelpCircle className="w-5 h-5" aria-hidden="true" />
            </button>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm"
              aria-label="User profile"
            >
              JD
            </div>
          </div>
        </header>

       
        <main className="flex-1 px-5 sm:px-8 py-7 space-y-6">
        
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Overview</h2>
            <p className="text-sm text-slate-500 mt-1">
              Here&apos;s your interview performance summary for this month.
            </p>
          </div>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
           
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Total Interviews
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">12</p>
              <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                +2 this week
              </p>
            </div>

           
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                  <Star className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Avg Score
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-3">84%</p>
              <div className="w-full h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-blue-600"
                  style={{ width: "84%" }}
                />
              </div>
            </div>

           
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600">
                  <Zap className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Strength
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900">Technical</p>
              <p className="text-sm text-slate-500 mt-1">Architecture &amp; Logic</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-500">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Weakness
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900">SQL</p>
              <p className="text-sm text-slate-500 mt-1">Query Optimization</p>
            </div>
          </div>

          {/* Score trend + Skill progress */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Score Trend */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Score Trend</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  Last 30 days
                </span>
              </div>

              <svg
                viewBox="0 0 600 200"
                className="w-full h-44"
                preserveAspectRatio="none"
                role="img"
                aria-label="Score trend line chart, rising from week 1 to week 4"
              >
                {[20, 70, 120, 170].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="#EDF1F7"
                    strokeWidth="1"
                  />
                ))}

                
                <path
                  d="M0,170 C60,170 90,90 150,90 C190,90 205,150 235,150 C275,150 295,70 340,70 C380,70 390,110 410,110 C450,110 480,20 520,20 C545,20 565,35 585,12"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

               
                {[
                  [235, 150],
                  [340, 70],
                  [520, 20],
                ].map(([cx, cy]) => (
                  <circle key={cx} cx={cx} cy={cy} r="5" fill="#1E3A8A" />
                ))}
              </svg>

              <div className="flex justify-between text-xs font-medium text-slate-400 mt-2 px-1">
                <span>WK 1</span>
                <span>WK 2</span>
                <span>WK 3</span>
                <span>WK 4</span>
              </div>
            </div>

            
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Skill Progress
              </h3>
              <div className="space-y-5">
                {SKILLS.map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-600">{label}</span>
                      <span className="text-sm font-bold text-slate-900">
                        {value}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">Recent Reports</h3>
              <button
                type="button"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Interview Type
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REPORTS.map((row) => (
                    <tr
                      key={row.date + row.title}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {row.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {row.subtitle}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 whitespace-nowrap">
                        {row.score}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${row.statusStyle}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 py-5 bg-white border-t border-slate-100 text-sm">
          <span className="font-bold text-slate-900">InterviewPro</span>
          <span className="text-slate-400 text-xs sm:text-sm">
            © 2024 InterviewPro SaaS. All rights reserved.
          </span>
          <div className="flex items-center gap-5 text-blue-600 text-xs sm:text-sm font-medium">
            <a href="#privacy" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:underline">
              Terms of Service
            </a>
            <a href="#contact" className="hover:underline">
              Contact Us
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

