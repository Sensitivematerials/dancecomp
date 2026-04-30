"use client";
import { ViewTab } from "@/app/page";
import { UserRole } from "@/hooks/useAuth";
import { Event } from "@/hooks/useEvents";
interface Props {
  view: ViewTab; setView: (v: ViewTab) => void;
  role: UserRole; userName: string;
  unread: number; chatOpen: boolean;
  onToggleChat: () => void; onFullscreen: () => void;
  onSignOut: () => void; onReset: () => void;
  activeEvent: Event | null; onShowEvents: () => void;
}
export default function Header({ view, setView, role, userName, unread, chatOpen, onToggleChat, onFullscreen, onSignOut, onReset, activeEvent, onShowEvents }: Props) {
  const tabs = [
    ...(role !== "backstage" ? [{ key: "emcee" as ViewTab, label: "🎙 Emcee" }] : []),
    ...(role !== "emcee" ? [{ key: "backstage" as ViewTab, label: "🎭 Backstage" }] : []),
    { key: "import" as ViewTab, label: "📂 Import" },
  ];
  return (
    <header className="flex items-center justify-between px-4 h-[60px] flex-shrink-0 border-b z-50 gap-2" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <button onClick={onShowEvents} className="flex items-center gap-2.5 min-w-0">
        <div className="font-display text-[22px] tracking-[2px] whitespace-nowrap flex-shrink-0">Dance<span className="text-pink-500">Comp</span></div>
        {activeEvent && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border min-w-0" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <span className="font-mono text-[10px] text-gray-600 truncate max-w-[120px]">{activeEvent.name}</span>
            <span className="text-gray-600 text-[10px]">▼</span>
          </div>
        )}
      </button>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="flex rounded-[10px] p-1 gap-0.5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setView(t.key)}
              className={`h-[34px] px-3 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap ${view === t.key ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              style={view === t.key ? { background: "var(--border2)" } : {}}>
              {t.label}
            </button>
          ))}
        </div>
        {role !== "backstage" && (
          <button onClick={onFullscreen} className="h-[34px] w-[34px] rounded-[8px] border flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ borderColor: "var(--border)" }} title="Full-screen mode">⛶</button>
        )}
        <button onClick={onToggleChat}
          className={`relative h-[34px] w-[34px] rounded-[8px] border flex items-center justify-center text-[16px] transition-all ${unread > 0 ? "border-pink-500/40 text-pink-400" : "border-[var(--border)] text-gray-500 hover:text-gray-300"}`}>
          💬
          {unread > 0 && <span className="absolute top-[4px] right-[4px] w-2 h-2 bg-pink-500 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />}
        </button>
        <button onClick={onReset} className="hidden sm:flex h-[34px] w-[34px] rounded-[8px] border items-center justify-center text-gray-600 hover:text-red-400 hover:border-red-400/30 transition-all" style={{ borderColor: "var(--border)" }} title="Reset competition">🗑</button>
        <span className="hidden sm:block font-mono text-[11px] text-gray-600 pl-1">{userName}</span>
        <button onClick={onSignOut} className="h-[34px] px-3 rounded-[8px] border text-[11px] font-mono text-gray-600 hover:text-white transition-all" style={{ borderColor: "var(--border)" }}>Leave</button>
      </div>
    </header>
  );
}
