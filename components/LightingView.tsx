"use client";
import { useEffect, useState } from "react";
import { Routine } from "@/types";

const AMBER = "#f59e0b";
const AMBER_DIM = "rgba(245,158,11,0.18)";
const AMBER_BORDER = "rgba(245,158,11,0.32)";
const AMBER_BORDER_SUBTLE = "rgba(245,158,11,0.18)";

interface Props {
  routines: Routine[];
  eventName?: string;
  onLeave: () => void;
}

function LiveClock() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono tabular-nums" style={{ color: "#6b7280" }}>{clock}</span>;
}

export default function LightingView({ routines, eventName, onLeave }: Props) {
  const onStage = routines.find(r => r.on_stage && !r.scratched) ?? null;

  const upNext = routines
    .filter(r => r.ready && !r.on_stage && !r.completed && !r.scratched)
    .sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999))
    .slice(0, 3);

  const isBreak = onStage?.is_break ?? false;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--black)", color: "#eeeef5" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-3">
          <div className="font-display text-[20px] tracking-[3px]">
            NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
          </div>
          {eventName && <span className="text-gray-600 text-[13px]">{eventName}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="font-mono text-[11px] tracking-[2px] uppercase px-3 py-1 rounded-full border"
            style={{ borderColor: AMBER_BORDER_SUBTLE, color: AMBER, background: "rgba(245,158,11,0.08)" }}
          >
            💡 Lighting — Read Only
          </div>
          <LiveClock />
          <button
            onClick={onLeave}
            className="font-mono text-[11px] px-3 py-1.5 rounded-[8px] border text-gray-600 hover:text-white transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 flex flex-col gap-10 max-w-4xl mx-auto w-full">

        {/* ── NOW ON STAGE ──────────────────────────────────────────────── */}
        <section>
          <div
            className="font-mono text-[11px] tracking-[4px] uppercase mb-5"
            style={{ color: AMBER }}
          >
            ▶ Now on Stage
          </div>

          {onStage ? (
            <div
              className="rounded-[20px] border p-7 md:p-10"
              style={{ background: "rgba(245,158,11,0.04)", borderColor: AMBER_BORDER }}
            >
              {isBreak ? (
                /* Break on stage */
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[40px]">
                    {onStage.break_type === "lunch" ? "🍽️" : onStage.break_type === "dinner" ? "🍷" : "☕"}
                  </span>
                  <div>
                    <div className="font-bold text-[22px]">{onStage.title}</div>
                    <div className="font-mono text-[11px] tracking-[2px] uppercase mt-1" style={{ color: AMBER }}>
                      On Break
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular routine on stage */
                <div className="mb-6">
                  <div
                    className="font-display leading-none tracking-[2px] mb-3"
                    style={{ fontSize: "clamp(64px, 12vw, 110px)", color: AMBER }}
                  >
                    {onStage.number}
                  </div>
                  <div
                    className="font-bold leading-tight mb-1"
                    style={{ fontSize: "clamp(22px, 3.5vw, 36px)" }}
                  >
                    {onStage.title}
                  </div>
                  <div className="text-gray-400" style={{ fontSize: "clamp(14px, 2vw, 22px)" }}>
                    {onStage.studio}
                    {onStage.division ? (
                      <span className="text-gray-600"> · {onStage.division}</span>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Lighting cue box */}
              <div>
                <div
                  className="font-mono text-[10px] tracking-[3px] uppercase mb-2"
                  style={{ color: AMBER }}
                >
                  Lighting Cue
                </div>
                {onStage.lighting_notes?.trim() ? (
                  <div
                    className="rounded-[12px] border px-5 py-4"
                    style={{ background: AMBER_DIM, borderColor: AMBER_BORDER }}
                  >
                    <p
                      className="font-medium leading-relaxed whitespace-pre-wrap"
                      style={{ fontSize: "clamp(16px, 2.2vw, 22px)", color: "#fef3c7" }}
                    >
                      {onStage.lighting_notes}
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-[12px] border px-5 py-4"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--border)" }}
                  >
                    <p className="text-gray-600 italic" style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}>
                      No cue set
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="rounded-[20px] border p-10 text-center"
              style={{ background: "#111116", borderColor: "var(--border)" }}
            >
              <div className="font-mono text-[14px] tracking-[3px] uppercase" style={{ color: "#3d3d55" }}>
                Stage is clear
              </div>
            </div>
          )}
        </section>

        {/* ── UP NEXT ───────────────────────────────────────────────────── */}
        {upNext.length > 0 && (
          <section>
            <div
              className="font-mono text-[11px] tracking-[4px] uppercase mb-5"
              style={{ color: "#a78bfa" }}
            >
              ↑ Up Next
            </div>
            <div className="flex flex-col gap-4">
              {upNext.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-[16px] border p-5 md:p-7"
                  style={{
                    background: i === 0 ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
                    borderColor: i === 0 ? AMBER_BORDER_SUBTLE : "var(--border)",
                    opacity: i === 0 ? 1 : i === 1 ? 0.75 : 0.5,
                  }}
                >
                  <div className="flex items-start gap-5 mb-4">
                    <div
                      className="font-display leading-none shrink-0"
                      style={{
                        fontSize: "clamp(36px, 6vw, 56px)",
                        color: i === 0 ? AMBER : "#6b7280",
                        minWidth: "60px",
                      }}
                    >
                      {r.is_break ? (r.break_type === "lunch" ? "🍽️" : r.break_type === "dinner" ? "🍷" : "☕") : r.number}
                    </div>
                    <div className="min-w-0 pt-1">
                      <div
                        className="font-bold leading-tight"
                        style={{ fontSize: "clamp(16px, 2.2vw, 22px)" }}
                      >
                        {r.title}
                      </div>
                      <div className="text-gray-500 mt-0.5" style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                        {r.studio}
                        {r.division ? <span className="text-gray-600"> · {r.division}</span> : null}
                      </div>
                    </div>
                  </div>

                  {/* Cue */}
                  <div>
                    <div
                      className="font-mono text-[9px] tracking-[2.5px] uppercase mb-1.5"
                      style={{ color: i === 0 ? AMBER : "#4b5563" }}
                    >
                      Cue
                    </div>
                    {r.lighting_notes?.trim() ? (
                      <div
                        className="rounded-[8px] border px-4 py-3"
                        style={{
                          background: i === 0 ? "rgba(245,158,11,0.10)" : "rgba(255,255,255,0.03)",
                          borderColor: i === 0 ? AMBER_BORDER_SUBTLE : "var(--border)",
                        }}
                      >
                        <p
                          className="whitespace-pre-wrap leading-snug"
                          style={{
                            fontSize: "clamp(13px, 1.6vw, 17px)",
                            color: i === 0 ? "#fef3c7" : "#9ca3af",
                          }}
                        >
                          {r.lighting_notes}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-700" style={{ fontSize: "clamp(12px, 1.4vw, 15px)" }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-t flex-shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="font-mono text-[11px] text-gray-700">
          {eventName ?? "NextToStage"}
        </div>
        <LiveClock />
      </div>
    </div>
  );
}
