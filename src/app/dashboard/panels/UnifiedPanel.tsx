"use client";

import React from "react";
import AdminTabs from "@/components/admin/AdminTabs";
import VotingSection from "@/components/shared/VotingSection";
import { Role } from "@/utils/Roles";

export default function UnifiedPanel({ role = Role.Admin }: { role?: Role }) {
  const renderByRole = () => {
    if (role === Role.Admin) return <AdminTabs />;
    if (role === Role.Jury) return <VotingSection role={Role.Jury} title="Jury Panel" />;
    if (role === Role.User) return <VotingSection role={Role.User} title="User Panel" />;
    return <div className="p-6">No role selected</div>;
  };

  return <div className="min-h-screen bg-gray-50 text-gray-900">{renderByRole()}</div>;
}
