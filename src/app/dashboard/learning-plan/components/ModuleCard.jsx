import React from 'react';

export default function ModuleCard({ item }) {
  const isCompleted = item.status === "COMPLETED";
  const isCurrent = item.status === "CURRENTLY_LEARNING";
  const isUpcoming = item.status === "UPCOMING";
  const isFinal = item.status === "FINAL_PROJECT";

  // Set card boundary highlights conditionally
  let borderStyle = "border-slate-200/80 bg-white";
  if (isCurrent) borderStyle = "border-blue-600 ring-1 ring-blue-600/20 shadow-md bg-white";
  if (isFinal) borderStyle = "border-slate-200 bg-slate-50/50 border-dashed select-none opacity-70";

  return (
    <div className={`w-full border rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-sm flex flex-col justify-between relative overflow-hidden ${borderStyle}`}>
      
      {/* Background Decorative Graphic Layout Element for Active Module */}
      {isCurrent && (
        <div className="absolute top-2 right-12 text-slate-50 font-sans font-black pointer-events-none select-none text-7xl opacity-45 flex items-center justify-center z-0">
          ⚡
        </div>
      )}

      <div className="space-y-4 relative z-10 w-full">
        {/* Card Header Top Utility Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
              {item.status.replace('_', ' ')}
            </span>
            {item.priority && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.priority.includes('High') ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                {item.priority}
              </span>
            )}
          </div>
          {item.duration && (
            <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{item.duration}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-1">
          <h3 className={`text-base font-extrabold tracking-tight ${isFinal ? 'text-slate-400' : 'text-slate-800'}`}>
            {item.title}
          </h3>
          <p className={`text-xs leading-relaxed font-normal ${isFinal ? 'text-slate-400/80' : 'text-slate-400'}`}>
            {item.description}
          </p>
        </div>

        {/* Linear Progress Metric Interface (Exclude Final Phase Block) */}
        {!isFinal && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className={isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'}>
                {item.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-emerald-600' : 'bg-blue-600'}`}
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Triggers Grid for Active Component */}
        {isCurrent && (
          <div className="pt-3 flex flex-wrap items-center gap-2.5">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition transform active:scale-[0.98]">
              Resume Lesson
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition">
              View Exercises
            </button>
          </div>
        )}
      </div>

    </div>
  );
}