"use client";

import React from "react";

interface Props {
  users: string[];
  addUser: () => void;
  deleteUser: (name: string) => void;
  darkMode: boolean;
  cardStyle: string;
  buttonStyle: string;
}

function UsersCard({ users, addUser, deleteUser, darkMode, cardStyle, buttonStyle }: Props) {
  return (
    <div className={cardStyle}>
      <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Users</h3>
      <button className={buttonStyle} onClick={addUser}>
        Add User
      </button>
      <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
        {users.map((u) => (
          <li key={u} className="flex justify-between items-center p-2 rounded-lg">
            {u}
            <button className="text-red-400 hover:underline" onClick={() => deleteUser(u)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { UsersCard };
