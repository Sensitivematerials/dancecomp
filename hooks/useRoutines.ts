"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, DEFAULT_EVENT } from "@/lib/supabase";
import { Routine } from "@/types";

export function useRoutines(eventSlug = DEFAULT_EVENT, role?: "emcee" | "backstage" | null) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevRoutines = useRef<Routine[]>([]);

  function vibrateReady() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 80, 100]);
    }
  }

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await supabase.from("routines").select("*").eq("event_slug", eventSlug).order("number", { ascending: true });
      if (error) setError(error.message);
      else { setRoutines(data ?? []); prevRoutines.current = data ?? []; }
      setLoading(false);
    }
    fetch();
  }, [eventSlug]);

  useEffect(() => {
    const channel = supabase.channel(`routines:${eventSlug}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "routines", filter: `event_slug=eq.${eventSlug}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRoutines(prev => [...prev, payload.new as Routine].sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
            prevRoutines.current = [...prevRoutines.current, payload.new as Routine];
          }
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Routine;
            const prev = prevRoutines.current.find(r => r.id === updated.id);
            if (role === "emcee" && updated.ready && prev && !prev.ready) vibrateReady();
            setRoutines(p => p.map(r => r.id === updated.id ? updated : r));
            prevRoutines.current = prevRoutines.current.map(r => r.id === updated.id ? updated : r);
          }
          if (payload.eventType === "DELETE") {
            setRoutines(prev => prev.filter(r => r.id !== payload.old.id));
            prevRoutines.current = prevRoutines.current.filter(r => r.id !== payload.old.id);
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventSlug, role]);

  const update = useCallback(async (id: string, patch: Partial<Routine>) => {
    const { error } = await supabase.from("routines").update(patch).eq("id", id);
    if (error) console.error("Update failed:", error.message);
  }, []);

  const checkIn         = useCallback((id: string) => update(id, { checked_in: true, ready: false, on_stage: false }), [update]);
  const undoCheckIn       = useCallback((id: string) => update(id, { checked_in: false, ready: false, on_stage: false }), [update]);
  const markReady       = useCallback((id: string) => update(id, { ready: true, checked_in: true, completed: false }), [update]);
  const unMarkReady     = useCallback((id: string) => update(id, { ready: false }), [update]);
  const setOnStage      = useCallback(async (id: string) => {
    await supabase.from("routines").update({ on_stage: false }).eq("event_slug", eventSlug).eq("on_stage", true);
    await update(id, { on_stage: true, ready: true, checked_in: true, completed: false });
  }, [update, eventSlug]);
  const removeFromStage = useCallback((id: string) => update(id, { on_stage: false, completed: false }), [update]);
  const markCompleted   = useCallback((id: string) => update(id, { on_stage: false, completed: true, ready: false }), [update]);
  const clearAll        = useCallback(async () => {
    await supabase.from("routines").delete().eq("event_slug", eventSlug);
    setRoutines([]); prevRoutines.current = [];
  }, [eventSlug]);
  const bulkInsert = useCallback(async (rows: Partial<Routine>[]) => {
    const toInsert = rows.map((r, i) => ({
      event_slug: eventSlug, number: String(r.number ?? i+1), studio: String(r.studio ?? ""),
      title: String(r.title ?? ""), division: String(r.division ?? ""), dancers: String(r.dancers ?? ""),
      age_group: String(r.age_group ?? ""), music_file: String(r.music_file ?? ""), notes: String(r.notes ?? ""),
      has_prop: false, checked_in: false, ready: false, on_stage: false, completed: false,
    }));
    const CHUNK = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      await supabase.from("routines").insert(toInsert.slice(i, i + CHUNK));
    }
  }, [eventSlug]);

  return { routines, loading, error, checkIn, undoCheckIn, markReady, unMarkReady, setOnStage, removeFromStage, markCompleted, clearAll, bulkInsert };
}
