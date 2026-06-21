"use client";

import React, { useState, useEffect } from 'react';
import { learningModulesData } from './data/learningData';
import SidebarNav from './components/SidebarNav';
import HeaderBanner from './components/HeaderBanner';
import TimelineNode from './components/TimelineNode';
import ModuleCard from './components/ModuleCard';

export default function LearningPlanPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulating live state rendering lifecycle load hooks
    setData(learningModulesData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col lg:flex-row selection:bg-blue-100">
      
      {/* 1. Global Side Navigation Bar */}
      <SidebarNav />

      {/* 2. Primary Platform Core Layout Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8 relative">
        
        {/* Dynamic Context Header Module */}
        <HeaderBanner progressPercent={data.overallProgress} />

        {/* 3. Interactive Structural Path Flow Workspace */}
        <div className="relative pl-2 sm:pl-6 space-y-6">
          
          {/* Central Vertical Spine Line Graphic Representation */}
          <div className="absolute left-[25px] sm:left-[41px] top-4 bottom-4 w-0.5 bg-slate-200/80 z-0"></div>

          {/* Map & Loop over dynamic timeline elements dynamically */}
          {data.modules.map((module, index) => (
            <div key={module.id} className="flex items-start space-x-4 sm:space-x-6 relative w-full">
              
              {/* Timeline Indicator Component */}
              <TimelineNode status={module.status} iconType={module.iconType} />

              {/* Data Content Box Panel Component */}
              <div className="flex-1 min-w-0">
                <ModuleCard item={module} />
              </div>

            </div>
          ))}

        </div>

        {/* 4. Floating Operational Custom Control Interface */}
        <button className="fixed bottom-6 right-6 w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

      </main>

    </div>
  );
}