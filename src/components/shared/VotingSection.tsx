"use client";

import { useMemo, useState } from "react";

interface VotingSectionProps {
  title: string;
  role: "jury" | "user";
  criteria?: string[];
}

export default function VotingSection({ title, role, criteria: criteriaProp }: VotingSectionProps) {
  // Local demo state; replace with real data fetch later
  const criteria = criteriaProp && criteriaProp.length > 0 ? criteriaProp : ["Creativity", "Impact", "Feasibility"];
  const categories = ["Business Idea", "Business Plan", "Changemaker"];
  const teamsByCategory: Record<string, string[]> = {
    "Business Idea": ["Team Alpha", "Team Spark", "Team Vision"],
    "Business Plan": ["Team Orion", "Team Nova"],
    Changemaker: ["Team Impact", "Team Hope"],
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedCriteria, setSelectedCriteria] = useState<string>(criteria[0] || "");
  const [votes, setVotes] = useState<Record<string, number>>({});

  const availableTeams = useMemo(
    () => (selectedCategory ? teamsByCategory[selectedCategory] || [] : []),
    [selectedCategory]
  );

  const handleVote = (points: number) => {
    if (!selectedTeam || !selectedCategory || !selectedCriteria) return;

    const key = `${selectedCategory}-${selectedTeam}-${selectedCriteria}`;
    setVotes((prev) => ({ ...prev, [key]: (prev[key] || 0) + points }));

    const verb = role === "jury" ? "gave" : "voted";
    alert(`You ${verb} ${points} pts to ${selectedTeam} (${selectedCriteria}, ${selectedCategory})`);
    setSelectedTeam("");
  };

  const cardStyle = "p-6 rounded-3xl shadow-lg transition-colors duration-300 bg-white text-gray-900 border border-gray-200";
  const selectStyle = "w-full p-3 rounded-xl border shadow-inner cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50";
  const teamCardStyle = "p-5 rounded-2xl shadow-md cursor-pointer transition-transform transform hover:scale-105 bg-gray-100 text-gray-900 hover:bg-blue-50";
  const buttonStyle = "px-5 py-2 rounded-2xl font-semibold shadow-md transition-all transform hover:scale-105 active:scale-95 text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600";

  return (
    <div className="p-10 space-y-8 max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-center mb-10 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        {title}
      </h2>

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
