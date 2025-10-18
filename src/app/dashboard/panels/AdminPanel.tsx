"use client";

import { useState } from "react";
import { useDashboardStore } from "../hooks/useDashboardStore";

export default function AdminPanel() {
  const { darkMode, teams, votes, resetVotes } = useDashboardStore();

  const [users, setUsers] = useState(["Alice", "Bob"]);
  const [competitions, setCompetitions] = useState(["Competition 1"]);
  const [jury, setJury] = useState(["Jury 1"]);
  const [criteria, setCriteria] = useState(["Creativity"]);

  const addUser = () => {
    const name = prompt("Enter new user name");
    if (name) setUsers([...users, name]);
  };
  const deleteUser = (name: string) => {
    if (confirm(`Delete user ${name}?`)) setUsers(users.filter((u) => u !== name));
  };

  const addCompetition = () => {
    const comp = prompt("Enter competition name");
    if (comp) setCompetitions([...competitions, comp]);
  };

  const addTeam = () => {
    const team = prompt("Enter new team name");
    if (team) teams.push(team);
  };

  const addJury = () => {
    const name = prompt("Enter jury member name");
    if (name) setJury([...jury, name]);
  };

  const addCriteria = () => {
    const crit = prompt("Enter new criteria");
    if (crit) setCriteria([...criteria, crit]);
  };

  const assignCompetition = () => {
    const user = prompt("Enter user to assign");
    const competition = prompt("Enter competition");
    if (user && competition) alert(`${competition} assigned to ${user}`);
  };

  const exportStats = () => {
    const data = JSON.stringify(votes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "votes.json";
    a.click();
  };

  const handleResetVotes = () => {
    if (confirm("Are you sure you want to reset all votes?")) resetVotes();
  };

  const cardStyle = `p-6 rounded-3xl shadow-md transition-all duration-300 transform hover:scale-105 ${
    darkMode
      ? "bg-gray-800/80 text-white border border-gray-700"
      : "bg-white text-gray-900 border border-gray-200"
  }`;

  const buttonStyle =
    "px-4 py-2 rounded-2xl font-semibold shadow-md transition-all transform hover:scale-105 active:scale-95 text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 w-full mb-4";

  return (
    <div className={`p-10 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <h2 className="text-4xl font-extrabold text-center mb-10 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Admin Panel
      </h2>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* USERS */}
        <div className={cardStyle}>
          <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Users</h3>
          <button className={buttonStyle} onClick={addUser}>Add User</button>
          <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
            {users.map((u) => (
              <li
                key={u}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {u}
                <button className="text-red-400 hover:underline" onClick={() => deleteUser(u)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* COMPETITIONS */}
        <div className={cardStyle}>
          <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Competitions</h3>
          <button className={buttonStyle} onClick={addCompetition}>Add Competition</button>
          <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
            {competitions.map(c => <li key={c}>{c}</li>)}
          </ul>
        </div>

        {/* TEAMS */}
        <div className={cardStyle}>
          <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Teams</h3>
          <button className={buttonStyle} onClick={addTeam}>Add Team</button>
          <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
            {teams.map(t => <li key={t}>{t}</li>)}
          </ul>
        </div>

        {/* JURY */}
        <div className={cardStyle}>
          <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Jury Members</h3>
          <button className={buttonStyle} onClick={addJury}>Add Jury</button>
          <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
            {jury.map(j => <li key={j}>{j}</li>)}
          </ul>
        </div>

        {/* CRITERIA */}
        <div className={cardStyle}>
          <h3 className="font-semibold mb-4 text-xl border-b border-gray-300 pb-1 dark:border-gray-600">Scoring Criteria</h3>
          <button className={buttonStyle} onClick={addCriteria}>Add Criteria</button>
          <ul className="list-disc pl-5 mt-4 space-y-1 max-h-40 overflow-y-auto">
            {criteria.map(c => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>

      {/* EXPORT / RESET */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button className={buttonStyle} onClick={exportStats}>Export Stats</button>
        <button className={buttonStyle} onClick={handleResetVotes}>Reset Votes</button>
      </div>
    </div>
  );
}
