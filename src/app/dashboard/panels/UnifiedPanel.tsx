"use client";

import React from "react";
import AdminTabs from "@/components/admin/AdminTabs";
import VotingSection from "@/components/shared/VotingSection";

type Role = "admin" | "jury" | "user";

export default function UnifiedPanel({ role = "admin" }: { role?: Role }) {
  const renderByRole = () => {
    if (role === "admin") return <AdminTabs />;
    if (role === "jury") return <VotingSection role="jury" title="Jury Panel" />;
    if (role === "user") return <VotingSection role="user" title="User Panel" />;
    return <div className="p-6">No role selected</div>;
  };

  return <div className="min-h-screen bg-gray-50 text-gray-900">{renderByRole()}</div>;
}
