"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
export interface Event { id: string; slug: string; name: string; date: string; location: string; created_at: string; }
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
      if (data) setEvents(data);
      setLoading(false);
    }
    fetch();
  }, []);
  useEffect(() => {
    const channel = supabase.channel("events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (payload) => { setEvents(prev => [payload.new as Event, ...prev]); })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "events" }, (payload) => { setEvents(prev => prev.filter(e => e.id !== (payload.old as any).id)); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  const createEvent = useCallback(async (name: string, date: string, location: string): Promise<Event | null> => {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const { data, error } = await supabase.from("events").insert({ slug, name, date, location }).select().single();
    if (error) { console.error("Create event failed:", error.message); return null; }
    return data as Event;
  }, []);
  return { events, loading, createEvent };
}
