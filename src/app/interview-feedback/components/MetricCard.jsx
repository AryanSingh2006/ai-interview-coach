import React from 'react';
import MetricIcon from './MetricIcon';

function RadialProgressBar({ percentage }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} stroke="#e2e8f0" strokeWidth="3.5" fill="transparent" />
        <circle 
          cx="24" 
          cy="24" 
          r={radius} 
          stroke="#1d4ed8" 
          strokeWidth="3.5" 
          fill="transparent" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-slate-700">{percentage}%</span>
    </div>
  );
}

export default function MetricCard({ metric }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between w-full">
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <MetricIcon type={metric.iconType} />
        </div>
        <RadialProgressBar percentage={metric.score} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-1">{metric.label}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">{metric.description}</p>
      </div>
    </div>
  );
}