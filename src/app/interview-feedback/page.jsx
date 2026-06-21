"use client";

import React, { useState, useEffect } from 'react';
import { mockReportData } from './data/mockReportData';
import MetricCard from './components/MetricCard';

export default function InterviewFeedbackPage() {
  // State variable holding full report metrics
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Simulating fetching dynamic data on user interview completion
    // In production, replace this with your real API call: fetch('/api/get-feedback')
    setReportData(mockReportData);
  }, []);

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase animate-pulse">
          Loading report analysis...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 tracking-wide">
          <span>Interviews</span>
          <span>&gt;</span>
          <span>{reportData.metadata.role}</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-bold">{reportData.metadata.status} Report</span>
        </nav>

        {/* Hero Performance Overview Module */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:max-w-3xl">
            
            {/* Hero Radial Score Widget */}
            <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[10px] border-slate-100 flex-shrink-0 bg-white shadow-inner">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter">{reportData.candidate.overallScore}</span>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Overall Score</p>
              </div>
            </div>

            {/* Assessment Meta Text Details */}
            <div className="space-y-2.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {reportData.metadata.status}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Completed on {reportData.metadata.completionDate}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Great job, {reportData.candidate.name}! You're in the {reportData.candidate.percentileTier} of candidates.
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                {reportData.candidate.summary}
              </p>
            </div>
          </div>

          <button className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tracking-wide uppercase">
            Generate Learning Plan
          </button>
        </div>

        {/* Dynamic Skill Matrix Grid Loop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportData.coreMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Primary Analytical Splitting Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Feed Column (Left Side: Executive Assessments) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100/80">
              <h2 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Executive Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              {reportData.executiveSummary.map((paragraph, index) => (
                <p key={index} className="text-sm text-slate-600 leading-relaxed font-normal">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Secondary Metric Feed Column (Right Side: Benchmarks and Notes) */}
          <div className="space-y-6 flex flex-col justify-between">
            
            {/* Interviewer Notes Box */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Interviewer Notes</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center shadow-sm">
                  {reportData.interviewerNotes.interviewerInitials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight">{reportData.interviewerNotes.interviewerName}</h4>
                  <p className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">{reportData.interviewerNotes.interviewerTitle}</p>
                </div>
              </div>
              <blockquote className="text-xs italic text-slate-600 leading-relaxed border-l-2 border-slate-300 pl-3.5">
                &ldquo;{reportData.interviewerNotes.quote}&rdquo;
              </blockquote>
            </div>

            {/* Comparative Placement Progress Bars */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Market Benchmark</h3>
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">You</span>
                    <span className="font-bold text-blue-600">{reportData.marketBenchmark.userScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${reportData.marketBenchmark.userScore}%` }}></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Average Candidate</span>
                    <span className="font-bold text-slate-500">{reportData.marketBenchmark.averageScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-300 h-full rounded-full" style={{ width: `${reportData.marketBenchmark.averageScore}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-50 pt-3">
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                  {reportData.marketBenchmark.percentileComparisonText}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Actionable Vectors Framework: Strengths vs Deficits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Strengths Container */}
          <div className="bg-white border-l-[5px] border-emerald-500 rounded-r-2xl rounded-l p-6 shadow-sm border-y border-r border-slate-100">
            <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>✓ Core Strengths</span>
            </div>
            <ul className="space-y-3">
              {reportData.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Growth Deficits Container */}
          <div className="bg-white border-l-[5px] border-rose-500 rounded-r-2xl rounded-l p-6 shadow-sm border-y border-r border-slate-100">
            <div className="text-rose-600 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>✕ Areas for Growth</span>
            </div>
            <ul className="space-y-3">
              {reportData.growthAreas.map((area, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}