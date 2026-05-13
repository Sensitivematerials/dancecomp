"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import { Routine } from "@/types";

interface BreakRecord {
  id: string;
  event_slug: string;
  type: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
}

interface EventRecord {
  id: string;
  slug: string;
  name: string;
  date: string;
  location: string;
}

const BREAK_EMOJI: Record<string, string> = {
  break: "☕",
  lunch: "🍽️",
  dinner: "🍽️",
};

const BREAK_LABEL: Record<string, string> = {
  break: "Break",
  lunch: "Lunch Break",
  dinner: "Dinner Break",
};

function formatClock(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "NOW";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AudiencePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeBreak, setActiveBreak] = useState<BreakRecord | null>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [pageUrl, setPageUrl] = useState("");

  // Capture current URL for QR code (client-side only)
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial data fetch
  useEffect(() => {
    async function fetchAll() {
      const [evtRes, routinesRes, breakRes] = await Promise.all([
        supabase.from("events").select("*").eq("slug", slug).single(),
        supabase.from("routines").select("*").eq("event_slug", slug).order("sort_order", { ascending: true, nullsFirst: false }),
        supabase.from("breaks").select("*").eq("event_slug", slug).is("ended_at", null).order("created_at", { ascending: false }).limit(1),
      ]);
      if (evtRes.data) setEvent(evtRes.data as EventRecord);
      if (routinesRes.data) setRoutines(routinesRes.data as Routine[]);
      setActiveBreak(breakRes.data?.[0] ?? null);
      setLoading(false);
    }
    fetchAll();
  }, [slug]);

  // Real-time subscriptions
  useEffect(() => {
    const routinesChannel = supabase
      .channel(`audience-routines:${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "routines", filter: `event_slug=eq.${slug}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRoutines(prev =>
              [...prev, payload.new as Routine].sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999))
            );
          }
          if (payload.eventType === "UPDATE") {
            setRoutines(prev =>
              prev
                .map(r => r.id === (payload.new as Routine).id ? payload.new as Routine : r)
                .sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999))
            );
          }
          if (payload.eventType === "DELETE") {
            setRoutines(prev => prev.filter(r => r.id !== (payload.old as Routine).id));
          }
        }
      )
      .subscribe();

    async function refetchBreak() {
      const { data } = await supabase
        .from("breaks").select("*").eq("event_slug", slug).is("ended_at", null)
        .order("created_at", { ascending: false }).limit(1);
      setActiveBreak(data?.[0] ?? null);
    }

    const breaksChannel = supabase
      .channel(`audience-breaks:${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "breaks", filter: `event_slug=eq.${slug}` },
        () => refetchBreak()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(routinesChannel);
      supabase.removeChannel(breaksChannel);
    };
  }, [slug]);

  // Derived display state
  const onStage = routines.find(r => r.on_stage && !r.scratched) ?? null;
  const upNext = routines
    .filter(r => r.ready && !r.on_stage && !r.completed && !r.scratched)
    .slice(0, 2);

  // Break countdown in seconds
  let breakSecondsLeft: number | null = null;
  if (activeBreak) {
    const end = new Date(activeBreak.started_at).getTime() + activeBreak.duration_minutes * 60 * 1000;
    breakSecondsLeft = Math.max(0, Math.floor((end - now.getTime()) / 1000));
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#09090c" }}>
        <div className="font-display text-[40px] tracking-[5px]">
          NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!event) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#09090c" }}>
        <div className="text-center">
          <div className="font-display text-[40px] tracking-[5px] mb-4">
            NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
          </div>
          <div className="font-mono text-[13px] text-gray-600 uppercase tracking-[2px]">Show not found</div>
        </div>
      </div>
    );
  }

  // ── Display ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#09090c", color: "#eeeef5", fontFamily: "inherit" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b" style={{ borderColor: "#26263a" }}>
        <div>
          <div className="font-display text-[24px] tracking-[3px]">
            NextTo<span style={{ color: "#f05aa8" }}>Stage</span>
          </div>
          <div className="font-bold text-[18px] text-gray-200 mt-0.5 leading-tight">{event.name}</div>
        </div>
        <div className="font-mono text-[20px] md:text-[26px] tracking-[2px] tabular-nums" style={{ color: "#6b7280" }}>
          {formatClock(now)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-6 md:gap-10 px-5 md:px-10 py-6 md:py-10 max-w-5xl mx-auto w-full">

        {/* ── Active break ───────────────────────────────────────────────── */}
        {activeBreak && (
          <div
            className="rounded-[24px] border p-8 md:p-12 text-center"
            style={{ background: "rgba(167,139,250,0.07)", borderColor: "rgba(167,139,250,0.30)" }}
          >
            <div className="text-[52px] mb-2">{BREAK_EMOJI[activeBreak.type] ?? "⏸"}</div>
            <div
              className="font-mono text-[11px] tracking-[4px] uppercase mb-2"
              style={{ color: "#a78bfa" }}
            >
              On Break
            </div>
            <div className="font-display text-[44px] md:text-[56px] tracking-[3px] mb-6">
              {BREAK_LABEL[activeBreak.type] ?? "Break"}
            </div>
            {breakSecondsLeft !== null && (
              <div>
                <div className="font-mono text-[11px] tracking-[3px] text-gray-600 uppercase mb-3">
                  Returns in
                </div>
                <div
                  className="font-display text-[80px] md:text-[120px] leading-none tracking-[4px] tabular-nums"
                  style={{ color: breakSecondsLeft <= 60 ? "#f05aa8" : "#20d49c" }}
                >
                  {formatCountdown(breakSecondsLeft)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Now on stage ───────────────────────────────────────────────── */}
        <div>
          <div
            className="font-mono text-[11px] tracking-[4px] uppercase mb-4"
            style={{ color: "#f05aa8" }}
          >
            ▶ Now on Stage
          </div>
          {onStage ? (
            <div
              className="rounded-[24px] border p-8 md:p-12"
              style={{ background: "rgba(240,90,168,0.06)", borderColor: "rgba(240,90,168,0.30)" }}
            >
              <div
                className="font-display leading-none tracking-[2px] mb-4"
                style={{ fontSize: "clamp(72px, 12vw, 120px)", color: "#f05aa8" }}
              >
                {onStage.number}
              </div>
              <div
                className="font-bold mb-3 leading-tight"
                style={{ fontSize: "clamp(24px, 4vw, 40px)" }}
              >
                {onStage.title}
              </div>
              <div className="text-gray-400" style={{ fontSize: "clamp(16px, 2.5vw, 22px)" }}>
                {onStage.studio}
                {onStage.division ? (
                  <span className="text-gray-600"> · {onStage.division}</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              className="rounded-[24px] border p-10 md:p-16 text-center"
              style={{ background: "#111116", borderColor: "#26263a" }}
            >
              <div className="font-mono text-[13px] md:text-[16px] tracking-[4px] uppercase" style={{ color: "#3d3d55" }}>
                Show starting soon...
              </div>
            </div>
          )}
        </div>

        {/* ── Up next ────────────────────────────────────────────────────── */}
        {upNext.length > 0 && (
          <div>
            <div
              className="font-mono text-[11px] tracking-[4px] uppercase mb-4"
              style={{ color: "#a78bfa" }}
            >
              ↑ Up Next
            </div>
            <div className="flex flex-col gap-4">
              {upNext.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-[20px] border flex items-center gap-6 px-7 py-5"
                  style={{
                    background: i === 0 ? "rgba(167,139,250,0.07)" : "rgba(167,139,250,0.03)",
                    borderColor: i === 0 ? "rgba(167,139,250,0.28)" : "#26263a",
                    opacity: i === 0 ? 1 : 0.6,
                  }}
                >
                  <div
                    className="font-display leading-none shrink-0"
                    style={{ fontSize: "clamp(40px, 7vw, 64px)", color: "#a78bfa", minWidth: "70px" }}
                  >
                    {r.number}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="font-bold leading-tight truncate"
                      style={{ fontSize: "clamp(18px, 2.8vw, 26px)" }}
                    >
                      {r.title}
                    </div>
                    <div className="text-gray-500 mt-1" style={{ fontSize: "clamp(13px, 1.8vw, 17px)" }}>
                      {r.studio}
                      {r.division ? <span className="text-gray-600"> · {r.division}</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── QR code — bottom-right corner ──────────────────────────────── */}
      {pageUrl && (
        <div
          className="fixed bottom-4 right-4 flex flex-col items-center gap-1.5 group cursor-default"
          style={{ zIndex: 50 }}
        >
          <div
            className="rounded-[10px] p-2 transition-transform duration-200 group-hover:scale-125"
            style={{ background: "rgba(9,9,12,0.70)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <QRCodeSVG
              value={pageUrl}
              size={80}
              bgColor="transparent"
              fgColor="#eeeef5"
              level="M"
            />
          </div>
          <div
            className="font-mono text-[9px] tracking-[1.5px] uppercase text-center"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            Scan to follow along
          </div>
        </div>
      )}
    </div>
  );
}
