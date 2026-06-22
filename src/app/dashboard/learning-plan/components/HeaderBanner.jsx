import React from 'react';

export default function HeaderBanner({ progressPercent }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Your Learning Path</h1>
        <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-xl">
          Master technical and soft skills through a structured roadmap designed for senior engineering roles.
        </p>
      </div>

      {/* Progress Value Percentage Badge */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 sm:justify-end flex-shrink-0 shadow-sm">
        <span className="text-xs font-bold text-slate-500 tracking-wide">Overall Progress</span>
        <span className="text-base font-black text-blue-600 tracking-tighter bg-white px-2.5 py-1 rounded-lg border border-blue-100/50 shadow-inner font-mono">
          {progressPercent}%
        </span>
      </div>
    </div>
  );
}