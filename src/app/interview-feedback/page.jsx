"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function InterviewFeedback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided.');
      setIsLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(`/api/interview/${sessionId}/report`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load report.');
          return;
        }
        setReport(data.report);
      } catch {
        setError('Network error. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Score is stored 0–10 in backend; display as 0–100
  const displayScore = Math.round(report.overallScore * 10);

  // Convert dimensionAverages { dimension: score } → array for cards
  const dimensions = Object.entries(report.dimensionAverages || {}).map(([name, score]) => ({
    label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
    score: Math.round(score * 10),
  }));

  const completedDate = report.completedAt
    ? new Date(report.completedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  const interviewTypeLabel = report.interviewType
    ? report.interviewType.charAt(0).toUpperCase() + report.interviewType.slice(1)
    : 'Interview';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 tracking-wide">
          <button onClick={() => router.push('/dashboard')} className="hover:text-slate-600">
            Dashboard
          </button>
          <span>&gt;</span>
          <button onClick={() => router.push('/reports')} className="hover:text-slate-600">
            Reports
          </button>
          <span>&gt;</span>
          <span className="text-slate-600 font-bold">{interviewTypeLabel} Report</span>
        </nav>

        {/* Hero — Overall Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:max-w-3xl">

            {/* Radial score */}
            <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[10px] border-slate-100 flex-shrink-0 bg-white shadow-inner">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter">
                  {displayScore}
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">
                  Overall Score
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-2.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Completed
                </span>
                {completedDate && (
                  <span className="text-xs text-slate-400 font-semibold">
                    {completedDate}
                  </span>
                )}
                {report.interviewType && (
                  <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 capitalize">
                    {report.interviewType}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Interview Complete — Score: {displayScore}/100
              </h1>
              {report.summary && (
                <p className="text-sm text-slate-500 leading-relaxed font-normal max-w-xl">
                  {report.summary}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/learning-plan')}
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tracking-wide uppercase"
          >
            View Learning Plan
          </button>
        </div>

        {/* Dimension Score Cards */}
        {dimensions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dimensions.map(({ label, score }) => (
              <div
                key={label}
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="w-5 h-5 rounded bg-blue-100" />
                  </div>
                  {/* Radial mini */}
                  <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="3.5" fill="transparent" />
                      <circle
                        cx="24" cy="24" r="20"
                        stroke="#1d4ed8" strokeWidth="3.5" fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - score / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-slate-700">{score}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-1">{label}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary + Strengths/Weaknesses grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Executive Summary */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100/80">
              <h2 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Executive Summary
              </h2>
            </div>
            <div className="p-6">
              {report.summary ? (
                <p className="text-sm text-slate-600 leading-relaxed">{report.summary}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No summary available.</p>
              )}
            </div>
          </div>

          {/* Recommended Follow-up Topics */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100/80">
              <h2 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Next Steps
              </h2>
            </div>
            <div className="p-5 space-y-2">
              {report.recommendedFollowUpTopics?.length > 0 ? (
                report.recommendedFollowUpTopics.map((topic, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No follow-up topics.</p>
              )}
            </div>
          </div>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white border-l-[5px] border-emerald-500 rounded-r-2xl rounded-l p-6 shadow-sm border-y border-r border-slate-100">
            <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-4">
              ✓ Core Strengths
            </div>
            {report.strengths?.length > 0 ? (
              <ul className="space-y-3">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                    <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No strengths recorded.</p>
            )}
          </div>

          <div className="bg-white border-l-[5px] border-rose-500 rounded-r-2xl rounded-l p-6 shadow-sm border-y border-r border-slate-100">
            <div className="text-rose-600 font-bold text-xs uppercase tracking-wider mb-4">
              ✕ Areas for Growth
            </div>
            {report.weaknesses?.length > 0 ? (
              <ul className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                    <span className="text-rose-400 font-bold flex-shrink-0">✕</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No growth areas recorded.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function InterviewFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InterviewFeedback />
    </Suspense>
  );
}