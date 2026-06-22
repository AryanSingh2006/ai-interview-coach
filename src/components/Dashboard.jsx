"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
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
  { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { label: "Interviews", icon: MessageSquare, href: "/resume" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Learning Plan", icon: Map, href: "/dashboard/learning-plan" },
  { label: "Profile", icon: User, href: "/profile" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function scoreLabel(score) {
  if (score === null || score === undefined) return { text: "—", style: "bg-slate-100 text-slate-400" };
  if (score >= 8) return { text: "Excellent", style: "bg-emerald-50 text-emerald-600" };
  if (score >= 6) return { text: "Good", style: "bg-slate-100 text-slate-500" };
  return { text: "Needs Work", style: "bg-rose-50 text-rose-500" };
}

export default function Dashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, meRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/auth/me"),
        ]);
        if (dashRes.ok) setData(await dashRes.json());
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }
      } catch {
        // silent — show empty states
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const initials = getInitials(user?.name);
  // Backend scores are 0–10; display as 0–100
  const avgScoreDisplay = data?.avgScore != null ? Math.round(data.avgScore * 10) : null;

  return (
    <div className="min-h-screen w-full flex bg-[#F5F7FB] text-slate-900">

      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-slate-100 sticky top-0 h-screen shrink-0">
        <div className="px-6 pt-7 pb-6">
          <h1 className="text-xl font-extrabold text-blue-700 leading-none">InterviewPro</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Tier</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => { setActiveNav(label); router.push(href); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-7 pt-3">
          <button
            type="button"
            onClick={() => router.push("/resume")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors duration-150"
          >
            New Interview
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search data, interviews..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button type="button" aria-label="Notifications" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Help" className="text-slate-400 hover:text-blue-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm"
              aria-label="User profile"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-7 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Overview</h2>
            <p className="text-sm text-slate-500 mt-1">
              {user?.name ? `Welcome back, ${user.name.split(" ")[0]}.` : "Here's your interview performance summary."}
            </p>
          </div>

          {/* Stat Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                    <CalendarDays className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Total Interviews</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{data?.totalSessions ?? 0}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                    <Star className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Avg Score</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mb-3">
                  {avgScoreDisplay != null ? `${avgScoreDisplay}%` : "—"}
                </p>
                {avgScoreDisplay != null && (
                  <div className="w-full h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${avgScoreDisplay}%` }} />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600">
                    <Zap className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Top Strength</span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  {data?.topStrength ?? (data?.totalSessions === 0 ? "No interviews yet" : "—")}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-500">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Top Weakness</span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  {data?.topWeakness ?? (data?.totalSessions === 0 ? "No interviews yet" : "—")}
                </p>
              </div>
            </div>
          )}

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">Recent Reports</h3>
              <button
                type="button"
                onClick={() => router.push("/reports")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                View All
              </button>
            </div>

            {isLoading ? (
              <div className="px-6 pb-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data?.recentSessions?.length ? (
              <div className="px-6 pb-8 text-center">
                <p className="text-sm text-slate-400">No completed interviews yet.</p>
                <button
                  onClick={() => router.push("/resume")}
                  className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Start your first interview →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Interview Type</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Score</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSessions.map((s) => {
                      const scoreDisplay = s.overallScore != null ? Math.round(s.overallScore * 10) : null;
                      const label = scoreLabel(s.overallScore);
                      return (
                        <tr
                          key={s.sessionId}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {formatDate(s.completedAt)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 capitalize">
                            {s.interviewType ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600 whitespace-nowrap">
                            {scoreDisplay != null ? `${scoreDisplay}/100` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${label.style}`}>
                              {label.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => router.push(`/interview-feedback?sessionId=${s.sessionId}`)}
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 py-5 bg-white border-t border-slate-100 text-sm">
          <span className="font-bold text-slate-900">InterviewPro</span>
          <span className="text-slate-400 text-xs sm:text-sm">© 2026 InterviewPro SaaS. All rights reserved.</span>
          <div className="flex items-center gap-5 text-blue-600 text-xs sm:text-sm font-medium">
            <span className="cursor-default opacity-60">Privacy Policy</span>
            <span className="cursor-default opacity-60">Terms of Service</span>
            <span className="cursor-default opacity-60">Contact Us</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
