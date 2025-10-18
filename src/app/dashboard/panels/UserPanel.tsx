"use client";

import { useState, useMemo } from "react";
import { useDashboardStore } from "../hooks/useDashboardStore";

export default function UserPanel() {
  const { votes, setVotes, criteria, darkMode } = useDashboardStore();

  const categories = ["Business Idea", "Business Plan", "Changemaker"];
  const teamsByCategory: Record<string, string[]> = {
    "Business Idea": ["Team Alpha", "Team Spark", "Team Vision"],
    "Business Plan": ["Team Orion", "Team Nova"],
    "Changemaker": ["Team Impact", "Team Hope"],
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedCriteria, setSelectedCriteria] = useState<string>(criteria[0] || "");

  const availableTeams = useMemo(
    () => (selectedCategory ? teamsByCategory[selectedCategory] || [] : []),
    [selectedCategory]
  );

  const handleVote = (points: number) => {
    if (!selectedTeam || !selectedCategory || !selectedCriteria) return;

    const key = `${selectedCategory}-${selectedTeam}-${selectedCriteria}`;
    setVotes({ ...votes, [key]: (votes[key] || 0) + points });

    alert(`✅ You voted ${points} pts for ${selectedTeam} (${selectedCriteria}, ${selectedCategory})`);
    setSelectedTeam(""); // reset selection
  };

  const cardStyle = `p-6 rounded-3xl shadow-lg transition-colors duration-300 ${
    darkMode
      ? "bg-gray-800/80 text-white border border-gray-700"
      : "bg-white text-gray-900 border border-gray-200"
  }`;

  const selectStyle = `w-full p-3 rounded-xl border shadow-inner cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
      : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50"
  }`;

  const teamCardStyle = `p-5 rounded-2xl shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
    darkMode
      ? "bg-gray-700/70 text-gray-200 hover:bg-gray-600/80 hover:text-white"
      : "bg-gray-100 text-gray-900 hover:bg-blue-50"
  }`;

  const buttonStyle =
    "px-5 py-2 rounded-2xl font-semibold shadow-md transition-all transform hover:scale-105 active:scale-95 text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600";

  return (
    <div className="p-10 space-y-8 max-w-3xl mx-auto">
      {/* User Panel Title */}
      <h2 className="text-4xl font-extrabold text-center mb-10 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        User Panel
      </h2>

      {/* Category Selector */}
      <div className={cardStyle}>
        <label className="block mb-3 font-semibold text-lg">Select Category</label>
        <select
          className={selectStyle}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedTeam("");
          }}
        >
          <option value="">-- Choose a Category --</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Team Selector */}
      {selectedCategory && (
        <div className={cardStyle + " flex flex-wrap gap-4"}>
          {availableTeams.map((team) => (
            <div
              key={team}
              className={`${teamCardStyle} ${selectedTeam === team ? "ring-2 ring-green-400" : ""}`}
              onClick={() => setSelectedTeam(team)}
            >
              {team}
            </div>
          ))}
        </div>
      )}

      {/* Criteria Selector */}
      {selectedTeam && (
        <div className={cardStyle}>
          <label className="block mb-3 font-semibold text-lg">Select Criteria</label>
          <select
            className={selectStyle}
            value={selectedCriteria}
            onChange={(e) => setSelectedCriteria(e.target.value)}
          >
            {criteria.map((c: string) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Vote Buttons */}
      {selectedTeam && (
        <div className="flex justify-center gap-4 mt-6">
          {[1, 2, 3, 4, 5].map((pts) => (
            <button key={pts} className={buttonStyle} onClick={() => handleVote(pts)}>
              {pts} pts
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
