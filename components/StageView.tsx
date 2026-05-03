"use client";
import { useEffect, useState } from "react";
import BreakBanner from "@/components/BreakBanner";
import { Break } from "@/hooks/useBreak";
import { Routine } from "@/types";
interface Props { routines: Routine[]; eventName?: string; onLeave: () => void; activeBreak: Break | null; }
export default function StageView({ routines, eventName, onLeave, activeBreak }: Props) {
  const [clock, setClock] = useState("");
  useEffect(() => {
    function tick() { setClock(new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })); }
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);
  const onStage = routines.find(r => r.on_stage);
  const readyQueue = routines
    .filter(r => (r.ready || r.scratched) && !r.on_stage && !r.completed)
    .sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  const upNext = readyQueue[0];
  return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--black)" }}>
      {activeBreak && <BreakBanner activeBreak={activeBreak} isEmcee={false} />}
      {activeBreak && <div style={{ height: "56px" }} />}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor:"var(--border)", background:"var(--surface)" }}>
        <div className="flex items-center gap-3">
          <div className="font-display text-[20px] tracking-[3px]">NextTo<span className="text-pink-500">Stage</span></div>
          {eventName && <span className="text-gray-600 text-[13px]">{eventName}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] tracking-[2px] uppercase text-gray-600 px-3 py-1 rounded-full border" style={{ borderColor:"var(--border)" }}>👁 Stage View — Read Only</div>
          <div className="font-mono text-[16px] text-gray-500">{clock}</div>
          <button onClick={onLeave} className="font-mono text-[11px] px-3 py-1.5 rounded-[8px] border text-gray-600 hover:text-white transition-colors" style={{ borderColor:"var(--border)" }}>Leave</button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center items-start px-10 py-10" style={{ borderRight:"1px solid var(--border)" }}>
          <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600 mb-8">Now On Stage</div>
          {onStage ? (
            <div className="w-full">
              <div className="font-display text-yellow-300 leading-none mb-5" style={{ fontSize:"clamp(80px,18vw,200px)", letterSpacing:"4px" }}>{onStage.number}</div>
              <div className="text-white font-bold mb-2" style={{ fontSize:"clamp(20px,3vw,42px)" }}>{onStage.title}</div>
              <div className="text-gray-400 mb-2" style={{ fontSize:"clamp(14px,2vw,26px)" }}>{onStage.studio}</div>
              <div className="text-gray-600" style={{ fontSize:"clamp(12px,1.5vw,20px)" }}>{onStage.division}{onStage.age_group ? ` · ${onStage.age_group}` : ""}</div>
              {onStage.has_prop && (
                <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-[12px] border" style={{ background:"rgba(255,140,0,0.12)", borderColor:"rgba(255,140,0,0.35)" }}>
                  <span className="text-[22px]">🎬</span>
                  <span className="text-orange-400 font-bold text-[16px]">Prop Required</span>
                </div>
              )}
            </div>
          ) : (
            <div className="font-mono text-gray-700" style={{ fontSize:"clamp(16px,2vw,28px)" }}>Stage is clear</div>
          )}
        </div>
        <div className="flex flex-col" style={{ width:"clamp(240px,30vw,380px)" }}>
          <div className="flex-1 flex flex-col justify-center px-8 py-8" style={{ borderBottom:"1px solid var(--border)", background: upNext?.scratched ? "rgba(255,82,88,0.05)" : "rgba(32,212,156,0.03)" }}>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-4">Up Next</div>
            {upNext ? (
              <>
                <div className={`font-display leading-none mb-3 ${upNext.scratched ? "text-red-400 line-through" : "text-emerald-400"}`} style={{ fontSize:"clamp(48px,8vw,88px)" }}>{upNext.number}</div>
                <div className={`font-semibold mb-1 ${upNext.scratched ? "line-through text-gray-500" : "text-white"}`} style={{ fontSize:"clamp(13px,1.8vw,20px)" }}>{upNext.title}</div>
                <div className="text-gray-500" style={{ fontSize:"clamp(11px,1.2vw,16px)" }}>{upNext.studio}</div>
                {upNext.scratched && <div className="font-mono text-[11px] text-red-400 mt-2 tracking-wider">SCRATCHED</div>}
                {upNext.has_prop && !upNext.scratched && <div className="mt-3 text-orange-400 font-mono text-[11px]">🎬 PROP REQUIRED</div>}
              </>
            ) : <div className="font-mono text-gray-700 text-[13px]">No routines ready</div>}
          </div>
          <div className="overflow-y-auto px-6 py-4">
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-3">Standing By ({Math.max(0, readyQueue.length - 1)})</div>
            {readyQueue.slice(1).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom:"1px solid var(--border)" }}>
                <div className={`font-display min-w-[44px] ${r.scratched ? "text-red-400 line-through" : "text-emerald-400"}`} style={{ fontSize:"clamp(20px,2.5vw,30px)" }}>{r.number}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium truncate ${r.scratched ? "line-through text-gray-600" : "text-white"}`}>{r.title}</div>
                  {r.scratched && <div className="font-mono text-[9px] text-red-400">SCRATCHED</div>}
                </div>
                {r.has_prop && !r.scratched && <span className="text-orange-400 text-[11px]">🎬</span>}
              </div>
            ))}
            {readyQueue.length <= 1 && <div className="font-mono text-[12px] text-gray-700 text-center py-4">Nothing else queued</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
