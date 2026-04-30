"use client";
import { useEffect, useState } from "react";
import { Routine } from "@/types";
interface Props {
  routines: Routine[];
  onExit: () => void;
  onMarkCompleted: (id: string) => void;
  onSetOnStage: (id: string) => void;
  onRemoveFromStage: (id: string) => void;
}
export default function FullscreenMode({ routines, onExit, onMarkCompleted, onSetOnStage, onRemoveFromStage }: Props) {
  const onStage = routines.find(r => r.on_stage);
  const readyQueue = routines.filter(r => r.ready && !r.on_stage && !r.completed).sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  const [upNext] = readyQueue;
  const [clock, setClock] = useState("");
  useEffect(() => { function tick() { setClock(new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })); } tick(); const t = setInterval(tick, 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onExit();
      if ((e.key === " " || e.key === "Enter") && onStage) { e.preventDefault(); onMarkCompleted(onStage.id); }
      if (e.key === "n" && upNext) onSetOnStage(upNext.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, onStage, upNext, onMarkCompleted, onSetOnStage]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background:"var(--black)" }}>
      <div className="flex items-center justify-between px-8 py-4 flex-shrink-0" style={{ borderBottom:"1px solid var(--border)" }}>
        <div className="font-display text-[20px] tracking-[3px] text-gray-600">Dance<span className="text-pink-500">Comp</span></div>
        <div className="font-mono text-[22px] text-gray-500">{clock}</div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10px] text-gray-700 hidden md:flex gap-4"><span>SPACE = done</span><span>N = next on stage</span><span>ESC = exit</span></div>
          <button onClick={onExit} className="font-mono text-[11px] px-4 py-2 rounded-[8px] border text-gray-600 hover:text-white transition-colors" style={{ borderColor:"var(--border)" }}>ESC EXIT</button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center px-12 py-10" style={{ borderRight:"1px solid var(--border)" }}>
          <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600 mb-6">Now On Stage</div>
          {onStage ? (
            <>
              <div className="font-display leading-none text-yellow-300 mb-4" style={{ fontSize:"clamp(100px,20vw,220px)", letterSpacing:"6px" }}>{onStage.number}</div>
              <div className="text-white mb-2" style={{ fontSize:"clamp(22px,3vw,40px)", fontWeight:700 }}>{onStage.title}</div>
              <div className="text-gray-400" style={{ fontSize:"clamp(15px,2vw,24px)" }}>{onStage.studio} · {onStage.division}</div>
              {onStage.has_prop && <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-[12px] border" style={{ background:"rgba(255,140,0,0.12)", borderColor:"rgba(255,140,0,0.35)" }}><span style={{fontSize:"clamp(18px,2vw,26px)"}}>🎬</span><span className="text-orange-400 font-semibold" style={{fontSize:"clamp(13px,1.5vw,20px)"}}>Prop Setup Required</span></div>}
              <div className="flex gap-4 mt-8 flex-wrap">
                <button onClick={() => onMarkCompleted(onStage.id)} className="px-8 py-4 rounded-[12px] border font-bold transition-all active:scale-[0.97]" style={{ background:"rgba(32,212,156,0.12)", borderColor:"rgba(32,212,156,0.35)", color:"#20d49c", fontSize:"clamp(13px,1.5vw,18px)" }}>Off Stage Done</button>
                <button onClick={() => onRemoveFromStage(onStage.id)} className="px-8 py-4 rounded-[12px] border font-bold transition-all active:scale-[0.97]" style={{ background:"rgba(255,82,88,0.10)", borderColor:"rgba(255,82,88,0.30)", color:"#ff5258", fontSize:"clamp(13px,1.5vw,18px)" }}>Wrong Number</button>
              </div>
            </>
          ) : <div className="font-mono text-gray-700" style={{fontSize:"clamp(18px,2.5vw,30px)"}}>No routine on stage</div>}
        </div>
        <div className="flex flex-col" style={{ width:"clamp(260px,28vw,400px)" }}>
          <div className="flex-1 flex flex-col justify-center px-8 py-8" style={{ borderBottom:"1px solid var(--border)", background: upNext?.has_prop ? "rgba(255,140,0,0.04)" : "rgba(32,212,156,0.03)" }}>
            <div className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-600 mb-4">Up Next</div>
            {upNext ? (
              <>
                <div className="font-display text-emerald-400 leading-none mb-3" style={{fontSize:"clamp(56px,8vw,96px)"}}>{upNext.number}</div>
                <div className="text-white font-semibold mb-1" style={{fontSize:"clamp(14px,1.8vw,22px)"}}>{upNext.title}</div>
                <div className="text-gray-500" style={{fontSize:"clamp(11px,1.2vw,16px)"}}>{upNext.studio}</div>
                {upNext.has_prop && <div className="mt-3 text-orange-400 font-mono text-[11px]">🎬 PROP REQUIRED</div>}
                <button onClick={() => onSetOnStage(upNext.id)} className="mt-6 px-5 py-3 rounded-[10px] border font-bold transition-all active:scale-[0.97] self-start" style={{ background:"rgba(255,208,96,0.12)", borderColor:"rgba(255,208,96,0.30)", color:"#ffd060", fontSize:"clamp(12px,1.3vw,16px)" }}>🎭 Put On Stage</button>
              </>
            ) : <div className="font-mono text-gray-700 text-[14px]">No routines ready</div>}
          </div>
          <div className="overflow-y-auto px-6 py-4" style={{maxHeight:"38vh"}}>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-3">Standing By ({Math.max(0, readyQueue.length - 1)})</div>
            {readyQueue.slice(1).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 cursor-pointer group" style={{borderBottom:"1px solid var(--border)"}} onClick={() => onSetOnStage(r.id)}>
                <div className="font-display text-emerald-400 group-hover:text-yellow-300 transition-colors" style={{fontSize:"clamp(22px,3vw,34px)",minWidth:"48px"}}>{r.number}</div>
                <div className="flex-1"><div className="text-white text-[13px] font-medium">{r.title}</div>{r.has_prop && <div className="text-orange-400 text-[11px]">🎬 Prop</div>}</div>
                <div className="text-gray-700 group-hover:text-yellow-300 text-[11px] transition-colors">Stage</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
