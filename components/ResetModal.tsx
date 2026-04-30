"use client";
import { useState } from "react";
interface Props { onConfirm: () => Promise<void>; onClose: () => void; eventName?: string; }
export default function ResetModal({ onConfirm, onClose, eventName }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ready = input.trim().toUpperCase() === "RESET";
  async function handleConfirm() {
    if (!ready) return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-[20px] border p-7" style={{ background: "var(--card)", borderColor: "rgba(255,82,88,0.3)" }} onClick={(e: any) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="text-[42px] mb-3">⚠️</div>
          <div className="font-display text-[24px] tracking-[2px] text-red-400">Reset Competition</div>
          {eventName && <div className="font-mono text-[11px] text-gray-600 mt-1">{eventName}</div>}
        </div>
        <div className="rounded-[10px] border px-4 py-3 mb-5" style={{ background: "rgba(255,82,88,0.09)", borderColor: "rgba(255,82,88,0.26)" }}>
          <div className="text-[13px] text-red-400 leading-relaxed">
            This will <strong className="text-white">permanently delete all routines</strong> for this event. Check-in status, stage status, and all data will be wiped.<br /><br />This cannot be undone.
          </div>
        </div>
        <div className="mb-5">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-500 mb-2">Type RESET to confirm</div>
          <input autoFocus type="text" placeholder="RESET"
            className="w-full h-[52px] rounded-[10px] border px-4 text-[16px] font-bold tracking-widest outline-none text-center transition-colors"
            style={{ background: "var(--surface)", borderColor: ready ? "rgba(255,82,88,0.5)" : "var(--border)", color: ready ? "#ff5258" : "var(--text)" }}
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleConfirm()} />
        </div>
        <div className="flex gap-2.5">
          <button onClick={handleConfirm} disabled={!ready || loading}
            className="flex-1 h-[52px] rounded-[10px] border font-bold text-[14px] transition-all disabled:opacity-25"
            style={{ background: ready ? "rgba(255,82,88,0.15)" : "transparent", borderColor: ready ? "rgba(255,82,88,0.4)" : "var(--border2)", color: ready ? "#ff5258" : "var(--dim)" }}>
            {loading ? "Clearing…" : "🗑 Reset Everything"}
          </button>
          <button onClick={onClose} className="h-[52px] px-5 rounded-[10px] border text-[14px] font-medium text-gray-500 hover:text-white transition-all" style={{ borderColor: "var(--border2)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
