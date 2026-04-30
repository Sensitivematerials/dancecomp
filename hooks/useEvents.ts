"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Event {
  id: string;
  slug: string;
  name: string;
  date: string;
  location: string;
  created_at: string;
}

export function useEvents() {
  const [events,       setEvents]       = useState<Event[]>([]);
  const [activeEvent,  setActiveEvent]  = useState<Event | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      if (data) {
        setEvents(data);
        // Auto-select most recent event
        const saved = localStorage.getItem("activeEventSlug");
        const found = data.find(e => e.slug === saved) ?? data[0] ?? null;
        setActiveEvent(found);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const createEvent = useCallback(async (name: string, date: string, location: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const { data, error } = await supabase
      .from("events")
      .insert({ slug, name, date, location })
      .select()
      .single();
    if (data) {
      setEvents(prev => [data, ...prev]);
      switchEvent(data);
    }
    return error;
  }, []);

  const switchEvent = useCallback((event: Event) => {
    setActiveEvent(event);
    localStorage.setItem("activeEventSlug", event.slug);
  }, []);

  return { events, activeEvent, loading, createEvent, switchEvent };
}
