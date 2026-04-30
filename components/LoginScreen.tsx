"use client";
import { useState } from "react";
interface Props { onEnter: (name: string, role: "emcee" | "backstage") => void; }
export default function LoginScreen({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"emcee" | "backstage" | null>(null);
  const [error, setError] = useState("");
  function go() {
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!role) { setError("Pick a role"); return; }
    onEnter(name.trim(), role);
  }
  return (
    <div style={{ background:"var(--black)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, letterSpacing:6, color:"var(--text)" }}>
          Dance<span style={{ color:"#f05aa8" }}>Comp</span>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"var(--dim)", marginTop:4 }}>Cue Board</div>
      </div>
      <div style={{ width:"100%", maxWidth:360, background:"var(--card)", border:"1.5px solid var(--border)", borderRadius:20, padding:32 }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"var(--muted)", marginBottom:10 }}>Your Name</div>
        <input autoFocus type="text" placeholder="e.g. Winston"
          style={{ width:"100%", height:56, borderRadius:10, border:"1.5px solid var(--border)", background:"var(--surface)", color:"var(--text)", fontSize:17, fontWeight:600, padding:"0 16px", outline:"none", marginBottom:24, boxSizing:"border-box" }}
          value={name} onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && go()}
        />
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"var(--muted)", marginBottom:10 }}>I am the...</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
          {([["emcee","🎙","Emcee / DJ","#5b9fff","rgba(91,159,255,0.1)","rgba(91,159,255,0.3)"],["backstage","🎭","Backstage","#20d49c","rgba(32,212,156,0.09)","rgba(32,212,156,0.26)"]] as const).map(([r,icon,label,color,bg,border]) => (
            <button key={r} onClick={() => { setRole(r as any); setError(""); }}
              style={{ height:80, borderRadius:12, border:`1.5px solid ${role===r ? border : "var(--border)"}`, background: role===r ? bg : "transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer" }}>
              <span style={{ fontSize:28 }}>{icon}</span>
              <span style={{ fontSize:14, fontWeight:600, color: role===r ? color : "var(--muted)" }}>{label}</span>
            </button>
          ))}
        </div>
        {error && <div style={{ color:"#ff5258", fontSize:13, textAlign:"center", marginBottom:12 }}>{error}</div>}
        <button onClick={go}
          style={{ width:"100%", height:54, borderRadius:10, border:"none", fontWeight:700, fontSize:16, cursor:"pointer", background: role==="emcee" ? "#5b9fff" : role==="backstage" ? "#20d49c" : "var(--border2)", color: role ? "var(--black)" : "var(--dim)" }}>
          {role === "emcee" ? "🎙 Enter as Emcee" : role === "backstage" ? "🎭 Enter as Backstage" : "Enter"}
        </button>
      </div>
      <div style={{ marginTop:24, fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--dim)" }}>No password needed · Just your name and role</div>
    </div>
  );
}
