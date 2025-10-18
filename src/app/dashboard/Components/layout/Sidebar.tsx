"use client";

import React from "react";
import { useDashboardStore } from "../../hooks/useDashboardStore";

export default function Sidebar() {
  const { role, setRole, darkMode, toggleDarkMode } = useDashboardStore();

  // Sections visible inside the single unified panel per role
  const sectionsByRole: Record<string, string[]> = {
    admin: ["Users", "Teams", "Competitions", "Jury", "Criteria"],
    jury: ["Voting"],
    user: ["Voting"],
  };

  const allRoles = ["admin", "jury", "user"] as const;

  return (
    <aside
      className={`w-64 min-h-screen p-6 flex flex-col justify-between transition-colors duration-300
        ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900 shadow-lg"}`}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Dashboard
        </h1>

        {/* Role Navigation */}
        <nav className="space-y-3">
          {allRoles.map((r) => (
            <button
              key={r}
              className={`w-full text-left px-4 py-2 rounded-2xl font-semibold transition-all duration-200
                ${
                  role === r
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                    : darkMode
                    ? "hover:bg-gray-800 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              onClick={() => setRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </nav>

        {/* Available Sections (inside unified panel) */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-gray-400">Available Sections</h2>
          <ul className="list-disc pl-5 space-y-1">
            {sectionsByRole[role].map((section) => (
              <li key={section} className="text-sm">{section}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center border-t pt-3">
        <span className="text-sm">
          Current Role: <span className="font-medium capitalize">{role}</span>
        </span>
        <button
          className={`ml-2 px-3 py-1 rounded-lg font-medium transition-all duration-200
            ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
          onClick={toggleDarkMode}
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </aside>
  );
}
