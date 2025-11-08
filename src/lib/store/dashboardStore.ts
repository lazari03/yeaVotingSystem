import { create } from 'zustand';
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import app from "../../firebaseConfig/firebase";

interface DashboardStats {
  totalVotes: number;
  activeCompetitions: number;
  teams: number;
  juryMembers: number;
}

interface DashboardState {
  user: User | null;
  loading: boolean;
  stats: DashboardStats;
  
  // Actions
  initializeAuth: (onUnauthenticated: () => void) => () => void;
  logout: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  user: null,
  loading: true,
  stats: {
    totalVotes: 0,
    activeCompetitions: 0,
    teams: 0,
    juryMembers: 0,
  },

  initializeAuth: (onUnauthenticated) => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        set({ user: currentUser, loading: false });
        get().fetchStats();
      } else {
        set({ loading: false });
        onUnauthenticated();
      }
    });

    return unsubscribe;
  },

  logout: async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      document.cookie = "session=; max-age=0; path=/;";
      set({ user: null });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      // TODO: Replace with actual API calls to fetch stats
      // For now, using placeholder data
      const stats: DashboardStats = {
        totalVotes: 0,
        activeCompetitions: 0,
        teams: 0,
        juryMembers: 0,
      };
      
      set({ stats });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  },
}));
