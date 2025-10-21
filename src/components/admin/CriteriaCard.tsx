"use client";

import React from "react";

interface Props {
  criteria: string[];
  addCriteria: () => void;
  darkMode: boolean;
  cardStyle: string;
  buttonStyle: string;
}

function CriteriaCard({ criteria, addCriteria, darkMode, cardStyle, buttonStyle }: Props) {
  return (
    <div className={cardStyle}>
      <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Criteria</h3>
      <button className={buttonStyle} onClick={addCriteria}>
        Add Criteria
      </button>
      <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
        {criteria.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export { CriteriaCard };
