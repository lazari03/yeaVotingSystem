"use client";

import React from "react";

type Role = "admin" | "jury" | "user";

export default function Sidebar({ role = "admin" }: { role?: Role }) {
  const sectionsByRole: Record<Role, string[]> = {
    admin: ["Users", "Teams", "Competitions", "Jury", "Criteria"],
    jury: ["Voting"],
    user: ["Voting"],
  };

  return (
    <aside
      className="w-64 min-h-screen p-6 flex flex-col justify-between transition-colors duration-300 bg-white text-gray-900 shadow-lg"
    >
      <div>
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Dashboard
        </h1>

        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-gray-400">Available Sections</h2>
          <ul className="list-disc pl-5 space-y-1">
            {sectionsByRole[role].map((section) => (
              <li key={section} className="text-sm">{section}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center border-t pt-3">
        <span className="text-sm">
          Current Role: <span className="font-medium capitalize">{role}</span>
        </span>
      </div>
    </aside>
  );
}
