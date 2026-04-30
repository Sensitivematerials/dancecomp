"use client";
import { useState } from "react";
import { Event } from "@/hooks/useEvents";
interface Props { events: Event[]; loading: boolean; userName: string; role: "emcee" | "backstage"; onJoin: (event: Event) => void; onCreate: (name: string, date: string, location: string) => Promise<void>; }
export default function Lobby({ events, loading, userName, role, onJoin, onCreate }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    setSaving(true); await onCreate(name.trim(), date.trim(), location.trim());
    setSaving(false); setCreating(false); setName(""); setDate(""); setLocation("");
  }
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--black)" }}>
      <div className="flex items-center justify-between px-5 h-[56px] border-b flex-shrink-0" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="font-display text-[22px] tracking-[3px]">Dance<span className="text-pink-500">Comp</span></div>
        <div className="font-mono text-[10px] tracking-[1px] uppercase text-gray-600">{role === "emcee" ? "🎙" : "🎭"} {userName}</div>
      </div>
      <div className="flex-1 flex flex-col items-center px-4 pt-10 pb-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="text-[28px] mb-1">👋</div>
            <h1 className="text-[22px] font-bold mb-1">Hey {userName}</h1>
            <p className="text-[14px] text-gray-500">{role === "emcee" ? "🎙 Emcee / DJ" : "🎭 Backstage Manager"} · Join or start a show</p>
          </div>
          <div className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-600 mb-3">Active Shows</div>
          {loading ? (
            <div className="font-mono text-[12px] text-gray-600 text-center py-8">Loading shows...</div>
          ) : events.length === 0 ? (
            <div className="border border-dashed rounded-[14px] py-10 px-6 text-center mb-4" style={{ borderColor: "var(--border)" }}>
              <div className="text-[32px] mb-3">🎭</div>
              <div className="font-semibold text-[15px] mb-1">No active shows</div>
              <div className="text-[13px] text-gray-500">Create one to get started</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {events.map(ev => (
                <button key={ev.id} onClick={() => onJoin(ev)}
                  className="w-full rounded-[14px] border p-4 text-left transition-all active:scale-[0.98] group"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[16px] truncate group-hover:text-pink-400 transition-colors">{ev.name}</div>
                      <div className="text-[12px] text-gray-500 mt-1">{ev.date}{ev.location ? ` · ${ev.location}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-[11px] text-emerald-400">LIVE</span>
                      <span className="text-gray-600 text-[16px]">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!creating ? (
            <button onClick={() => setCreating(true)} className="w-full h-[52px] rounded-[12px] border font-semibold text-[14px] transition-all active:scale-[0.98]" style={{ borderColor: "var(--border2)", background: "var(--card)", color: "var(--text)" }}>+ Create New Show</button>
          ) : (
            <form onSubmit={handleCreate} className="rounded-[16px] border p-5" style={{ background: "var(--card)", borderColor: "var(--border2)" }}>
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-500 mb-4">New Show</div>
              <div className="flex flex-col gap-3 mb-4">
                <input autoFocus required placeholder="Show name (e.g. Spring Showcase 2025)" className="h-[50px] rounded-[10px] border px-4 text-[15px] outline-none placeholder-gray-600" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} value={name} onChange={e => setName(e.target.value)} />
                <input required placeholder="Date (e.g. May 3, 2025)" className="h-[50px] rounded-[10px] border px-4 text-[15px] outline-none placeholder-gray-600" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} value={date} onChange={e => setDate(e.target.value)} />
                <input placeholder="Venue / city (optional)" className="h-[50px] rounded-[10px] border px-4 text-[15px] outline-none placeholder-gray-600" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="flex gap-2.5">
                <button type="submit" disabled={saving || !name.trim()} className="flex-1 h-[50px] rounded-[10px] font-bold text-[15px] disabled:opacity-30 text-black" style={{ background: "var(--green)" }}>{saving ? "Creating..." : "Create Show"}</button>
                <button type="button" onClick={() => { setCreating(false); setName(""); setDate(""); setLocation(""); }} className="h-[50px] px-5 rounded-[10px] border text-[14px] text-gray-500" style={{ borderColor: "var(--border2)" }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
