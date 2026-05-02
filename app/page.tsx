"use client";
import { useState } from "react";
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
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, Event } from "@/hooks/useEvents";
export type ViewTab = "emcee" | "backstage" | "import";
export default function Home() {
  const { user, role, loading: authLoading, signIn, signOut } = useAuth();
  const { events, loading: eventsLoading, createEvent, deleteEvent } = useEvents();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const eventSlug = activeEvent?.slug ?? "demo-event";
  const routines = useRoutines(eventSlug, role);
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

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center" style={{ background:"var(--black)" }}>
      <div className="text-center">
        <div className="font-display text-[36px] tracking-[4px] mb-3">Dance<span className="text-pink-500">Comp</span></div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Loading...</div>
      </div>
    </div>
  );

  if (!user || !activeEvent) return (
    <LoginScreen events={events} eventsLoading={eventsLoading} onEnter={handleEnter} onCreate={createEvent} onDelete={deleteEvent} />
  );

  // Stage Manager — clean read-only view, no header, no controls
  if (role === "stage") return (
    <StageView routines={routines.routines} eventName={activeEvent?.name} onLeave={() => { signOut(); setActiveEvent(null); }} />
  );

  if (fullscreen) return (
    <FullscreenMode routines={routines.routines} onExit={() => setFullscreen(false)} onMarkCompleted={routines.markCompleted} onSetOnStage={routines.setOnStage} onRemoveFromStage={routines.removeFromStage} />
  );

  return (
    <div>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 font-mono text-[12px] font-bold text-black" style={{ background: "#f59e0b" }}>
          ⚠ OFFLINE — changes will sync when reconnected
        </div>
      )}
    <div className={!isOnline ? "pt-8" : ""} className="h-screen flex flex-col overflow-hidden">
      <Header view={view} setView={setView} role={role} userName={user.name}
        unread={chat.unread} chatOpen={chat.open}
        onToggleChat={chat.open ? chat.closeChat : chat.openChat}
        onFullscreen={() => setFullscreen(true)}
        onSignOut={() => { signOut(); setActiveEvent(null); }}
        onReset={() => setShowReset(true)}
        activeEvent={activeEvent}
        onShowEvents={() => setActiveEvent(null)} />
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-7 transition-all duration-300" style={{ marginRight: chat.open ? "320px" : "0" }}>
          <div className="max-w-2xl mx-auto w-full">
            {view === "emcee" && <EmceeView {...routines} onFullscreen={() => setFullscreen(true)} />}
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
