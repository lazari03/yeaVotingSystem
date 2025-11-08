import React from "react";

interface WelcomeCardProps {
  userName: string | null;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Welcome back, {userName}!
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        You are successfully logged in to the YEA Voting System.
      </p>
    </div>
  );
};

export default WelcomeCard;
