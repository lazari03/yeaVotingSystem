"use client";

import React from "react";
import { useDashboardStore } from "./hooks/useDashboardStore";
import Sidebar from "./Components/layout/Sidebar";
import UnifiedPanel from "./panels/UnifiedPanel";

export default function Page() {
  const { role, darkMode } = useDashboardStore();

  const renderPanel = () => <UnifiedPanel />;

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{renderPanel()}</main>
    </div>
  );
}
