"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "../../hooks/useDashboardStore";
import { UsersCard } from "./UsersCard";
import { TeamsCard } from "./TeamsCard";
import { CompetitionsCard } from "./CompetitionsCard";
import { JuryCard } from "./JuryCard";
import { CriteriaCard } from "./CriteriaCard";

export default function AdminTabs() {
  const { darkMode, teams, votes, resetVotes } = useDashboardStore();

  // Local state for admin data
  const [users, setUsers] = useState(["Alice", "Bob"]);
  const [competitions, setCompetitions] = useState(["Competition 1"]);
  const [jury, setJury] = useState(["Jury 1"]);
  const [criteria, setCriteria] = useState(["Creativity"]);

  // CRUD actions
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

  // Export & Reset
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

  const tabs = ["Users", "Teams", "Competitions", "Jury", "Criteria"];
  const [activeTab, setActiveTab] = useState("Users");

  return (
    <div className={`p-10 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <h2 className="text-4xl font-extrabold text-center mb-10 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Admin Panel
      </h2>

      <div className="flex justify-center mb-8 space-x-3 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === tab
                ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                : darkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "Users" && (
              <UsersCard
                users={users}
                addUser={addUser}
                deleteUser={deleteUser}
                darkMode={darkMode}
                cardStyle={cardStyle}
                buttonStyle={buttonStyle}
              />
            )}
            {activeTab === "Teams" && (
              <TeamsCard teams={teams} addTeam={addTeam} darkMode={darkMode} cardStyle={cardStyle} buttonStyle={buttonStyle} />
            )}
            {activeTab === "Competitions" && (
              <CompetitionsCard
                competitions={competitions}
                addCompetition={addCompetition}
                darkMode={darkMode}
                cardStyle={cardStyle}
                buttonStyle={buttonStyle}
              />
            )}
            {activeTab === "Jury" && (
              <JuryCard jury={jury} addJury={addJury} darkMode={darkMode} cardStyle={cardStyle} buttonStyle={buttonStyle} />
            )}
            {activeTab === "Criteria" && (
              <CriteriaCard
                criteria={criteria}
                addCriteria={addCriteria}
                darkMode={darkMode}
                cardStyle={cardStyle}
                buttonStyle={buttonStyle}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
        <button className={buttonStyle} onClick={exportStats}>
          Export Stats
        </button>
        <button className={buttonStyle} onClick={handleResetVotes}>
          Reset Votes
        </button>
      </div>
    </div>
  );
}
