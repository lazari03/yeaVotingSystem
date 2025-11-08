import React from "react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
