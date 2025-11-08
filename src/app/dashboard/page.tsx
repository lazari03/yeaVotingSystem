"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import DashboardHeader from "./dashboardComponents/DashboardHeader";
import WelcomeCard from "./dashboardComponents/WelcomeCard";
import StatsGrid from "./dashboardComponents/StatsGrid";
import QuickActions from "./dashboardComponents/QuickActions";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, loading, stats, initializeAuth, logout } = useDashboardStore();

  useEffect(() => {
    const unsubscribe = initializeAuth(() => {
      router.push("/login");
    });

    return () => unsubscribe();
  }, [router, initializeAuth]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardHeader onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeCard userName={user?.displayName || user?.email || "User"} />
        
        <StatsGrid
          totalVotes={stats.totalVotes}
          activeCompetitions={stats.activeCompetitions}
          teams={stats.teams}
          juryMembers={stats.juryMembers}
        />

        <QuickActions />
      </main>
    </div>
  );
};

export default DashboardPage;
