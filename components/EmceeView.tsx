"use client";
import { useMemo, useState } from "react";
import { Routine, getStatus } from "@/types";
import { useRoutines } from "@/hooks/useRoutines";
import SectionLabel from "./ui/SectionLabel";
import EmptyState   from "./ui/EmptyState";
import Button        from "./ui/Button";

type Props = ReturnType<typeof useRoutines> & { onFullscreen?: () => void };

export default function EmceeView({ routines, setOnStage, markCompleted, removeFromStage }: Props) {
  const [checkinOpen, setCheckinOpen] = useState(false);

  const onStage = routines.find(r => r.on_stage);

  const readyQueue = useMemo(() =>
    routines
      .filter(r => r.ready && !r.on_stage && !r.completed)
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
  , [routines]);

  const scratchedInQueue = useMemo(() =>
    routines
      .filter(r => r.scratched && r.checked_in && !r.on_stage && !r.completed)
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
  , [routines]);

  const fullQueue = useMemo(() => {
    const combined = [...readyQueue, ...scratchedInQueue];
    return combined.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  }, [readyQueue, scratchedInQueue]);

  const checkedIn = useMemo(() =>
    routines
      .filter(r => r.checked_in && !r.completed)
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
  , [routines]);

  const [upNext, ...rest] = fullQueue;

  return (
    <div>
      {/* ── ON STAGE ── */}
      <SectionLabel>Now On Stage</SectionLabel>
      <div className="rounded-[18px] p-6 mb-5 relative border-2"
        style={{ background: "rgba(255,208,96,0.10)", borderColor: "rgba(255,208,96,0.28)" }}>
        <span className="absolute top-4 right-4 font-mono text-[10px] tracking-[2px] text-yellow-300 opacity-65">LIVE</span>
        {onStage ? (
          <>
            <div className="font-display text-[88px] leading-none text-yellow-300 tracking-[4px]">{onStage.number}</div>
            <div className="text-[22px] font-bold mt-3">{onStage.title}</div>
            <div className="text-sm text-gray-400 mt-1">{onStage.studio} · {onStage.division}</div>
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <Button variant="green" fullWidth onClick={() => markCompleted(onStage.id)}>✔ Off Stage — Done</Button>
              <Button variant="red"   fullWidth onClick={() => removeFromStage(onStage.id)}>✕ Wrong Number</Button>
            </div>
          </>
        ) : (
          <div className="text-gray-600 font-mono text-base py-4">No routine on stage</div>
        )}
      </div>

      {/* ── READY QUEUE ── */}
      <SectionLabel>Ready to Go{fullQueue.length > 0 ? ` · ${fullQueue.length}` : ""}</SectionLabel>

      {fullQueue.length === 0 ? (
        <EmptyState>No routines ready yet</EmptyState>
      ) : (
        <>
          {/* Prop alert */}
          {upNext.has_prop && (
            <div className="flex items-center gap-3 rounded-[10px] px-4 py-3 mb-2.5 border"
              style={{ background: "rgba(255,140,0,0.12)", borderColor: "rgba(255,140,0,0.35)" }}>
              <span className="text-[22px]">🎬</span>
              <div>
                <div className="text-[13px] font-semibold text-orange-400">Prop Required — Hold for Setup</div>
                <div className="text-[11px] text-orange-400/70 mt-0.5">Allow time before announcing #{upNext.number}</div>
              </div>
            </div>
          )}

          {/* Up next — prominent */}
          {upNext.scratched && (
            <div className="flex items-center gap-3 rounded-[10px] px-4 py-3 mb-2.5 border"
              style={{ background: "rgba(255,82,88,0.08)", borderColor: "rgba(255,82,88,0.30)" }}>
              <span className="text-[18px]">⚠️</span>
              <div className="text-[13px] font-semibold text-red-400">Next routine is SCRATCHED — announce to crowd then move on</div>
            </div>
          )}
          <div className={`flex items-center gap-4 rounded-[14px] p-5 mb-2.5 border`}
            style={{
              background: upNext.scratched ? "rgba(255,82,88,0.07)" : "rgba(32,212,156,0.09)",
              borderColor: upNext.scratched ? "rgba(255,82,88,0.30)" : upNext.has_prop ? "rgba(255,140,0,0.35)" : "rgba(32,212,156,0.26)"
            }}>
            <div className={`font-display text-[52px] leading-none min-w-[68px] ${upNext.scratched ? "text-red-400 line-through" : "text-emerald-400"}`}>{upNext.number}</div>
            <div className="flex-1">
              <div className={`text-[17px] font-semibold ${upNext.scratched ? "line-through text-gray-400" : ""}`}>{upNext.title}</div>
              <div className="text-[13px] text-gray-400 mt-1">{upNext.studio} · {upNext.division}</div>
              {upNext.scratched && <div className="font-mono text-[10px] text-red-400 mt-1 tracking-wider">SCRATCHED</div>}
              {upNext.has_prop && !upNext.scratched && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-orange-400 font-mono text-[10px] px-2.5 py-1 rounded-full border"
                  style={{ background: "rgba(255,140,0,0.12)", borderColor: "rgba(255,140,0,0.35)" }}>
                  🎬 Prop
                </span>
              )}
              {upNext.notes && !upNext.scratched && (
                <div className="mt-2 text-[12px] text-yellow-300 font-medium flex items-start gap-1.5">
                  <span className="text-[14px] flex-shrink-0">📝</span>
                  <span>{upNext.notes}</span>
                </div>
              )}
            </div>
            <Button variant="stage" size="sm" onClick={() => setOnStage(upNext.id)}>
              {upNext.scratched ? "📢 Announce" : "🎭 Put On Stage"}
            </Button>
          </div>

          {/* Rest of queue */}
          {rest.map(r => (
            <div key={r.id} className={`flex items-center gap-3 rounded-[10px] px-4 py-3 mb-2 border`}
              style={{ background: r.scratched ? "rgba(255,82,88,0.05)" : "var(--card)", borderColor: r.scratched ? "rgba(255,82,88,0.20)" : "var(--border)" }}>
              <div className={`font-display text-[28px] leading-none min-w-[46px] ${r.scratched ? "text-red-400 line-through" : "text-emerald-400"}`}>{r.number}</div>
              <div className="flex-1">
                <div className={`text-[14px] font-semibold ${r.scratched ? "line-through text-gray-500" : ""}`}>{r.title}</div>
                {r.scratched && <div className="font-mono text-[9px] text-red-400 tracking-wider">SCRATCHED</div>}
                {r.notes && !r.scratched && <div className="text-[11px] text-yellow-300/80 mt-0.5 truncate">📝 {r.notes}</div>}
              </div>
              {r.has_prop && !r.scratched && <span className="text-[14px]">🎬</span>}
              <Button variant="stage" size="sm" onClick={() => setOnStage(r.id)}>
                {r.scratched ? "📢" : "🎭 Put On Stage"}
              </Button>
            </div>
          ))}
        </>
      )}

      {/* ── CHECKED IN (collapsible) ── */}
      <div className="mt-6">
        <button
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[14px] border transition-colors`}
          style={{
            background: "var(--card)", borderColor: "var(--border)",
            borderBottomLeftRadius: checkinOpen ? 0 : undefined,
            borderBottomRightRadius: checkinOpen ? 0 : undefined,
            borderBottomColor: checkinOpen ? "transparent" : undefined,
          }}
          onClick={() => setCheckinOpen(v => !v)}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-500">All Checked In</span>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full text-gray-500"
              style={{ background: "var(--border2)" }}>{checkedIn.length}</span>
          </div>
          <span className={`text-gray-600 text-[13px] transition-transform ${checkinOpen ? "rotate-180" : ""}`}>▼</span>
        </button>
        {checkinOpen && (
          <div className="border border-t-0 rounded-b-[14px] p-3.5"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            {checkedIn.length === 0 ? (
              <p className="text-center font-mono text-[11px] text-gray-600 py-4">No routines checked in yet</p>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
                {checkedIn.map(r => (
                  <div key={r.id}
                    className={`rounded-[10px] p-2.5 border relative ${r.ready ? "border-emerald-400/25" : ""}`}
                    style={{ background: r.ready ? "rgba(32,212,156,0.09)" : "var(--card2)", borderColor: r.ready ? undefined : "var(--border2)" }}>
                    <div className={`font-display text-[24px] leading-none ${r.ready ? "text-emerald-400" : "text-amber-400"}`}>{r.number}</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 truncate">{r.title}</div>
                    {r.has_prop && <span className="absolute top-2 right-2 text-[11px]">🎬</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
