"use client";
import { useState } from "react";
import { Event } from "@/hooks/useEvents";
interface Props { events: Event[]; eventsLoading: boolean; onEnter: (name: string, role: "emcee" | "backstage", event: Event) => void; onCreate: (name: string, date: string, location: string) => Promise<Event | null>; }
export default function LoginScreen({ events, eventsLoading, onEnter, onCreate }: Props) {
  const [step, setStep] = useState<"identity" | "show">("identity");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"emcee" | "backstage" | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showName, setShowName] = useState("");
  const [showDate, setShowDate] = useState("");
  const [showVenue, setShowVenue] = useState("");
  const [saving, setSaving] = useState(false);
  function handleNext() {
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!role) { setError("Pick a role"); return; }
    setError(""); setStep("show");
  }
  async function handleCreateShow(e: React.FormEvent) {
    e.preventDefault(); if (!showName.trim()) return;
    setSaving(true);
    const ev = await onCreate(showName.trim(), showDate.trim(), showVenue.trim());
    setSaving(false);
    if (ev) onEnter(name, role!, ev);
  }
  const inp = { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "var(--black)" }}>
      <div className="mb-10 text-center">
        <div className="font-display text-[48px] tracking-[5px] mb-1">Dance<span className="text-pink-500">Comp</span></div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Cue Board</div>
      </div>
      <div className="w-full max-w-sm">
        {step === "identity" && (
          <div className="rounded-[20px] border p-7" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-5">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-2.5">Your Name</div>
              <input autoFocus type="text" placeholder="e.g. Winston"
                className="w-full h-[54px] rounded-[10px] border px-4 text-[17px] font-medium outline-none placeholder-gray-700"
                style={inp} value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleNext()} />
            </div>
            <div className="mb-5">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-2.5">I am the...</div>
              <div className="grid grid-cols-2 gap-3">
                {([["emcee","🎙","Emcee / DJ","#5b9fff","rgba(91,159,255,0.10)","rgba(91,159,255,0.30)"],["backstage","🎭","Backstage","#20d49c","rgba(32,212,156,0.09)","rgba(32,212,156,0.26)"]] as const).map(([r,icon,label,color,bg,border]) => (
                  <button key={r} onClick={() => { setRole(r as any); setError(""); }}
                    className="h-[78px] rounded-[12px] border flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    style={{ borderColor: role===r ? border : "var(--border)", background: role===r ? bg : "transparent" }}>
                    <span className="text-[26px]">{icon}</span>
                    <span className="text-[13px] font-semibold" style={{ color: role===r ? color : "var(--muted)" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="text-[13px] text-red-400 mb-3 text-center">{error}</div>}
            <button onClick={handleNext}
              className="w-full h-[52px] rounded-[10px] font-bold text-[15px] transition-all active:scale-[0.97]"
              style={{ background: role==="emcee" ? "#5b9fff" : role==="backstage" ? "#20d49c" : "var(--border2)", color: role ? "var(--black)" : "var(--dim)" }}>
              Next →
            </button>
          </div>
        )}
        {step === "show" && (
          <div>
            <button onClick={() => { setStep("identity"); setCreating(false); }}
              className="flex items-center gap-2 font-mono text-[11px] text-gray-500 hover:text-white transition-colors mb-5">
              ← Back
            </button>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-3">{creating ? "Create New Show" : "Join a Show"}</div>
            {!creating ? (
              <>
                <div className="flex flex-col gap-2.5 mb-4">
                  {eventsLoading ? (
                    <div className="font-mono text-[12px] text-gray-600 text-center py-6">Loading shows...</div>
                  ) : events.length === 0 ? (
                    <div className="border border-dashed rounded-[14px] py-8 text-center" style={{ borderColor: "var(--border)" }}>
                      <div className="text-[28px] mb-2">🎭</div>
                      <div className="text-[14px] font-semibold mb-1">No active shows</div>
                      <div className="text-[12px] text-gray-500">Create one below</div>
                    </div>
                  ) : events.map(ev => (
                    <button key={ev.id} onClick={() => onEnter(name, role!, ev)}
                      className="w-full rounded-[14px] border p-4 text-left transition-all active:scale-[0.97] group"
                      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[15px] truncate group-hover:text-pink-400 transition-colors">{ev.name}</div>
                          <div className="text-[12px] text-gray-500 mt-0.5">{ev.date}{ev.location ? ` · ${ev.location}` : ""}</div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono text-[10px] text-emerald-400">LIVE</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setCreating(true)}
                  className="w-full h-[52px] rounded-[12px] border font-bold text-[14px] transition-all active:scale-[0.97]"
                  style={{ background: "rgba(240,90,168,0.12)", borderColor: "rgba(240,90,168,0.40)", color: "#f05aa8" }}>
                  + Create New Show
                </button>
              </>
            ) : (
              <form onSubmit={handleCreateShow} className="rounded-[16px] border p-5" style={{ background: "var(--card)", borderColor: "var(--border2)" }}>
                <div className="flex flex-col gap-3 mb-4">
                  <input autoFocus required placeholder="Show name (e.g. Spring Showcase 2025)" className="h-[50px] rounded-[10px] border px-4 text-[15px] outline-none placeholder-gray-600" style={inp} value={showName} onChange={e => setShowName(e.target.value)} />
                  <input required placeholder="Date (e.g. May 3, 2025)" className="h-[50px] rounded-[10px] border px-4 text-[15px] outline-none placeholder-gray-600" style={inp} value={showDate} onChange={e => setShowDate(e.target.value)} />
                  <input placeholder="Venue / city (optional)" className="h-[50px] rounded-[10px] border px-4 text-[15px] outline-none placeholder-gray-600" style={inp} value={showVenue} onChange={e => setShowVenue(e.target.value)} />
                </div>
                <div className="flex gap-2.5">
                  <button type="submit" disabled={saving || !showName.trim()} className="flex-1 h-[50px] rounded-[10px] font-bold text-[15px] disabled:opacity-30 text-white transition-all" style={{ background: "#f05aa8" }}>{saving ? "Creating..." : "Create Show"}</button>
                  <button type="button" onClick={() => setCreating(false)} className="h-[50px] px-5 rounded-[10px] border text-[14px] text-gray-500" style={{ borderColor: "var(--border2)" }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      <div className="mt-8 font-mono text-[11px] text-gray-700 text-center">No password needed · Just your name and role</div>
    </div>
  );
}
