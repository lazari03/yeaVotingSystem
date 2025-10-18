"use client";

import React from "react";

interface Props {
  exportStats: () => void;
  handleResetVotes: () => void;
  darkMode: boolean;
  buttonStyle: string;
}

export default function ActionsCard({ exportStats, handleResetVotes, darkMode, buttonStyle }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
      <button className={buttonStyle} onClick={exportStats}>Export Stats</button>
      <button className={buttonStyle} onClick={handleResetVotes}>Reset Votes</button>
    </div>
  );
}
