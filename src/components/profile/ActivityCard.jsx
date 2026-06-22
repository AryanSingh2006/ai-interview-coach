"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function typeLabel(interviewType) {
  const map = {
    behavioral:    'Behavioral',
    technical:     'Technical',
    system_design: 'System Design',
    hr:            'HR',
    mixed:         'Mixed',
  };
  return map[interviewType] || interviewType;
}

function scoreBadgeClass(score) {
  if (score == null) return 'bg-slate-100 text-slate-500';
  const pct = Math.round(score * 10);
  if (pct >= 80) return 'bg-emerald-50 text-emerald-700';
  if (pct >= 60) return 'bg-blue-50 text-blue-700';
  return 'bg-amber-50 text-amber-700';
}

export default function ActivityCard() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.recentSessions) setSessions(data.recentSessions);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card">
      <h3 className="font-semibold text-ink mb-4">Recent Activity</h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-3">
            <MessageSquare size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">No interviews yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Complete your first interview to see your activity here.
          </p>
          <button
            onClick={() => router.push('/resume')}
            className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
          >
            Start an Interview →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sessions.map((s) => {
            const pct = s.overallScore != null ? Math.round(s.overallScore * 10) : null;
            return (
              <div
                key={s.sessionId}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{typeLabel(s.interviewType)} Interview</p>
                    <p className="text-xs text-gray-400">{formatDate(s.completedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${scoreBadgeClass(s.overallScore)}`}>
                    {pct != null ? `${pct}%` : '—'}
                  </span>
                  <button
                    onClick={() => router.push(`/interview-feedback?sessionId=${s.sessionId}`)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
