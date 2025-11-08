"use client";

import React from "react";

interface Props {
  competitions: string[];
  addCompetition: () => void;
  cardStyle: string;
  buttonStyle: string;
}

function CompetitionsCard({ competitions, addCompetition, cardStyle, buttonStyle }: Props) {
  return (
    <div className={cardStyle}>
      <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Competitions</h3>
      <button className={buttonStyle} onClick={addCompetition}>
        Add Competition
      </button>
      <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
        {competitions.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export { CompetitionsCard };
