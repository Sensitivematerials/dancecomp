"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "emcee" | "backstage" | null;

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null);
  const [role,    setRole]    = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setRole((session?.user?.user_metadata?.role as UserRole) ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setRole((session?.user?.user_metadata?.role as UserRole) ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }

  async function signUp(email: string, password: string, role: "emcee" | "backstage") {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { role } },
    });
    return error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { user, role, loading, signIn, signUp, signOut };
}
