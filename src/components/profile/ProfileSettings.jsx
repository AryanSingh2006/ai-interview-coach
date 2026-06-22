"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  MessageSquare,
  BarChart2,
  Map,
  User,
  Settings,
  Search,
  Bell,
  HelpCircle,
} from "lucide-react";
import { ProfileCard, TargetGoalCard } from "./ProfileCard.jsx";
import StatsCard from "./StatsCard.jsx";
import ActivityCard from "./ActivityCard.jsx";
import SkillBreakdown from "./SkillBreakdown.jsx";

const NAV_ITEMS = [
  { label: "Dashboard",     icon: LayoutGrid, href: "/dashboard" },
  { label: "Interviews",    icon: MessageSquare, href: "/resume" },
  { label: "Reports",       icon: BarChart2, href: "/reports" },
  { label: "Learning Plan", icon: Map, href: "/dashboard/learning-plan" },
  { label: "Profile",       icon: User, href: "/profile" },
  { label: "Settings",      icon: Settings, href: "/dashboard/settings" },
];

function getInitials(name) {
  if (!name) return "";
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

export default function ProfileSettings() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initials, setInitials] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, meRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/auth/me"),
        ]);
        if (profileRes.ok) setProfileData(await profileRes.json());
        if (meRes.ok) {
          const me = await meRes.json();
          setInitials(getInitials(me.user?.name));
        }
      } catch {
        // silent — children render their own empty states
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-[#F5F7FB] text-slate-900">

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-slate-100 sticky top-0 h-screen shrink-0">
        <div className="px-6 pt-7 pb-6">
          <h1 className="text-xl font-extrabold text-blue-700 leading-none">InterviewPro</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Tier</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive = href === "/profile";
            return (
              <button
                key={label}
                type="button"
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-7 pt-3">
          <button
            type="button"
            onClick={() => router.push("/resume")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors duration-150"
          >
            New Interview
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button type="button" aria-label="Notifications" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Help" className="text-slate-400 hover:text-blue-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm select-none"
              aria-label="User profile"
            >
              {initials || (
                <svg viewBox="0 0 40 40" className="w-full h-full rounded-full">
                  <rect width="40" height="40" fill="#1e293b" />
                  <circle cx="20" cy="15" r="7" fill="#cbd5e1" />
                  <path d="M6 38c0-9 6-14 14-14s14 5 14 14" fill="#cbd5e1" />
                </svg>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-5 sm:px-8 py-7 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Your performance history and skill breakdown.</p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
              <div className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
              <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProfileCard
                    name={profileData?.user?.name}
                    email={profileData?.user?.email}
                  />
                </div>
                <TargetGoalCard />
              </div>

              <StatsCard
                totalInterviews={profileData?.totalInterviews}
                bestScore={profileData?.bestScore != null ? Math.round(profileData.bestScore * 10) : null}
                avgScore={profileData?.avgScore != null ? Math.round(profileData.avgScore * 10) : null}
              />

              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                  <ActivityCard />
                </div>
                <SkillBreakdown skills={profileData?.skills} />
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 py-5 bg-white border-t border-slate-100 text-sm">
          <span className="font-bold text-slate-900">InterviewPro</span>
          <span className="text-slate-400 text-xs sm:text-sm">© 2026 InterviewPro SaaS. All rights reserved.</span>
          <div className="flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-400">
            <span className="cursor-default opacity-60">Privacy Policy</span>
            <span className="cursor-default opacity-60">Terms of Service</span>
            <span className="cursor-default opacity-60">Contact Us</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
