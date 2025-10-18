"use client";
import { create } from "zustand";

export type Role = "admin" | "jury" | "user";

interface DashboardStore {
  role: Role;
  setRole: (role: Role) => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  // Teams & votes
  teams: string[];
  setTeams: (teams: string[]) => void;

  votes: Record<string, number>;
  setVotes: (votes: Record<string, number>) => void;
  resetVotes: () => void;

  // Jury members
  jury: string[];
  setJury: (jury: string[]) => void;

  // Criteria
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  role: "admin",
  setRole: (role) => set({ role }),

  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  teams: ["Team 1", "Team 2", "Team 3"],
  setTeams: (teams) => set({ teams }),

  votes: { "Team 1": 0, "Team 2": 0, "Team 3": 0 },
  setVotes: (votes) => set({ votes }),
  resetVotes: () => {
    const currentTeams = get().teams;
    const reset = currentTeams.reduce((acc, t) => ({ ...acc, [t]: 0 }), {});
    set({ votes: reset });
  },

  jury: ["Jury 1"],
  setJury: (jury) => set({ jury }),

  criteria: ["Creativity"],
  setCriteria: (criteria) => set({ criteria }),
}));
