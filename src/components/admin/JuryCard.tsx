"use client";

import React from "react";

interface Props {
  jury: string[];
  addJury: () => void;
  cardStyle: string;
  buttonStyle: string;
}

function JuryCard({ jury, addJury, cardStyle, buttonStyle }: Props) {
  return (
    <div className={cardStyle}>
      <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Jury</h3>
      <button className={buttonStyle} onClick={addJury}>
        Add Jury Member
      </button>
      <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
        {jury.map((j) => (
          <li key={j}>{j}</li>
        ))}
      </ul>
    </div>
  );
}

export { JuryCard };
