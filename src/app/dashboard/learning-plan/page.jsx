"use client";

import React, { useState, useEffect } from 'react';
import SidebarNav from './components/SidebarNav';
import HeaderBanner from './components/HeaderBanner';
import TimelineNode from './components/TimelineNode';
import ModuleCard from './components/ModuleCard';

// Map a flat topic string from the API into the shape ModuleCard expects
function topicToModule(topic, index) {
  return {
    id: `topic-${index}`,
    status: index === 0 ? 'CURRENTLY_LEARNING' : 'UPCOMING',
    priority: index < 2 ? 'High Priority' : 'Medium Priority',
    title: topic,
    description: 'Recommended based on your most recent interview performance.',
    progress: 0,
    iconType: index === 0 ? 'compass' : 'database',
    duration: null,
  };
}

export default function LearningPlanPage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/learning-plan');
        if (res.ok) {
          const data = await res.json();
          setModules((data.topics || []).map(topicToModule));
        }
      } catch {
        // silent — empty state handles this
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Empty state — no completed interviews yet
  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col lg:flex-row selection:bg-blue-100">
        <SidebarNav />
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">No Learning Plan Yet</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Complete your first interview to get a personalised learning plan based on your performance.
            </p>
            <a
              href="/resume"
              className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              Start an Interview
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col lg:flex-row selection:bg-blue-100">
      
      {/* Global Side Navigation Bar */}
      <SidebarNav />

      {/* Primary Platform Core Layout Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8 relative">
        
        {/* Dynamic Context Header Module — 0% until user marks progress */}
        <HeaderBanner progressPercent={0} />

        {/* Interactive Timeline */}
        <div className="relative pl-2 sm:pl-6 space-y-6">
          
          {/* Central Vertical Spine */}
          <div className="absolute left-[25px] sm:left-[41px] top-4 bottom-4 w-0.5 bg-slate-200/80 z-0"></div>

          {modules.map((module) => (
            <div key={module.id} className="flex items-start space-x-4 sm:space-x-6 relative w-full">
              <TimelineNode status={module.status} iconType={module.iconType} />
              <div className="flex-1 min-w-0">
                <ModuleCard item={module} />
              </div>
            </div>
          ))}

        </div>

      </main>

    </div>
  );
}