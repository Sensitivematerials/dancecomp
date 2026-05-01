"use client";
import { useState, useRef, useEffect } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  const tabs = [
    ...(role !== "backstage" ? [{ key: "emcee" as ViewTab, label: "🎙 Emcee" }] : []),
    ...(role !== "emcee" ? [{ key: "backstage" as ViewTab, label: "🎭 Backstage" }] : []),
    { key: "import" as ViewTab, label: "📂 Import" },
  ];
  function Item({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
    return (
      <button onClick={() => { onClick(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium transition-colors hover:bg-[var(--card2)]" style={{ color: danger ? "#ff5258" : "var(--text)" }}>
        <span className="text-[18px]">{icon}</span>{label}
      </button>
    );
  }
  return (
    <header className="flex items-center justify-between px-4 pr-5 h-[56px] flex-shrink-0 border-b z-50 gap-2" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <button onClick={onShowEvents} className="flex items-center gap-2 min-w-0 flex-shrink-0">
        <div className="font-display text-[20px] tracking-[2px] whitespace-nowrap">Dance<span className="text-pink-500">Comp</span></div>
        {activeEvent && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-[6px] border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <span className="font-mono text-[10px] text-gray-600 truncate max-w-[100px]">{activeEvent.name}</span>
            <span className="text-gray-600 text-[9px]">▼</span>
          </div>
        )}
      </button>
      <div className="flex rounded-[10px] p-1 gap-0.5 border flex-shrink-0" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`h-[34px] px-2.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap ${view === t.key ? "text-white" : "text-gray-500"}`}
            style={view === t.key ? { background: "var(--border2)" } : {}}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={onToggleChat}
          className={`relative h-[38px] w-[38px] rounded-[8px] border flex items-center justify-center text-[17px] transition-all ${unread > 0 ? "border-pink-500/40 text-pink-400" : "border-[var(--border)] text-gray-500"}`}>
          💬
          {unread > 0 && <span className="absolute top-[4px] right-[4px] w-2 h-2 bg-pink-500 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />}
        </button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)}
            className="h-[44px] w-[44px] rounded-[10px] border flex items-center justify-center text-gray-500 hover:text-white transition-all"
            style={{ borderColor: menuOpen ? "var(--border2)" : "var(--border)", background: menuOpen ? "var(--card2)" : "transparent" }}>
            <span className="text-[18px] leading-none">···</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-[46px] rounded-[14px] border overflow-hidden shadow-2xl z-[200]" style={{ background: "var(--card)", borderColor: "var(--border)", minWidth: 220 }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-gray-600 mb-0.5">Signed in as</div>
                <div className="font-semibold text-[14px]">{userName}</div>
                <div className="font-mono text-[11px] text-gray-500 mt-0.5">{role === "emcee" ? "🎙 Emcee / DJ" : "🎭 Backstage"}</div>
              </div>
              <Item icon="🎪" label={activeEvent ? activeEvent.name : "Switch Event"} onClick={onShowEvents} />
              {role !== "backstage" && <Item icon="⛶" label="Full-Screen Mode" onClick={onFullscreen} />}
              <div className="border-t" style={{ borderColor: "var(--border)" }} />
              <Item icon="🗑" label="Reset Competition" onClick={onReset} danger />
              <Item icon="👋" label="Leave Session" onClick={onSignOut} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
