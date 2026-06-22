"use client";

import React, { useEffect, useState } from 'react';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export default function Header({ onMenuClick }) {
  const [initials, setInitials] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user?.name) setInitials(getInitials(data.user.name));
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4 px-4 sm:px-8 py-4">
        <button className="lg:hidden p-2 -ml-2 text-ink" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <Bell size={18} />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <HelpCircle size={18} />
          </button>
          {/* Initials avatar — no external dependency */}
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center border border-border select-none">
            {initials || (
              <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
                <rect width="40" height="40" fill="#1e293b" />
                <circle cx="20" cy="15" r="7" fill="#cbd5e1" />
                <path d="M6 38c0-9 6-14 14-14s14 5 14 14" fill="#cbd5e1" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
