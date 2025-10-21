"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import AdminTabs from "@/components/admin/AdminTabs";
import VotingSection from "@/components/shared/VotingSection";

type Role = "admin" | "jury" | "user";
function getRole(): Role {
  // TODO: Wire auth and derive role from session. Hard-coded for now.
  return "admin";
}

export default function Page() {
  const role = getRole();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar role={role} />
      <main className="flex-1 p-6 overflow-y-auto">
        {role === "admin" && <AdminTabs />}
        {role === "jury" && <VotingSection role="jury" title="Jury Panel" />}
        {role === "user" && <VotingSection role="user" title="User Panel" />}
      </main>
    </div>
  );
}
