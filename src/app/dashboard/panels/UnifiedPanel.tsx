"use client";

import React from "react";
import { useDashboardStore } from "../hooks/useDashboardStore";
import AdminTabs from "../Components/adminComponents/AdminTabs";
import VotingSection from "../Components/shared/VotingSection";

export default function UnifiedPanel() {
  const { role, darkMode } = useDashboardStore();

  const renderByRole = () => {
    if (role === "admin") return <AdminTabs />;
    if (role === "jury") return <VotingSection role="jury" title="Jury Panel" />;
    if (role === "user") return <VotingSection role="user" title="User Panel" />;
    return <div className="p-6">No role selected</div>;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      {renderByRole()}
    </div>
  );
}
