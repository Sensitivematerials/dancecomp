"use client";
import { useMemo, useState } from "react";
import { getStatus, RoutineStatus } from "@/types";
import { useRoutines } from "@/hooks/useRoutines";
import EmptyState   from "./ui/EmptyState";
import StatusBadge  from "./ui/StatusBadge";
import Button        from "./ui/Button";
type Props = ReturnType<typeof useRoutines>;
type FilterKey = RoutineStatus | "all" | "scratched";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "stage", label: "On Stage" },
  { key: "ready", label: "Ready" },
  { key: "checked", label: "Checked In" },
  { key: "not-here", label: "Not Here" },
  { key: "completed", label: "Done" },
  { key: "scratched", label: "✕ Scratched" },
];
export default function BackstageView({ routines, loading, checkIn, undoCheckIn, markReady, markNotReady, setOnStage, markCompleted, removeFromStage, toggleProp, addRoutine, addBreakToQueue, scratchRoutine, unScratch, reorderRoutine, updateNote }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [insertBreakAfter, setInsertBreakAfter] = useState<string | null>(null);
  const [breakType, setBreakType] = useState<string>("break");
  const [breakDuration, setBreakDuration] = useState(15);
  const [noteText, setNoteText] = useState("");
  const [newR, setNewR] = useState({ number: "", studio: "", title: "", division: "" });
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: routines.length };
    routines.forEach(r => {
      if (r.scratched) { c["scratched"] = (c["scratched"] ?? 0) + 1; }
      const s = getStatus(r); c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [routines]);
  const filtered = useMemo(() => {
    let list = filter === "scratched"
      ? routines.filter(r => r.scratched)
      : routines;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.number.toLowerCase().includes(q) || r.studio.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.division.toLowerCase().includes(q));
    }
    if (filter !== "all" && filter !== "scratched") list = list.filter(r => getStatus(r) === filter);
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
          <button key={key}
            className={`h-9 px-3.5 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap
              ${filter===key
                ? key==="scratched" ? "border-red-400/30 bg-red-400/10 text-red-400" : "border-pink-400/30 bg-pink-400/10 text-pink-400"
                : "border-[var(--border)] text-gray-500 hover:text-gray-300"}`}
            onClick={() => setFilter(key)}>
            {label}{(counts[key] ?? 0) > 0 ? ` · ${counts[key]}` : ""}
          </button>
        ))}
      </div>
      {loading && <div className="font-mono text-[12px] text-gray-600 text-center py-8">Loading…</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-10 text-gray-600 font-mono text-[13px]">
          {filter === "scratched" ? "No scratched routines" : "No routines match"}
        </div>
      )}
      {filtered.map(r => {
        const s = getStatus(r);
        return (
          <div key={r.id}
            className={`rounded-[14px] border mb-2.5 overflow-hidden transition-all ${s==="completed"||r.scratched?"opacity-50":""}`}
            style={{ background: r.scratched ? "rgba(255,82,88,0.05)" : s==="stage" ? "rgba(255,208,96,0.10)" : "var(--card)", borderColor: r.scratched ? "rgba(255,82,88,0.25)" : "var(--border)" }}>
            <div className="flex items-center gap-3.5 px-4 pt-4 pb-3">
              <button onClick={() => setPickingId(pickingId === r.id ? null : r.id)} className="flex flex-col gap-[3px] mr-1 px-1 py-2 opacity-30 hover:opacity-80 transition-opacity flex-shrink-0" title="Move after...">
                {[0,1,2,3,4,5].map(i => <div key={i} className="w-[14px] h-[2px] rounded-full bg-gray-400" />)}
              </button>
              <div className={`font-display text-[40px] leading-none min-w-[56px] ${r.scratched ? "text-red-400 line-through" : { stage:"text-yellow-300", ready:"text-emerald-400", checked:"text-amber-400", "not-here":"text-gray-600", completed:"text-gray-600" }[s]}`}>{r.number}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-[16px] font-semibold truncate ${r.scratched ? "line-through text-gray-500" : ""}`}>{r.title}</div>
                <div className="text-[13px] text-gray-400 mt-0.5 truncate">{r.studio} · {r.division}</div>
                {r.scratched && <div className="font-mono text-[10px] text-red-400 mt-1">SCRATCHED</div>}
              </div>
              {r.has_prop && !r.scratched && <span className="font-mono text-[9px] px-2.5 py-1 rounded-full border text-orange-400" style={{ background:"rgba(255,140,0,0.12)", borderColor:"rgba(255,140,0,0.35)" }}>🎬 Prop</span>}
              {!r.scratched && <StatusBadge status={s} />}
            </div>
            {/* Notes section */}
            {r.notes && editingNoteId !== r.id && (
              <div className="mx-4 mb-2 flex items-start gap-2">
                <span className="text-[13px] flex-shrink-0">📝</span>
                <span className="text-[12px] text-yellow-300/80 flex-1">{r.notes}</span>
                <button onClick={() => { setEditingNoteId(r.id); setNoteText(r.notes ?? ""); }} className="text-[10px] text-gray-500 hover:text-white flex-shrink-0">edit</button>
              </div>
            )}
            {editingNoteId === r.id && (
              <div className="mx-4 mb-2 flex gap-2">
                <input
                  autoFocus
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note for the Emcee..."
                  className="flex-1 h-[36px] rounded-[8px] border px-3 text-[13px] outline-none placeholder-gray-600"
                  style={{ background: "var(--surface)", borderColor: "rgba(253,224,71,0.3)", color: "var(--text)" }}
                  onKeyDown={async e => {
                    if (e.key === "Enter") {
                      await updateNote(r.id, noteText.trim() || null);
                      setEditingNoteId(null);
                    }
                    if (e.key === "Escape") setEditingNoteId(null);
                  }}
                />
                <button onClick={async () => { await updateNote(r.id, noteText.trim() || null); setEditingNoteId(null); }} className="px-3 h-[36px] rounded-[8px] text-[12px] font-bold text-black" style={{ background: "#fde047" }}>Save</button>
                <button onClick={() => setEditingNoteId(null)} className="px-3 h-[36px] rounded-[8px] text-[12px] text-gray-500 border" style={{ borderColor: "var(--border2)" }}>✕</button>
              </div>
            )}
            {/* Break insert panel */}
            {insertBreakAfter === r.id && (
              <div className="mx-4 mb-3 rounded-[10px] border overflow-hidden" style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.06)" }}>
                <div className="px-3 py-2 font-mono text-[10px] text-amber-400 tracking-widest uppercase border-b" style={{ borderColor: "rgba(245,158,11,0.2)" }}>Insert Break After #{r.number}</div>
                <div className="p-3">
                  <div className="flex gap-2 mb-3">
                    {[["break","☕","Break"],["lunch","🍽","Lunch"],["dinner","🍷","Dinner"]].map(([t,e,l]) => (
                      <button key={t} onClick={() => setBreakType(t)}
                        className="flex-1 h-[38px] rounded-[8px] border text-[12px] font-semibold transition-all"
                        style={{ background: breakType===t ? "rgba(245,158,11,0.15)" : "transparent", borderColor: breakType===t ? "rgba(245,158,11,0.5)" : "var(--border)", color: breakType===t ? "#f59e0b" : "var(--muted)" }}>
                        {e} {l}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {[10,15,20,30,45,60].map(d => (
                      <button key={d} onClick={() => setBreakDuration(d)}
                        className="h-[30px] px-2.5 rounded-[6px] border font-mono text-[11px] transition-all"
                        style={{ background: breakDuration===d ? "rgba(245,158,11,0.15)" : "transparent", borderColor: breakDuration===d ? "rgba(245,158,11,0.5)" : "var(--border)", color: breakDuration===d ? "#f59e0b" : "var(--muted)" }}>
                        {d}m
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { await addBreakToQueue(r.id, breakType, breakDuration); setInsertBreakAfter(null); }}
                      className="flex-1 h-[36px] rounded-[8px] font-bold text-[12px] text-black"
                      style={{ background: "#f59e0b" }}>
                      ☕ Add to Queue
                    </button>
                    <button onClick={() => setInsertBreakAfter(null)}
                      className="px-3 h-[36px] rounded-[8px] border text-[12px] text-gray-500"
                      style={{ borderColor: "var(--border2)" }}>✕</button>
                  </div>
                </div>
              </div>
            )}
            {pickingId === r.id && (
              <div className="mx-4 mb-3 rounded-[10px] border overflow-hidden" style={{ borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.06)" }}>
                <div className="px-3 py-2 font-mono text-[10px] text-purple-400 tracking-widest uppercase border-b" style={{ borderColor: "rgba(167,139,250,0.2)" }}>Move after...</div>
                <div className="max-h-[180px] overflow-y-auto">
                  <button
                    onClick={async () => { await reorderRoutine(r.id, routines[0].id); setPickingId(null); }}
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 transition-colors border-b font-semibold text-purple-400"
                    style={{ borderColor: "rgba(167,139,250,0.15)" }}>
                    ↑ Move to top
                  </button>
                  {routines.filter(x => x.id !== r.id).map(x => (
                    <button key={x.id}
                      onClick={async () => { await reorderRoutine(r.id, x.id); setPickingId(null); }}
                      className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 transition-colors border-b"
                      style={{ borderColor: "rgba(167,139,250,0.1)", color: "var(--text)" }}>
                      <span className="font-mono text-purple-400 mr-2">{x.number}</span>{x.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {r.scratched ? (
                <Button variant="ghost" size="sm" onClick={() => unScratch(r.id)}>↩ Restore</Button>
              ) : (
                <>
                  {!r.checked_in && !r.completed && <Button variant="amber" size="sm" onClick={() => checkIn(r.id)}>Check In</Button>}
                  {r.checked_in && !r.completed && <Button variant="ghost" size="sm" onClick={() => undoCheckIn(r.id)}>Undo</Button>}
                  {r.checked_in && !r.ready && !r.completed && <Button variant="green" size="sm" onClick={() => markReady(r.id)}>Mark Ready</Button>}
                  {r.ready && !r.on_stage && !r.completed && <Button variant="ghost" size="sm" onClick={() => markNotReady(r.id)}>Not Ready</Button>}
                  {!r.on_stage && !r.completed && r.checked_in && <Button variant="stage" size="sm" onClick={() => setOnStage(r.id)}>🎭 On Stage</Button>}
                  {r.on_stage && <><Button variant="green" size="sm" onClick={() => markCompleted(r.id)}>✔ Done</Button><Button variant="red" size="sm" onClick={() => removeFromStage(r.id)}>✕ Remove</Button></>}
                  {r.completed && <Button variant="ghost" size="sm" onClick={() => checkIn(r.id)}>Re-Check In</Button>}
                  {!r.on_stage && !r.is_break && <Button variant="ghost" size="sm" onClick={() => setInsertBreakAfter(insertBreakAfter === r.id ? null : r.id)}>☕ Break After</Button>}
                  {!r.on_stage && <Button variant="red" size="sm" onClick={() => scratchRoutine(r.id)}>✕ Scratch</Button>}
                  <Button variant={r.has_prop ? "prop-on" : "prop-off"} size="sm" onClick={() => toggleProp(r.id)}>{r.has_prop ? "🎬 Has Prop" : "🎬 No Prop"}</Button>
                  {!r.notes && <Button variant="ghost" size="sm" onClick={() => { setEditingNoteId(r.id); setNoteText(""); }}>📝 Add Note</Button>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
