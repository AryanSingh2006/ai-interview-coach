"use client";

import React, { useState, useEffect } from "react";
import Header from "./Header.jsx";
import { ProfileCard, TargetGoalCard } from "./ProfileCard.jsx";
import StatsCard from "./StatsCard.jsx";
import ActivityCard from "./ActivityCard.jsx";
import SkillBreakdown from "./SkillBreakdown.jsx";
import Footer from "../Footer.jsx";

export default function ProfileSettings() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch {
        // silent — children will show their empty states
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-8 py-8 space-y-6 max-w-7xl w-full mx-auto">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-32 bg-white rounded-2xl animate-pulse" />
            <div className="h-24 bg-white rounded-2xl animate-pulse" />
            <div className="h-40 bg-white rounded-2xl animate-pulse" />
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

      <Footer />
    </div>
  );
}
