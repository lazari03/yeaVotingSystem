"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import AdminTabs from "@/components/admin/AdminTabs";
import VotingSection from "@/components/shared/VotingSection";
import { Role } from "@/utils/Roles";

function getRole(): Role {
  // TODO: Wire auth and derive role from session. Hard-coded for now.
  return Role.Admin;
}

export default function Page() {
  const role = getRole();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar role={role} />
      <main className="flex-1 p-6 overflow-y-auto">
        {role === Role.Admin && <AdminTabs />}
        {role === Role.Jury && <VotingSection role={Role.Jury} title="Jury Panel" />}
        {role === Role.User && <VotingSection role={Role.User} title="User Panel" />}
      </main>
    </div>
  );
}
