"use client";
import { useMemo, useState } from "react";
import { getStatus, RoutineStatus } from "@/types";
import { useRoutines } from "@/hooks/useRoutines";
import SectionLabel from "./ui/SectionLabel";
import EmptyState   from "./ui/EmptyState";
import StatusBadge  from "./ui/StatusBadge";
import Button        from "./ui/Button";
type Props = ReturnType<typeof useRoutines>;
const FILTERS: { key: RoutineStatus | "all"; label: string }[] = [
  { key: "all", label: "All" }, { key: "stage", label: "On Stage" },
  { key: "ready", label: "Ready" }, { key: "checked", label: "Checked In" },
  { key: "not-here", label: "Not Here" }, { key: "completed", label: "Done" },
];
export default function BackstageView({ routines, loading, checkIn, undoCheckIn, markReady, markNotReady, setOnStage, markCompleted, removeFromStage, toggleProp, addRoutine, scratchRoutine }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RoutineStatus | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newR, setNewR] = useState({ number: "", studio: "", title: "", division: "" });
  const counts = useMemo(() => {
    const c: Record<string,number> = { all: routines.length };
    routines.forEach(r => { const s = getStatus(r); c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [routines]);
  const filtered = useMemo(() => {
    let list = routines.filter(r => !r.scratched);
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.number.toLowerCase().includes(q) || r.studio.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.division.toLowerCase().includes(q)); }
    if (filter !== "all") list = list.filter(r => getStatus(r) === filter);
    return list;
  }, [routines, search, filter]);
  async function handleAdd() {
    if (!newR.number || !newR.studio || !newR.title || !newR.division) return;
    await addRoutine(newR); setNewR({ number: "", studio: "", title: "", division: "" }); setShowAdd(false);
  }
  return (
    <div>
      <div className="flex gap-2.5 mb-3.5">
        <input className="flex-1 h-[52px] rounded-[8px] border px-4 text-[15px] outline-none bg-[var(--card)] placeholder-gray-600 focus:border-[var(--border2)]" style={{ borderColor:"var(--border)" }} placeholder="Search by number, studio, title…" value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="pink" size="sm" onClick={() => setShowAdd(v => !v)}>{showAdd ? "✕ Cancel" : "+ Add"}</Button>
      </div>
      {showAdd && (
        <div className="rounded-[14px] border p-4 mb-4" style={{ background:"var(--card2)", borderColor:"var(--border2)" }}>
          <div className="text-[15px] font-semibold mb-3.5">Add Routine</div>
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            {[["number","Number"],["division","Division"],["studio","Studio"],["title","Title"]].map(([key,ph]) => (
              <input key={key} placeholder={ph} className="h-[52px] rounded-[8px] border px-3.5 text-[14px] outline-none bg-[var(--surface)] placeholder-gray-600" style={{ borderColor:"var(--border)" }} value={(newR as any)[key]} onChange={e => setNewR(v => ({ ...v, [key]: e.target.value }))} />
            ))}
          </div>
          <Button variant="green" fullWidth onClick={handleAdd}>Add Routine</Button>
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {FILTERS.map(({ key, label }) => (
          <button key={key} className={`h-9 px-3.5 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap ${filter===key?"border-pink-400/30 bg-pink-400/10 text-pink-400":"border-[var(--border)] text-gray-500 hover:text-gray-300"}`} onClick={() => setFilter(key as any)}>
            {label}{counts[key] > 0 ? ` · ${counts[key]}` : ""}
          </button>
        ))}
      </div>
      {loading && <div className="font-mono text-[12px] text-gray-600 text-center py-8">Loading…</div>}
      {!loading && filtered.length === 0 && <EmptyState>No routines match</EmptyState>}
      {filtered.map(r => {
        const s = getStatus(r);
        return (
          <div key={r.id} className={`rounded-[14px] border mb-2.5 overflow-hidden ${s==="completed"?"opacity-40":""}`} style={{ background: s==="stage"?"rgba(255,208,96,0.10)":"var(--card)", borderColor:"var(--border)" }}>
            <div className="flex items-center gap-3.5 px-4 pt-4 pb-3">
              <div className={`font-display text-[40px] leading-none min-w-[56px] ${{ stage:"text-yellow-300", ready:"text-emerald-400", checked:"text-amber-400", "not-here":"text-gray-600", completed:"text-gray-600" }[s]}`}>{r.number}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-semibold truncate">{r.title}</div>
                <div className="text-[13px] text-gray-400 mt-0.5 truncate">{r.studio} · {r.division}</div>
              </div>
              {r.has_prop && <span className="font-mono text-[9px] px-2.5 py-1 rounded-full border text-orange-400" style={{ background:"rgba(255,140,0,0.12)", borderColor:"rgba(255,140,0,0.35)" }}>🎬 Prop</span>}
              <StatusBadge status={s} />
            </div>
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {!r.checked_in && !r.completed && <Button variant="amber" size="sm" onClick={() => checkIn(r.id)}>Check In</Button>}
              {r.checked_in && !r.completed && <Button variant="ghost" size="sm" onClick={() => undoCheckIn(r.id)}>Undo</Button>}
              {r.checked_in && !r.ready && !r.completed && <Button variant="green" size="sm" onClick={() => markReady(r.id)}>Mark Ready</Button>}
              {r.ready && !r.on_stage && !r.completed && <Button variant="ghost" size="sm" onClick={() => markNotReady(r.id)}>Not Ready</Button>}
              {!r.on_stage && !r.completed && r.checked_in && <Button variant="stage" size="sm" onClick={() => setOnStage(r.id)}>🎭 On Stage</Button>}
              {r.on_stage && <><Button variant="green" size="sm" onClick={() => markCompleted(r.id)}>✔ Done</Button><Button variant="red" size="sm" onClick={() => removeFromStage(r.id)}>✕ Remove</Button></>}
              {r.completed && <Button variant="ghost" size="sm" onClick={() => checkIn(r.id)}>Re-Check In</Button>}
              {!r.on_stage && !r.completed && <Button variant="red" size="sm" onClick={() => scratchRoutine(r.id)}>✕ Scratch</Button>}
              <Button variant={r.has_prop ? "prop-on" : "prop-off"} size="sm" onClick={() => toggleProp(r.id)}>{r.has_prop ? "🎬 Has Prop" : "🎬 No Prop"}</Button>
            </div>
            {r.check_in_time && <div className="font-mono text-[10px] text-gray-600 px-4 pb-3">Checked in {r.check_in_time}</div>}
          </div>
        );
      })}
    </div>
  );
}
