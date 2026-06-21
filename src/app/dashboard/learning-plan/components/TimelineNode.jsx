import React from 'react';

export default function TimelineNode({ status, iconType }) {
  // Map dynamic semantic styles based on step progress configuration matrices
  let bgClass = "bg-slate-100 text-slate-400 border-slate-200";
  if (status === "COMPLETED") bgClass = "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20";
  if (status === "CURRENTLY_LEARNING") bgClass = "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20";
  if (status === "FINAL_PROJECT") bgClass = "bg-slate-50 text-slate-300 border-slate-200 border-dashed";

  const renderIcon = () => {
    switch (iconType) {
      case "check":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "compass":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0l1.5 1.5M12 12l-1.5-1.5" />
          </svg>
        );
      case "database":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case "chat":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "lock":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center relative z-10 font-sans transition-all duration-300 ${bgClass}`}>
      {renderIcon()}
    </div>
  );
}