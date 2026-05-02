"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, DEFAULT_EVENT } from "@/lib/supabase";
import { Routine } from "@/types";

export function useRoutines(eventSlug = DEFAULT_EVENT, role?: "emcee" | "backstage" | "stage" | null) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevRoutines = useRef<Routine[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const offlineQueue = useRef<Array<{ id: string; changes: Record<string, unknown> }>>([]);

  // Track online/offline status and flush queue when back online
  useEffect(() => {
    async function flushQueue() {
      if (offlineQueue.current.length === 0) return;
      const q = [...offlineQueue.current];
      offlineQueue.current = [];
      for (const item of q) {
        await supabase.from("routines").update(item.changes).eq("id", item.id);
      }
    }
    function handleOnline() { setIsOnline(true); flushQueue(); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  function vibrateReady() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 80, 100]);
    }
  }

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await supabase.from("routines").select("*").eq("event_slug", eventSlug).order("sort_order", { ascending: true, nullsFirst: false });
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
            setRoutines(prev => [...prev, payload.new as Routine].sort((a,b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999)));
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
    // Optimistic update — update local state immediately regardless of network
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    prevRoutines.current = prevRoutines.current.map(r => r.id === id ? { ...r, ...patch } : r);
    if (!navigator.onLine) {
      offlineQueue.current.push({ id, changes: patch as Record<string, unknown> });
      return;
    }
    const { error } = await supabase.from("routines").update(patch).eq("id", id);
    if (error) {
      offlineQueue.current.push({ id, changes: patch as Record<string, unknown> });
      console.error("Update failed, queued:", error.message);
    }
  }, []);

  const checkIn         = useCallback((id: string) => update(id, { checked_in: true, ready: false, on_stage: false, completed: false }), [update]);
  const undoCheckIn       = useCallback((id: string) => update(id, { checked_in: false, ready: false, on_stage: false }), [update]);
  const markReady       = useCallback((id: string) => update(id, { ready: true, checked_in: true, completed: false }), [update]);
  const unMarkReady     = useCallback((id: string) => update(id, { ready: false }), [update]);
  const markNotReady    = unMarkReady;
  const toggleProp      = useCallback((id: string, val?: boolean) => { const r = routines.find(r => r.id === id); update(id, { has_prop: val !== undefined ? val : !r?.has_prop }); }, [update, routines]);
  const addRoutine      = useCallback(async (r: Partial<Routine>) => {
    await supabase.from("routines").insert({ event_slug: eventSlug, number: String(r.number ?? ""), studio: String(r.studio ?? ""), title: String(r.title ?? ""), division: String(r.division ?? ""), dancers: "", age_group: "", music_file: "", notes: "", has_prop: false, checked_in: false, ready: false, on_stage: false, completed: false });
  }, [eventSlug]);
  const setOnStage      = useCallback(async (id: string) => {
    // First clear any existing on_stage routine
    const { error: clearError } = await supabase.from("routines").update({ on_stage: false }).eq("event_slug", eventSlug).eq("on_stage", true);
    if (clearError) { console.error("Could not clear on stage:", clearError.message); return; }
    // Now set this one on stage — unique index will reject if race condition occurs
    const { error: stageError } = await supabase.from("routines").update({ on_stage: true, ready: true, checked_in: true, completed: false }).eq("id", id);
    if (stageError) {
      // Race condition — another routine just went on stage, refetch and ignore
      console.warn("Race condition on setOnStage, ignoring:", stageError.message);
      const { data } = await supabase.from("routines").select("*").eq("event_slug", eventSlug).order("sort_order", { ascending: true, nullsFirst: false });
      if (data) { setRoutines(data); prevRoutines.current = data; }
      return;
    }
    // Optimistic update local state
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, on_stage: true, ready: true, checked_in: true, completed: false } : { ...r, on_stage: false }));
    prevRoutines.current = prevRoutines.current.map(r => r.id === id ? { ...r, on_stage: true, ready: true, checked_in: true, completed: false } : { ...r, on_stage: false });
    // Stamp show start time if not already set
    const { data: ev } = await supabase.from("events").select("show_started_at").eq("slug", eventSlug).single();
    if (ev && !ev.show_started_at) {
      await supabase.from("events").update({ show_started_at: new Date().toISOString() }).eq("slug", eventSlug);
    }
  }, [update, eventSlug]);
  const removeFromStage = useCallback((id: string) => update(id, { on_stage: false, completed: false }), [update]);
  const markCompleted   = useCallback(async (id: string) => {
    await update(id, { on_stage: false, completed: true, ready: false });
    const { data: remaining } = await supabase.from("routines")
      .select("id").eq("event_slug", eventSlug).eq("completed", false).eq("scratched", false);
    if (remaining && remaining.length === 0) {
      await supabase.from("events").update({ show_ended_at: new Date().toISOString() }).eq("slug", eventSlug);
    }
  }, [update, eventSlug]);
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


  const reorderRoutine = useCallback(async (fromId: string, toId: string) => {
    const newRoutines = [...routines];
    const fromIdx = newRoutines.findIndex(r => r.id === fromId);
    const toIdx = newRoutines.findIndex(r => r.id === toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const [moved] = newRoutines.splice(fromIdx, 1);
    newRoutines.splice(toIdx, 0, moved);
    const reindexed = newRoutines.map((r, i) => ({ ...r, sort_order: i }));
    setRoutines(reindexed);
    prevRoutines.current = reindexed;
    await Promise.all(reindexed.map(r => supabase.from("routines").update({ sort_order: r.sort_order }).eq("id", r.id)));
  }, [routines]);

  const scratchRoutine  = (id: string) => update(id, { scratched: true, on_stage: false });
  const unScratch       = (id: string) => update(id, { scratched: false });
  return { routines, loading, error, isOnline, updateNote: (id: string, notes: string | null) => update(id, { notes }), checkIn, undoCheckIn, markReady, unMarkReady, markNotReady, reorderRoutine, scratchRoutine, unScratch, setOnStage, removeFromStage, markCompleted, toggleProp, addRoutine, clearAll, bulkInsert };
}
