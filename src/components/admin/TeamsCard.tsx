"use client";

import React from "react";

interface Props {
  teams: string[];
  addTeam: () => void;
  cardStyle: string;
  buttonStyle: string;
}

function TeamsCard({ teams, addTeam, cardStyle, buttonStyle }: Props) {
  return (
    <div className={cardStyle}>
      <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Teams</h3>
      <button className={buttonStyle} onClick={addTeam}>
        Add Team
      </button>
      <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
        {teams.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export { TeamsCard };
