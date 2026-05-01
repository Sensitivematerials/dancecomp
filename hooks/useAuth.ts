"use client";
import { useState, useEffect } from "react";

export type UserRole = "emcee" | "backstage" | null;

export interface SessionUser {
  name: string;
  role: "emcee" | "backstage" | "stage";
}

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("dancecomp_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setLoading(false);
  }, []);

  function signIn(name: string, role: "emcee" | "backstage" | "stage") {
    const u = { name, role };
    sessionStorage.setItem("dancecomp_user", JSON.stringify(u));
    setUser(u);
  }

  function signOut() {
    sessionStorage.removeItem("dancecomp_user");
    setUser(null);
  }

  return { user, role: user?.role ?? null, loading, signIn, signOut };
}
