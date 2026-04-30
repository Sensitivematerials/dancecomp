"use client";
import { useState } from "react";
import Header from "@/components/Header";
import EmceeView from "@/components/EmceeView";
import BackstageView from "@/components/BackstageView";
import ImportView from "@/components/ImportView";
import ChatDrawer from "@/components/ChatDrawer";
import LoginScreen from "@/components/LoginScreen";
import FullscreenMode from "@/components/FullscreenMode";
import { useRoutines } from "@/hooks/useRoutines";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
export type ViewTab = "emcee" | "backstage" | "import";
export default function Home() {
  const { user, role, loading: authLoading, signIn, signOut } = useAuth();
  const { activeEvent, events, createEvent, switchEvent } = useEvents();
  const eventSlug = activeEvent?.slug ?? "demo-event";
  const routines = useRoutines(eventSlug);
  const chat = useChat(eventSlug);
  const [view, setView] = useState<ViewTab>("emcee");
  const [fullscreen, setFullscreen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  function handleEnter(name: string, role: "emcee" | "backstage") {
    signIn(name, role);
    setView(role === "emcee" ? "emcee" : "backstage");
  }
  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen onEnter={handleEnter} />;
  if (fullscreen) return <FullscreenMode routines={routines.routines} onExit={() => setFullscreen(false)} />;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header view={view} setView={setView} role={role} userName={user.name}
        unread={chat.unread} chatOpen={chat.open}
        onToggleChat={chat.open ? chat.closeChat : chat.openChat}
        onFullscreen={() => setFullscreen(true)} onSignOut={signOut} onReset={() => setShowReset(true)}
        activeEvent={activeEvent} onShowEvents={() => setShowEvents(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-7 transition-all duration-300"
          style={{ marginRight: chat.open ? "320px" : "0" }}>
          <div className="max-w-2xl mx-auto w-full">
            {view === "emcee" && <EmceeView {...routines} onFullscreen={() => setFullscreen(true)} />}
            {view === "backstage" && <BackstageView {...routines} />}
            {view === "import" && <ImportView onImport={async (rows) => { await routines.clearAll(); await routines.bulkInsert(rows as any); setView("backstage"); }} />}
          </div>
        </main>
        <ChatDrawer chat={chat} />
      </div>
      {showEvents && <EventsModal events={events} activeEvent={activeEvent} onSwitch={(e: any) => { switchEvent(e); setShowEvents(false); }} onCreate={createEvent} onClose={() => setShowEvents(false)} />}
    </div>
  );
}
function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--black)" }}>
      <div className="text-center">
        <div className="font-display text-[36px] tracking-[4px] mb-3">Dance<span className="text-pink-500">Comp</span></div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Loading…</div>
      </div>
    </div>
  );
}
function EventsModal({ events, activeEvent, onSwitch, onCreate, onClose }: any) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    await onCreate(name, date, location);
    setLoading(false); onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-[18px] border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }} onClick={(e: any) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-500">Events</div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-[18px]">✕</button>
        </div>
        <div className="flex flex-col gap-2 mb-4 max-h-56 overflow-y-auto">
          {events.length === 0 && <div className="font-mono text-[12px] text-gray-600 text-center py-4">No events yet</div>}
          {events.map((ev: any) => (
            <button key={ev.id} className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border text-left transition-all ${activeEvent?.id === ev.id ? "border-pink-400/30 bg-pink-400/10" : "border-[var(--border)] hover:border-[var(--border2)]"}`} onClick={() => onSwitch(ev)}>
              <div className="flex-1">
                <div className={`font-semibold text-[14px] ${activeEvent?.id === ev.id ? "text-pink-400" : "text-white"}`}>{ev.name}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{ev.date} · {ev.location}</div>
              </div>
              {activeEvent?.id === ev.id && <span className="text-pink-400 text-[12px]">✓ Active</span>}
            </button>
          ))}
        </div>
        {!creating ? (
          <button className="w-full h-11 rounded-[8px] border border-dashed text-[13px] font-medium text-gray-500 hover:text-white transition-all" style={{ borderColor: "var(--border)" }} onClick={() => setCreating(true)}>+ New Event</button>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-1">New Event</div>
            {[{k:"name",v:name,s:setName,p:"Event name"},{k:"date",v:date,s:setDate,p:"Date"},{k:"location",v:location,s:setLocation,p:"Venue"}].map(({k,v,s,p}) => (
              <input key={k} required placeholder={p} value={v} onChange={e => s(e.target.value)} className="h-[46px] rounded-[8px] border px-3.5 text-[14px] outline-none placeholder-gray-600" style={{ background:"var(--surface)", borderColor:"var(--border)", color:"var(--text)" }} />
            ))}
            <div className="flex gap-2 mt-1">
              <button type="submit" disabled={loading} className="flex-1 h-11 rounded-[8px] font-semibold text-[13px] disabled:opacity-40 text-black" style={{ background:"var(--green)" }}>{loading ? "Creating…" : "Create Event"}</button>
              <button type="button" className="h-11 px-4 rounded-[8px] border text-[13px] text-gray-500" style={{ borderColor:"var(--border)" }} onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
