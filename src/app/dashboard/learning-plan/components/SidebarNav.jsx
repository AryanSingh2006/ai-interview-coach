"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: "Dashboard",     icon: "📊", href: "/dashboard" },
  { label: "Interviews",    icon: "💬", href: "/resume" },
  { label: "Reports",       icon: "📈", href: "/reports" },
  { label: "Learning Plan", icon: "🗺️", href: "/dashboard/learning-plan" },
  { label: "Profile",       icon: "👤", href: "/profile" },
  { label: "Settings",      icon: "⚙️", href: "/dashboard/settings" },
];

export default function SidebarNav() {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/60 p-5 flex flex-col justify-between flex-shrink-0 lg:min-h-screen">
      <div className="space-y-8 w-full">
        {/* Brand Label */}
        <div className="flex items-center space-x-2.5 px-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="text-white font-black text-xs">I</span>
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-slate-900 block">InterviewPro</span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block -mt-0.5">Enterprise Tier</span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-row lg:flex-col flex-wrap gap-1 w-full overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <button
                key={link.label}
                onClick={() => router.push(link.href)}
                className={`text-left font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center space-x-3 flex-shrink-0 border-l-2 ${
                  isActive
                    ? 'bg-blue-50/40 text-blue-600 border-blue-600'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span className="text-sm select-none opacity-80">{link.icon}</span>
                <span className="tracking-wide">{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* New Interview CTA */}
      <div className="hidden lg:block pt-6 border-t border-slate-50">
        <button
          onClick={() => router.push('/resume')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition transform active:scale-[0.98] tracking-wide uppercase"
        >
          New Interview
        </button>
      </div>
    </aside>
  );
}