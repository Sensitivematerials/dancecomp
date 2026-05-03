"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type BreakType = "break" | "lunch" | "dinner";

export interface Break {
  id: string;
  event_slug: string;
  type: BreakType;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
}

export function useBreak(eventSlug: string) {
  const [activeBreak, setActiveBreak] = useState<Break | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("breaks")
        .select("*")
        .eq("event_slug", eventSlug)
        .is("ended_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setActiveBreak(data ?? null);
      setLoading(false);
    }
    fetch();
  }, [eventSlug]);

  useEffect(() => {
    const channel = supabase.channel(`breaks:${eventSlug}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "breaks", filter: `event_slug=eq.${eventSlug}` },
        async () => {
          const { data } = await supabase
            .from("breaks")
            .select("*")
            .eq("event_slug", eventSlug)
            .is("ended_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          setActiveBreak(data ?? null);
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventSlug]);

  const startBreak = useCallback(async (type: BreakType, duration_minutes: number) => {
    // End any existing break first
    await supabase.from("breaks").update({ ended_at: new Date().toISOString() })
      .eq("event_slug", eventSlug).is("ended_at", null);
    const { data } = await supabase.from("breaks").insert({
      event_slug: eventSlug, type, duration_minutes, started_at: new Date().toISOString()
    }).select().single();
    setActiveBreak(data ?? null);
  }, [eventSlug]);

  const endBreak = useCallback(async () => {
    if (!activeBreak) return;
    await supabase.from("breaks").update({ ended_at: new Date().toISOString() }).eq("id", activeBreak.id);
    setActiveBreak(null);
  }, [activeBreak, eventSlug]);

  return { activeBreak, loading, startBreak, endBreak };
}
