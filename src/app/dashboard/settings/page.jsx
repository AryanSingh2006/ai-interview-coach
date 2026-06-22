"use client";

import React, { useState, useEffect } from 'react';
import { initialSettingsData } from './data/settingsData';
import AccountSettingsForm from './components/AccountSettingsForm';
import NotificationPreferences from './components/NotificationPreferences';
import AppearanceSelector from './components/AppearanceSelector';
import PrivacySecuritySettings from './components/PrivacySecuritySettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Mimicking client-side asynchronous dynamic data pull hook
    setSettings(initialSettingsData);
  }, []);

  const handleProfileSave = (updatedProfile) => {
    setSettings(prev => ({ ...prev, profile: updatedProfile }));
    alert("Profile configurations updated successfully!");
  };

  const handleNotificationToggle = (id) => {
    setSettings(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, active: !n.active } : n)
    }));
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', label: 'Account Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'privacy', label: 'Privacy & Security' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-2 mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400 font-medium">Manage your account preferences and application configurations.</p>
      </div>

      {/* Primary Layout Splitting Architecture Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Toggle Section Nav Links Menu Panel */}
        <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl overflow-hidden p-2 space-y-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Scroll target segment card cleanly into view focus context on small dynamic viewports
                document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full text-left font-bold text-xs px-4 py-3.5 rounded-xl transition-all flex items-center justify-between border-l-2 ${activeTab === tab.id ? 'bg-blue-50/40 text-blue-600 border-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="text-[10px] text-blue-500 font-bold font-mono tracking-tight">&gt;</span>
              )}
            </button>
          ))}
        </div>

        {/* Right Stacked View Flow Content Canvas */}
        <div className="lg:col-span-3 space-y-6">
          <div id="account">
            <AccountSettingsForm profile={settings.profile} onSave={handleProfileSave} />
          </div>
          <div id="notifications">
            <NotificationPreferences notifications={settings.notifications} onToggle={handleNotificationToggle} />
          </div>
          <div id="appearance">
            <AppearanceSelector currentTheme={theme} onChangeTheme={setTheme} />
          </div>
          <div id="privacy">
            <PrivacySecuritySettings />
          </div>
        </div>

      </div>
    </div>
  );
}