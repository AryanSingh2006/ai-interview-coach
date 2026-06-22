"use client";

import React from 'react';

export default function PrivacySecuritySettings() {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm border-b border-slate-50 pb-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3>Privacy & Security</h3>
      </div>

      <div className="divide-y divide-slate-100">
        {/* Row 1: 2FA */}
        <div className="flex items-center justify-between py-4 first:pt-0 gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800">Two-Factor Authentication</h4>
            <p className="text-xs text-slate-400 font-normal">Recommended for high profile account security infrastructure configurations.</p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap px-2 py-1">
            Enable
          </button>
        </div>

        {/* Row 2: Purge Context */}
        <div className="flex items-center justify-between py-4 last:pb-0 gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800">Delete Workspace</h4>
            <p className="text-xs text-slate-400 font-normal">Permanently remove all configuration records, evaluation metrics, and historical recordings data.</p>
          </div>
          <button className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors whitespace-nowrap px-2 py-1">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}