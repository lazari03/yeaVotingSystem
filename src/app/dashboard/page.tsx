"use client";

import React from "react";
import { useDashboardStore } from "./hooks/useDashboardStore";
import Sidebar from "./Components/layout/Sidebar";
import AdminPanel from "./panels/AdminPanel";
import JuryPanel from "./panels/JuryPanel";
import UserPanel from "./panels/UserPanel";

export default function Page() {
  const { role, darkMode } = useDashboardStore();

  const renderPanel = () => {
    switch (role) {
      case "admin":
        return <AdminPanel />;
      case "jury":
        return <JuryPanel />;
      case "user":
        return <UserPanel />;
      default:
        return <div className="p-6">No role selected</div>;
    }
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderPanel()}
      </main>
    </div>
  );
}
