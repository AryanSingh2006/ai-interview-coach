"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  HelpCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function scoreStyles(score) {
  if (score === null || score === undefined) return { dot: "bg-slate-300", text: "text-slate-400", bg: "bg-slate-50" };
  if (score >= 80) return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 60) return { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100" };
  return { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50" };
}

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Reports() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [avgScore, setAvgScore] = useState(null);

  // Load user info once
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const loadPage = useCallback(async (p) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?page=${p}`);
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions || []);
      setTotal(data.total || 0);

      // Derive avg score from this page for display (0–10 → 0–100)
      const scored = (data.sessions || []).filter((s) => s.overallScore != null);
      if (scored.length > 0) {
        const avg = scored.reduce((a, b) => a + b.overallScore, 0) / scored.length;
        setAvgScore(Math.round(avg * 10));
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(page); }, [page, loadPage]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4 px-4 sm:px-8 py-4">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <HelpCircle size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              {user && (
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interview Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your progress and review detailed performance analysis from your recent mock sessions.
          </p>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div className="grid sm:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Average Score</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {avgScore != null ? avgScore : "—"}
                <span className="text-base font-semibold text-slate-400">/100</span>
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Total Interviews</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">This Page</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{sessions.length}</p>
              <p className="mt-1 text-xs text-slate-400">of {total} total sessions</p>
            </div>
          </div>
        )}

        {/* Sessions table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-semibold text-slate-900">Recent Sessions</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                <Filter size={14} />
                Filter
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1.6fr_0.8fr] gap-4 px-6 py-3 bg-slate-50 border-y border-slate-200 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            <span>Date</span>
            <span>Interview Type</span>
            <span>Score</span>
            <span>Status</span>
            <span>Top Strength</span>
            <span className="text-right">Action</span>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 h-16 animate-pulse bg-slate-50/50" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-400">No completed interviews yet.</p>
              <button
                onClick={() => router.push("/resume")}
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                Start your first interview →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((s) => {
                const scoreDisplay = s.overallScore != null ? Math.round(s.overallScore * 10) : null;
                const styles = scoreStyles(scoreDisplay);
                return (
                  <div
                    key={s.sessionId}
                    className="md:grid md:grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1.6fr_0.8fr] gap-4 px-6 py-4 flex flex-col items-start hover:bg-slate-50/60 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{formatDate(s.completedAt)}</p>
                      <p className="text-xs text-slate-400">{formatDate(s.startedAt)}</p>
                    </div>

                    <div className="mt-2 md:mt-0 flex items-center gap-2">
                      <span className="text-sm text-slate-700 capitalize">{s.interviewType || "—"}</span>
                    </div>

                    <div className="mt-2 md:mt-0">
                      {scoreDisplay != null ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                          {scoreDisplay}/100
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>

                    <div className="mt-2 md:mt-0">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                        {scoreDisplay == null ? "—" : scoreDisplay >= 80 ? "Excellent" : scoreDisplay >= 60 ? "Good" : "Needs Work"}
                      </span>
                    </div>

                    <p className="mt-2 md:mt-0 text-sm text-slate-500 truncate">
                      {s.topStrength || "—"}
                    </p>

                    <div className="mt-3 md:mt-0 md:text-right">
                      <button
                        onClick={() => router.push(`/interview-feedback?sessionId=${s.sessionId}`)}
                        className="text-sm font-medium text-blue-600 border border-blue-200 rounded-lg px-4 py-1.5 hover:bg-blue-50 transition-colors"
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-400">
              {total === 0 ? "No results" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-base font-bold text-slate-900">InterviewPro</span>
          <p className="text-xs text-slate-400">© 2026 InterviewPro SaaS. All rights reserved.</p>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <span className="cursor-default opacity-60">Privacy Policy</span>
            <span className="cursor-default opacity-60">Terms of Service</span>
            <span className="cursor-default opacity-60">Contact Us</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
