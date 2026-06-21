"use client";

import React from 'react'
import Header from './Header.jsx'
import { ProfileCard, TargetGoalCard } from './ProfileCard.jsx'
import StatsCard from './StatsCard.jsx'
import ActivityCard from './ActivityCard.jsx'
import SkillBreakdown from './SkillBreakdown.jsx'
import Footer from '../Footer.jsx'

export default function ProfileSettings() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-8 py-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileCard />
          </div>
          <TargetGoalCard />
        </div>

        <StatsCard />

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <ActivityCard />
          </div>
          <SkillBreakdown />
        </div>
      </main>

      <Footer />
    </div>
  )
}
