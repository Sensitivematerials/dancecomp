"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase, DEFAULT_EVENT } from "@/lib/supabase";
import { Routine } from "@/types";

export function useRoutines(eventSlug = DEFAULT_EVENT) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("event_slug", eventSlug)
        .order("number", { ascending: true });

      if (error) { setError(error.message); }
      else       { setRoutines(data ?? []); }
      setLoading(false);
    }
    fetch();
  }, [eventSlug]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`routines:${eventSlug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "routines", filter: `event_slug=eq.${eventSlug}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRoutines(prev => [...prev, payload.new as Routine]
              .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
          }
          if (payload.eventType === "UPDATE") {
            setRoutines(prev => prev.map(r => r.id === payload.new.id ? payload.new as Routine : r));
          }
          if (payload.eventType === "DELETE") {
            setRoutines(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventSlug]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const update = useCallback(async (id: string, patch: Partial<Routine>) => {
    const { error } = await supabase.from("routines").update(patch).eq("id", id);
    if (error) console.error("Update failed:", error.message);
  }, []);

  const checkIn = useCallback((id: string) =>
    update(id, {
      checked_in: true, completed: false,
      check_in_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }), [update]);

  const undoCheckIn = useCallback((id: string) =>
    update(id, { checked_in: false, ready: false, on_stage: false }), [update]);

  const markReady = useCallback((id: string) =>
    update(id, { ready: true, checked_in: true, completed: false }), [update]);

  const markNotReady = useCallback((id: string) =>
    update(id, { ready: false }), [update]);

  const setOnStage = useCallback(async (id: string) => {
    // First clear any existing on_stage routine
    await supabase
      .from("routines")
      .update({ on_stage: false })
      .eq("event_slug", eventSlug)
      .eq("on_stage", true);
    // Then set the new one
    await update(id, { on_stage: true, ready: true, checked_in: true, completed: false });
  }, [eventSlug, update]);

  const markCompleted = useCallback((id: string) =>
    update(id, { on_stage: false, completed: true, ready: false }), [update]);

  const removeFromStage = useCallback((id: string) =>
    update(id, { on_stage: false }), [update]);

  const toggleProp = useCallback(async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (routine) await update(id, { has_prop: !routine.has_prop });
  }, [routines, update]);

  const addRoutine = useCallback(async (data: {
    number: string; studio: string; title: string; division: string;
    dancers?: string; age_group?: string; music_file?: string; notes?: string;
  }) => {
    const { error } = await supabase.from("routines").insert({
      event_slug: eventSlug,
      ...data,
      checked_in: false, ready: false, on_stage: false, completed: false,
      check_in_time: null, has_prop: false,
    });
    if (error) console.error("Insert failed:", error.message);
  }, [eventSlug]);

  const bulkInsert = useCallback(async (rows: typeof addRoutine extends (d: infer D) => any ? D[] : never[]) => {
    const { error } = await supabase.from("routines").insert(
      rows.map(r => ({
        event_slug: eventSlug, ...r,
        checked_in: false, ready: false, on_stage: false, completed: false,
        check_in_time: null, has_prop: false,
      }))
    );
    if (error) console.error("Bulk insert failed:", error.message);
  }, [eventSlug]);

  const clearAll = useCallback(async () => {
    const { error } = await supabase
      .from("routines")
      .delete()
      .eq("event_slug", eventSlug);
    if (error) console.error("Clear failed:", error.message);
  }, [eventSlug]);

  return {
    routines, loading, error,
    checkIn, undoCheckIn, markReady, markNotReady,
    setOnStage, markCompleted, removeFromStage,
    toggleProp, addRoutine, bulkInsert, clearAll,
  };
}
