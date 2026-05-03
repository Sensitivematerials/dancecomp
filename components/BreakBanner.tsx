"use client";
import { useEffect, useState } from "react";
import { Break, BreakType } from "@/hooks/useBreak";

const BREAK_CONFIG: Record<BreakType, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  break:  { label: "Break",        emoji: "☕", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.4)"  },
  lunch:  { label: "Lunch Break",  emoji: "🍽", color: "#f05aa8", bg: "rgba(240,90,168,0.12)",  border: "rgba(240,90,168,0.4)"  },
  dinner: { label: "Dinner Break", emoji: "🍷", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.4)" },
};

interface Props {
  activeBreak: Break;
  onEnd?: () => void;
  isEmcee?: boolean;
}

export default function BreakBanner({ activeBreak, onEnd, isEmcee }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [overtime, setOvertime] = useState(false);
  const cfg = BREAK_CONFIG[activeBreak.type];

  useEffect(() => {
    function calc() {
      const started = new Date(activeBreak.started_at).getTime();
      const endsAt = started + activeBreak.duration_minutes * 60 * 1000;
      const diff = Math.floor((endsAt - Date.now()) / 1000);
      setSecondsLeft(Math.abs(diff));
      setOvertime(diff < 0);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [activeBreak]);

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 border-b"
      style={{ background: cfg.bg, borderColor: cfg.border, backdropFilter: "blur(8px)" }}>
      <div className="flex items-center gap-3">
        <span className="text-[20px]">{cfg.emoji}</span>
        <div>
          <div className="font-bold text-[13px]" style={{ color: cfg.color }}>{cfg.label}</div>
          <div className="font-mono text-[11px]" style={{ color: cfg.color + "99" }}>
            {overtime ? "+" : ""}{fmt(secondsLeft)} {overtime ? "over" : "remaining"}
          </div>
        </div>
      </div>
      <div className={`font-mono text-[28px] font-bold tabular-nums ${overtime ? "animate-pulse" : ""}`}
        style={{ color: cfg.color }}>
        {overtime ? "+" : ""}{fmt(secondsLeft)}
      </div>
      {isEmcee && onEnd && (
        <button onClick={onEnd}
          className="px-4 py-2 rounded-[8px] font-bold text-[13px] border transition-all"
          style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
          End Break
        </button>
      )}
      {!isEmcee && (
        <div className="font-mono text-[11px] px-3 py-1 rounded-full border"
          style={{ color: cfg.color, borderColor: cfg.border }}>
          BREAK
        </div>
      )}
    </div>
  );
}
