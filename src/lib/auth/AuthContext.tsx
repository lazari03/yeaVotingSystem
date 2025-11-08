"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User as FbUser, getAuth } from "firebase/auth";
import { db } from "@/firebaseConfig/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Role } from "@/utils/Roles";

export type AppRole = Role | null;

export interface AppUser {
  uid: string;
  email: string | null;
  name?: string | null;
  role: AppRole;
}

interface AuthState {
  loading: boolean;
  user: AppUser | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function mapDocToUser(uid: string, data: any): AppUser {
  // Support both your admin API schema and a simplified schema
  const first = data?.Name || data?.firstName || null;
  const last = data?.["Last Name"] || data?.lastName || null;
  const name = (data?.name as string) || [first, last].filter(Boolean).join(" ") || null;
  const role = (data?.Role || data?.role || null) as AppRole;
  const email = (data?.Email || data?.email || null) as string | null;
  return { uid, email, name, role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser: FbUser | null) => {
      try {
        if (!fbUser) {
          setUser(null);
          return;
        }
        // Fetch role from Firestore
        const ref = doc(db, "users", fbUser.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setUser(mapDocToUser(fbUser.uid, snapshot.data()));
        } else {
          // If doc missing, still set minimal user
          setUser({ uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName, role: null });
        }
      } catch (e) {
        console.error("AuthProvider role fetch failed", e);
        setUser({ uid: fbUser!.uid, email: fbUser!.email, name: fbUser!.displayName, role: null });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthState>(() => ({
    loading,
    user,
    signOut: async () => {
      const auth = getAuth();
      await fbSignOut(auth);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
