"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Routine } from "@/types";

export default function ReportPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("event");
    if (!slug) { setLoading(false); return; }
    async function load() {
      const { data: ev } = await supabase.from("events").select("*").eq("slug", slug).single();
      if (ev) { setEventName(ev.name); setEventDate(ev.date ?? ""); }
      const { data: rs } = await supabase.from("routines").select("*").eq("event_slug", slug).order("sort_order", { ascending: true, nullsFirst: false });
      setRoutines(rs ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const total = routines.length;
  const completed = routines.filter(r => r.completed).length;
  const scratched = routines.filter(r => r.scratched).length;
  const noShow = routines.filter(r => !r.checked_in && !r.scratched && !r.completed).length;
  const checkedIn = routines.filter(r => r.checked_in && !r.completed && !r.scratched).length;

  function getStatusLabel(r: Routine) {
    if (r.scratched) return { label: "Scratched", color: "#ef4444" };
    if (r.completed) return { label: "Completed", color: "#22c55e" };
    if (r.on_stage)  return { label: "On Stage",  color: "#eab308" };
    if (r.ready)     return { label: "Ready",     color: "#10b981" };
    if (r.checked_in)return { label: "Checked In",color: "#f59e0b" };
    return { label: "No Show", color: "#6b7280" };
  }

  if (loading) return (
    <div style={{ fontFamily: "monospace", padding: 40, color: "#888" }}>Loading report...</div>
  );

  if (!eventName) return (
    <div style={{ fontFamily: "monospace", padding: 40, color: "#888" }}>No event specified. Add ?event=SLUG to the URL.</div>
  );

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 800, margin: "0 auto", padding: "40px 32px", color: "#111", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        @page { margin: 2cm; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "3px solid #111", paddingBottom: 20, marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#888", marginBottom: 8, fontFamily: "monospace" }}>NextToStage — Show Report</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -1 }}>{eventName}</h1>
        {eventDate && <div style={{ fontSize: 14, color: "#555", marginTop: 6 }}>{eventDate}</div>}
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 4, fontFamily: "monospace" }}>Generated {new Date().toLocaleString()}</div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Total", value: total, color: "#111" },
          { label: "Completed", value: completed, color: "#16a34a" },
          { label: "Checked In", value: checkedIn, color: "#d97706" },
          { label: "Scratched", value: scratched, color: "#dc2626" },
          { label: "No Show", value: noShow, color: "#6b7280" },
        ].map(s => (
          <div key={s.label} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#888", fontFamily: "monospace", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Routine table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #111" }}>
            {["#", "Title", "Studio", "Division", "Props", "Status"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace", color: "#555" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {routines.map((r, i) => {
            const { label, color } = getStatusLabel(r);
            return (
              <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fafafa" : "#fff", opacity: r.scratched ? 0.5 : 1 }}>
                <td style={{ padding: "9px 10px", fontFamily: "monospace", fontWeight: 700, fontSize: 15 }}>{r.number}</td>
                <td style={{ padding: "9px 10px", fontWeight: 600, textDecoration: r.scratched ? "line-through" : "none" }}>{r.title}</td>
                <td style={{ padding: "9px 10px", color: "#555" }}>{r.studio}</td>
                <td style={{ padding: "9px 10px", color: "#555" }}>{r.division}</td>
                <td style={{ padding: "9px 10px", textAlign: "center" }}>{r.has_prop ? "🎬" : ""}</td>
                <td style={{ padding: "9px 10px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace", letterSpacing: 0.5 }}>{label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #e5e7eb", fontSize: 11, color: "#aaa", fontFamily: "monospace", display: "flex", justifyContent: "space-between" }}>
        <span>nexttostage.com</span>
        <span>{total} routines · {completed} completed · {scratched} scratched</span>
      </div>

      {/* Print button */}
      <div className="no-print" style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <button onClick={() => window.print()}
          style={{ padding: "12px 28px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          ⬇ Save as PDF
        </button>
        <button onClick={() => window.close()}
          style={{ padding: "12px 20px", background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
          Close
        </button>
      </div>
    </div>
  );
}
