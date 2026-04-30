import { RoutineStatus } from "@/types";

const CONFIG: Record<RoutineStatus, { label: string; cls: string }> = {
  stage:     { label: "🎭 On Stage",    cls: "text-yellow-300 border-yellow-400/30 bg-yellow-400/10" },
  ready:     { label: "✅ Ready",       cls: "text-emerald-400 border-emerald-400/25 bg-emerald-400/10" },
  checked:   { label: "🟡 Checked In", cls: "text-amber-400 border-amber-400/25 bg-amber-400/10" },
  "not-here":{ label: "⬜ Not Here",   cls: "text-gray-600 border-[var(--border)] bg-transparent" },
  completed: { label: "✔ Done",        cls: "text-gray-600 border-[var(--border)] bg-transparent" },
};

export default function StatusBadge({ status }: { status: RoutineStatus }) {
  const { label, cls } = CONFIG[status];
  return (
    <span className={`font-mono text-[9px] tracking-[1.2px] uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}
