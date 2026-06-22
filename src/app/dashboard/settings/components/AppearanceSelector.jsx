"use client";

import React from 'react';

export default function AppearanceSelector({ currentTheme, onChangeTheme }) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm border-b border-slate-50 pb-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <h3>Appearance</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Light Mode Selection Mock Card */}
        <div 
          onClick={() => onChangeTheme('light')}
          className={`group cursor-pointer border rounded-xl overflow-hidden p-3 flex flex-col items-center gap-3 transition-all ${currentTheme === 'light' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
        >
          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 shadow-inner">
            <div className="w-1/2 h-2 bg-slate-300 rounded-full"></div>
            <div className="w-3/4 h-1.5 bg-slate-200 rounded-full"></div>
            <div className="w-2/3 h-1.5 bg-slate-200 rounded-full"></div>
          </div>
          <span className="text-xs font-bold text-slate-700">Light Mode</span>
        </div>

        {/* Dark Mode Selection Mock Card */}
        <div 
          onClick={() => onChangeTheme('dark')}
          className={`group cursor-pointer border rounded-xl overflow-hidden p-3 flex flex-col items-center gap-3 transition-all ${currentTheme === 'dark' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
        >
          <div className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-3 space-y-1.5 shadow-inner">
            <div className="w-1/2 h-2 bg-slate-700 rounded-full"></div>
            <div className="w-3/4 h-1.5 bg-slate-800 rounded-full"></div>
            <div className="w-2/3 h-1.5 bg-slate-800 rounded-full"></div>
          </div>
          <span className="text-xs font-bold text-slate-700">Dark Mode</span>
        </div>

        {/* Split/System Mode Selection Mock Card */}
        <div 
          onClick={() => onChangeTheme('system')}
          className={`group cursor-pointer border rounded-xl overflow-hidden p-3 flex flex-col items-center gap-3 transition-all ${currentTheme === 'system' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
        >
          <div className="w-full border border-slate-200 rounded-lg flex overflow-hidden shadow-inner h-[58px]">
            <div className="w-1/2 bg-slate-50 p-3 space-y-1.5 border-r border-slate-100">
              <div className="w-full h-2 bg-slate-300 rounded-full"></div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
            </div>
            <div className="w-1/2 bg-[#1e293b] p-3 space-y-1.5">
              <div className="w-full h-2 bg-slate-700 rounded-full"></div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">System</span>
        </div>

      </div>
    </div>
  );
}