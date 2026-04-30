"use client";
import { useState } from "react";

interface Props {
  onEnter: (name: string, role: "emcee" | "backstage") => void;
}

export default function LoginScreen({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"emcee" | "backstage" | null>(null);
  const [error, setError] = useState("");

  function handleEnter() {
    if (!name.trim()) { setError("Enter your name to continue"); return; }
    if (!role)         { setError("Pick a role to continue"); return; }
    onEnter(name.trim(), role);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleEnter();
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--black)" }}>
      <div className="mb-12 text-center">
        <div className="font-display text-[48px] tracking-[5px] mb-2">
          Dance<span className="text-pink-500">Comp</span>
        </div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Cue Board</div>
      </div>
      <div className="w-full max-w-sm rounded-[20px] border p-8"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="mb-6">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-2.5">Your Name</div>
          <input autoFocus type="text" placeholder="e.g. Winston"
            className="w-full h-[56px] rounded-[10px] border px-4 text-[17px] font-medium outline-none placeholder-gray-700 transition-colors"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKey}
          />
        </div>
        <div className="mb-6">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 

cat > components/LoginScreen.tsx << 'ENDOFFILE'
"use client";
import { useState } from "react";

interface Props {
  onEnter: (name: string, role: "emcee" | "backstage") => void;
}

export default function LoginScreen({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"emcee" | "backstage" | null>(null);
  const [error, setError] = useState("");

  function handleEnter() {
    if (!name.trim()) { setError("Enter your name to continue"); return; }
    if (!role)         { setError("Pick a role to continue"); return; }
    onEnter(name.trim(), role);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleEnter();
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--black)" }}>
      <div className="mb-12 text-center">
        <div className="font-display text-[48px] tracking-[5px] mb-2">
          Dance<span className="text-pink-500">Comp</span>
        </div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">Cue Board</div>
      </div>
      <div className="w-full max-w-sm rounded-[20px] border p-8"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="mb-6">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-2.5">Your Name</div>
          <input autoFocus type="text" placeholder="e.g. Winston"
            className="w-full h-[56px] rounded-[10px] border px-4 text-[17px] font-medium outline-none placeholder-gray-700 transition-colors"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKey}
          />
        </div>
        <div className="mb-6">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 mb-2.5">I am the...</div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setRole("emcee"); setError(""); }}
              className={`h-[80px] rounded-[12px] border flex flex-col items-center justify-center gap-2 transition-all
                ${role === "emcee" ? "border-blue-400/40 bg-blue-400/10" : "border-[var(--border)] hover:border-[var(--border2)]"}`}>
              <span className="text-[28px]">🎙</span>
              <span className={`font-semibold text-[14px] ${role === "emcee" ? "text-blue-400" : "text-gray-400"}`}>Emcee / DJ</span>
            </button>
            <button onClick={() => { setRole("backstage"); setError(""); }}
              className={`h-[80px] rounded-[12px] border flex flex-col items-center justify-center gap-2 transition-all
                ${role === "backstage" ? "border-emerald-400/30 bg-emerald-400/10" : "border-[var(--border)] hover:border-[var(--border2)]"}`}>
              <span className="text-[28px]">🎭</span>
              <span className={`font-semibold text-[14px] ${role === "backstage" ? "text-emerald-400" : "text-gray-400"}`}>Backstage</span>
            </button>
          </div>
        </div>
        {error && <div className="text-[13px] text-red-400 mb-4 text-center">{error}</div>}
        <button onClick={handleEnter}
          className="w-full h-[54px] rounded-[10px] font-bold text-[16px] transition-all active:scale-[0.98]"
          style={{
            background: role === "emcee" ? "var(--blue)" : role === "backstage" ? "var(--green)" : "var(--border2)",
            color: role ? "var(--black)" : "var(--dim)",
          }}>
          {role === "emcee" ? "🎙 Enter as Emcee" : role === "backstage" ? "🎭 Enter as Backstage" : "Enter"}
        </button>
      </div>
      <div className="mt-6 font-mono text-[11px] text-gray-700 text-center">No password needed · Just your name and role</div>
    </div>
  );
}
