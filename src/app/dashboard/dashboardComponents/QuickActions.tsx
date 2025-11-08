import React from "react";
import ActionButton from "./ActionButton";

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionButton
          title="Create Competition"
          description="Start a new voting competition"
          onClick={() => console.log("Create Competition")}
        />
        
        <ActionButton
          title="Manage Teams"
          description="Add or edit teams"
          onClick={() => console.log("Manage Teams")}
        />
        
        <ActionButton
          title="View Results"
          description="Check voting results"
          onClick={() => console.log("View Results")}
        />
      </div>
    </div>
  );
};

export default QuickActions;
