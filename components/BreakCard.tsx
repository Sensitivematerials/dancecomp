"use client";
import { useState } from "react";
import { BreakType } from "@/hooks/useBreak";

interface Props {
  onStart: (type: BreakType, duration: number) => void;
}

const TYPES: { type: BreakType; emoji: string; label: string; color: string; bg: string; border: string }[] = [
  { type: "break",  emoji: "☕", label: "Break",  color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.35)"  },
  { type: "lunch",  emoji: "🍽", label: "Lunch",  color: "#f05aa8", bg: "rgba(240,90,168,0.10)",  border: "rgba(240,90,168,0.35)"  },
  { type: "dinner", emoji: "🍷", label: "Dinner", color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.35)" },
];

const DURATIONS = [10, 15, 20, 30, 45, 60];

export default function BreakCard({ onStart }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<BreakType>("break");
  const [duration, setDuration] = useState(15);
  const selected = TYPES.find(t => t.type === selectedType)!;

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full rounded-[14px] border mb-2.5 py-3.5 flex items-center justify-center gap-2 font-bold text-[14px] transition-all hover:opacity-80"
      style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)", borderStyle: "dashed", color: "#f59e0b" }}>
      ☕ Insert Break
    </button>
  );

  return (
    <div className="rounded-[14px] border mb-2.5 overflow-hidden"
      style={{ background: selected.bg, borderColor: selected.border }}>
      <div className="px-4 pt-4 pb-3">
        <div className="font-mono text-[10px] tracking-[2px] uppercase mb-3" style={{ color: selected.color }}>Insert Break Into Show</div>

        {/* Type selector */}
        <div className="flex gap-2 mb-3">
          {TYPES.map(t => (
            <button key={t.type} onClick={() => setSelectedType(t.type)}
              className="flex-1 h-[44px] rounded-[10px] border flex items-center justify-center gap-1.5 font-semibold text-[13px] transition-all"
              style={{
                background: selectedType === t.type ? t.bg : "transparent",
                borderColor: selectedType === t.type ? t.border : "var(--border)",
                color: selectedType === t.type ? t.color : "var(--muted)"
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Duration selector */}
        <div className="font-mono text-[10px] tracking-[2px] uppercase mb-2" style={{ color: selected.color + "99" }}>Duration</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setDuration(d)}
              className="h-[34px] px-3 rounded-[8px] border font-mono text-[12px] transition-all"
              style={{
                background: duration === d ? selected.bg : "transparent",
                borderColor: duration === d ? selected.border : "var(--border)",
                color: duration === d ? selected.color : "var(--muted)"
              }}>
              {d}m
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => { onStart(selectedType, duration); setOpen(false); }}
            className="flex-1 h-[44px] rounded-[10px] font-bold text-[14px] text-black transition-all"
            style={{ background: selected.color }}>
            {selected.emoji} Start {selected.label}
          </button>
          <button onClick={() => setOpen(false)}
            className="h-[44px] px-4 rounded-[10px] border text-[13px] text-gray-500"
            style={{ borderColor: "var(--border2)" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
