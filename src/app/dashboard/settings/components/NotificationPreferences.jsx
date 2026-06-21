"use client";

import React from 'react';

export default function NotificationPreferences({ notifications, onToggle }) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm border-b border-slate-50 pb-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.07 6.07 0 00-1-3.5M3 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3>Notification Preferences</h3>
      </div>

      <div className="divide-y divide-slate-100">
        {notifications.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800">{item.label}</h4>
              <p className="text-xs text-slate-400 font-normal leading-normal">{item.description}</p>
            </div>
            
            {/* Toggle Switch Primitive */}
            <button 
              onClick={() => onToggle(item.id)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${item.active ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${item.active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}