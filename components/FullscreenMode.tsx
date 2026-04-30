"use client";
import { useEffect, useState } from "react";
import { Routine } from "@/types";

interface Props {
  routines: Routine[];
  onExit: () => void;
}

export default function FullscreenMode({ routines, onExit }: Props) {
  const onStage    = routines.find(r => r.on_stage);
  const readyQueue = routines
    .filter(r => r.ready && !r.on_stage && !r.completed)
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  const [upNext] = readyQueue;
  const [clock, setClock] = useState("");

  // Live clock
  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Exit on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onExit(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--black)" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="font-display text-[20px] tracking-[3px] text-gray-600">
          Dance<span className="text-pink-500">Comp</span> Cue Board
        </div>
        <div className="font-mono text-[22px] text-gray-500">{clock}</div>
        <button
          onClick={onExit}
          className="font-mono text-[11px] tracking-[1px] px-4 py-2 rounded-[8px] border text-gray-600 hover:text-white transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          ESC — EXIT
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* ON STAGE — left big panel */}
        <div className="flex-1 flex flex-col justify-center px-16 py-12"
          style={{ borderRight: "1px solid var(--border)" }}>
          <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600 mb-6">
            Now On Stage
          </div>
          {onStage ? (
            <>
              <div className="font-display leading-none text-yellow-300 mb-4"
                style={{ fontSize: "clamp(120px, 22vw, 240px)", letterSpacing: "6px" }}>
                {onStage.number}
              </div>
              <div className="text-white mb-2"
                style={{ fontSize: "clamp(24px, 3vw, 42px)", fontWeight: 700 }}>
                {onStage.title}
              </div>
              <div className="text-gray-400"
                style={{ fontSize: "clamp(16px, 2vw, 26px)" }}>
                {onStage.studio} · {onStage.division}
              </div>
              {onStage.has_prop && (
                <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-[12px] border"
                  style={{ background: "rgba(255,140,0,0.12)", borderColor: "rgba(255,140,0,0.35)" }}>
                  <span style={{ fontSize: "clamp(20px, 2vw, 28px)" }}>🎬</span>
                  <span className="text-orange-400 font-semibold"
                    style={{ fontSize: "clamp(14px, 1.5vw, 20px)" }}>
                    Prop Setup Required
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="font-mono text-gray-700"
              style={{ fontSize: "clamp(20px, 2.5vw, 32px)" }}>
              No routine on stage
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Next up + queue */}
        <div className="flex flex-col" style={{ width: "clamp(280px, 30vw, 420px)" }}>

          {/* Next up */}
          <div className="flex-1 flex flex-col justify-center px-10 py-10"
            style={{ borderBottom: "1px solid var(--border)", background: "rgba(32,212,156,0.04)" }}>
            <div className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-600 mb-4">
              Up Next
            </div>
            {upNext ? (
              <>
                <div className="font-display text-emerald-400 leading-none mb-3"
                  style={{ fontSize: "clamp(60px, 8vw, 100px)" }}>
                  {upNext.number}
                </div>
                <div className="text-white font-semibold mb-1"
                  style={{ fontSize: "clamp(15px, 1.8vw, 22px)" }}>
                  {upNext.title}
                </div>
                <div className="text-gray-500"
                  style={{ fontSize: "clamp(12px, 1.2vw, 16px)" }}>
                  {upNext.studio}
                </div>
                {upNext.has_prop && (
                  <div className="mt-3 text-orange-400 font-mono text-[11px] tracking-wide">
                    🎬 PROP REQUIRED
                  </div>
                )}
              </>
            ) : (
              <div className="font-mono text-gray-700 text-[14px]">No routines ready</div>
            )}
          </div>

          {/* Rest of queue */}
          <div className="overflow-y-auto px-6 py-4" style={{ flex: "0 0 auto", maxHeight: "40vh" }}>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-3">
              Standing By ({readyQueue.length > 1 ? readyQueue.length - 1 : 0})
            </div>
            {readyQueue.slice(1).map(r => (
              <div key={r.id}
                className="flex items-center gap-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="font-display text-emerald-400"
                  style={{ fontSize: "clamp(24px, 3vw, 36px)", minWidth: "52px" }}>
                  {r.number}
                </div>
                <div>
                  <div className="text-white text-[13px] font-medium">{r.title}</div>
                  {r.has_prop && <div className="text-orange-400 text-[11px] mt-0.5">🎬 Prop</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
