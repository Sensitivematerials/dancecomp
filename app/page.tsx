"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EmceeView from "@/components/EmceeView";
import BackstageView from "@/components/BackstageView";
import ImportView from "@/components/ImportView";
import ChatDrawer from "@/components/ChatDrawer";
import LoginScreen from "@/components/LoginScreen";
import FullscreenMode from "@/components/FullscreenMode";
import ResetModal from "@/components/ResetModal";
import StageView from "@/components/StageView";
import { useRoutines } from "@/hooks/useRoutines";
import { useBreak } from "@/hooks/useBreak";
import BreakBanner from "@/components/BreakBanner";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, Event } from "@/hooks/useEvents";

export type ViewTab = "emcee" | "backstage" | "import";

const STAFF_PASSWORD = "nexttostage2026";

type AppMode = "landing" | "audience-select" | "staff-gate" | "staff";

export default function Home() {
  const router = useRouter();
  const [appMode, setAppMode] = useState<AppMode>("landing");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { user, role, loading: authLoading, signIn, signOut } = useAuth();
  const { events, loading: eventsLoading, createEvent, deleteEvent } = useEvents();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const eventSlug = activeEvent?.slug ?? "demo-event";
  const routines = useRoutines(eventSlug, role);
  const isOnline = routines.isOnline;
  const breakState = useBreak(eventSlug);
  const chat = useChat(eventSlug);
  const [view, setView] = useState<ViewTab>("emcee");
  const [fullscreen, setFullscreen] = useState(false);
  const [showReset, setShowReset] = useState(false);

  function handleEnter(name: string, r: "emcee" | "backstage" | "stage", ev: Event) {
    signIn(name, r);
    setActiveEvent(ev);
    setView(r === "emcee" ? "emcee" : "backstage");
  }

  async function handleReset() {
    await routines.clearAll();
    await chat.clearMessages();
    if (activeEvent) await deleteEvent(activeEvent.id);
    setActiveEvent(null);
    signOut();
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === STAFF_PASSWORD) {
      setPasswordError("");
      setAppMode("staff");
    } else {
      setPasswordError("Incorrect password");
      setPasswordInput("");
    }
  }

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (appMode === "landing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--black)" }}>
        <div className="mb-14 text-center">
          <div className="font-display text-[64px] tracking-[6px] mb-2">
            NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
          </div>
          <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">
            Live Competition Management
          </div>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={() => setAppMode("audience-select")}
            className="w-full rounded-[18px] border p-7 text-left transition-all"
            style={{ background: "rgba(167,139,250,0.07)", borderColor: "rgba(167,139,250,0.28)" }}
          >
            <div className="text-[32px] mb-3">👥</div>
            <div className="font-bold text-[21px] mb-1" style={{ color: "#a78bfa" }}>Audience View</div>
            <div className="text-[13px] text-gray-500">Watch the show live — no password needed</div>
          </button>
          <button
            onClick={() => setAppMode("staff-gate")}
            className="w-full rounded-[18px] border p-7 text-left transition-all"
            style={{ background: "rgba(240,90,168,0.07)", borderColor: "rgba(240,90,168,0.28)" }}
          >
            <div className="text-[32px] mb-3">🎭</div>
            <div className="font-bold text-[21px] mb-1" style={{ color: "#f05aa8" }}>Show Staff</div>
            <div className="text-[13px] text-gray-500">Emcee, backstage, and stage manager access</div>
          </button>
        </div>
      </div>
    );
  }

  // ── AUDIENCE SHOW SELECT ──────────────────────────────────────────────────
  if (appMode === "audience-select") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "var(--black)" }}>
        <div className="mb-8 text-center">
          <div className="font-display text-[42px] tracking-[5px] mb-1">
            NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
          </div>
          <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Select a Show</div>
        </div>
        <div className="w-full max-w-sm">
          <button
            onClick={() => setAppMode("landing")}
            className="font-mono text-[11px] text-gray-500 hover:text-white mb-5 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <div className="flex flex-col gap-3">
            {eventsLoading ? (
              <div className="font-mono text-[12px] text-gray-600 text-center py-8">Loading shows...</div>
            ) : events.length === 0 ? (
              <div className="border border-dashed rounded-[14px] py-10 text-center" style={{ borderColor: "var(--border)" }}>
                <div className="text-[32px] mb-3">🎭</div>
                <div className="text-[15px] font-semibold mb-1">No active shows</div>
                <div className="text-[12px] text-gray-500">Check back when a show is live</div>
              </div>
            ) : events.map(ev => (
              <button
                key={ev.id}
                onClick={() => router.push(`/audience/${ev.slug}`)}
                className="w-full rounded-[14px] border p-4 text-left transition-all"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-[16px] truncate mb-0.5">{ev.name}</div>
                    <div className="text-[12px] text-gray-500">{ev.date}{ev.location ? ` · ${ev.location}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px] text-emerald-400">LIVE</span>
                    <span className="text-gray-600 ml-1 text-[16px]">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── STAFF GATE ────────────────────────────────────────────────────────────
  if (appMode === "staff-gate") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--black)" }}>
        <div className="mb-10 text-center">
          <div className="font-display text-[48px] tracking-[5px] mb-1">
            NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
          </div>
          <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Staff Access</div>
        </div>
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setAppMode("landing"); setPasswordInput(""); setPasswordError(""); }}
            className="font-mono text-[11px] text-gray-500 hover:text-white mb-5 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-[20px] border p-7"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="text-[32px] text-center mb-5">🔐</div>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-2.5">Staff Password</div>
            <input
              autoFocus
              type="password"
              placeholder="Enter password"
              className="w-full h-[54px] rounded-[10px] border px-4 text-[17px] font-medium outline-none placeholder-gray-700 mb-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "#eeeef5" }}
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
            />
            {passwordError && (
              <div className="text-[13px] text-red-400 mb-3 text-center">{passwordError}</div>
            )}
            <button
              type="submit"
              className="w-full h-[52px] rounded-[10px] font-bold text-[15px] text-white transition-all"
              style={{ background: "#f05aa8" }}
            >
              Enter →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── STAFF MODE ────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--black)" }}>
      <div className="text-center">
        <div className="font-display text-[36px] tracking-[4px] mb-3">
          NextTo<span className="text-pink-500">Stage</span>
        </div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Loading...</div>
      </div>
    </div>
  );

  if (!user || !activeEvent) return (
    <LoginScreen events={events} eventsLoading={eventsLoading} onEnter={handleEnter} onCreate={createEvent} onDelete={deleteEvent} />
  );

  if (role === "stage") return (
    <StageView routines={routines.routines} eventName={activeEvent?.name} activeBreak={breakState.activeBreak} onLeave={() => { signOut(); setActiveEvent(null); }} />
  );

  if (fullscreen) return (
    <FullscreenMode routines={routines.routines} onExit={() => setFullscreen(false)} onMarkCompleted={routines.markCompleted} onSetOnStage={routines.setOnStage} onRemoveFromStage={routines.removeFromStage} />
  );

  return (
    <div>
      {breakState.activeBreak && (
        <BreakBanner activeBreak={breakState.activeBreak} onEnd={breakState.endBreak} isEmcee={role === "emcee"} />
      )}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 font-mono text-[12px] font-bold text-black" style={{ background: "#f59e0b" }}>
          ⚠ OFFLINE — changes will sync when reconnected
        </div>
      )}
      <div className={`${!isOnline && breakState.activeBreak ? "pt-28" : !isOnline || breakState.activeBreak ? "pt-14" : ""} h-screen flex flex-col overflow-hidden`}>
        <Header view={view} setView={setView} role={role} userName={user.name}
          unread={chat.unread} chatOpen={chat.open}
          onToggleChat={chat.open ? chat.closeChat : chat.openChat}
          onFullscreen={() => setFullscreen(true)}
          onSignOut={() => { signOut(); setActiveEvent(null); }}
          onReset={() => setShowReset(true)} onReport={() => window.open(`/report?event=${activeEvent?.slug}`, "_blank")}
          activeEvent={activeEvent}
          onShowEvents={() => setActiveEvent(null)} />
        <div className="flex flex-1 overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-4 md:p-7 transition-all duration-300" style={{ marginRight: chat.open ? "320px" : "0" }}>
            <div className="max-w-2xl mx-auto w-full">
              {view === "emcee" && <EmceeView {...routines} onFullscreen={() => setFullscreen(true)} breakState={breakState} />}
              {view === "backstage" && <BackstageView {...routines} />}
              {view === "import" && <ImportView onImport={async (rows) => { await routines.clearAll(); await routines.bulkInsert(rows as any); setView("backstage"); }} onReset={() => setShowReset(true)} />}
            </div>
          </main>
          <ChatDrawer chat={chat} />
        </div>
        {showReset && <ResetModal onConfirm={handleReset} onClose={() => setShowReset(false)} eventName={activeEvent?.name} />}
      </div>
    </div>
  );
}
