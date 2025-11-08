import React from "react";

interface ActionButtonProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, description, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
    >
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {title}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </div>
    </button>
  );
};

export default ActionButton;
