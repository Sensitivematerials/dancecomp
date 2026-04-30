"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode,     setMode]     = useState<"signin" | "signup">("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<"emcee" | "backstage">("backstage");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    const err = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, role);

    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--black)" }}>

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="font-display text-[42px] tracking-[4px] mb-2">
          Dance<span className="text-pink-500">Comp</span>
        </div>
        <div className="font-mono text-[11px] tracking-[3px] uppercase text-gray-600">
          Cue Board
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-[18px] border p-7"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>

        {/* Mode toggle */}
        <div className="flex rounded-[10px] p-1 gap-1 mb-6 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {(["signin", "signup"] as const).map(m => (
            <button key={m}
              className={`flex-1 h-9 rounded-[7px] text-[13px] font-medium transition-all
                ${mode === m ? "text-white" : "text-gray-500"}`}
              style={mode === m ? { background: "var(--border2)" } : {}}
              onClick={() => setMode(m)}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Role selector — only on signup */}
          {mode === "signup" && (
            <div className="flex gap-2 mb-1">
              {(["emcee", "backstage"] as const).map(r => (
                <button key={r} type="button"
                  className={`flex-1 h-11 rounded-[8px] border text-[13px] font-semibold transition-all
                    ${role === r
                      ? r === "emcee"
                        ? "border-blue-400/30 bg-blue-400/10 text-blue-400"
                        : "border-emerald-400/25 bg-emerald-400/10 text-emerald-400"
                      : "border-[var(--border2)] text-gray-500"
                    }`}
                  onClick={() => setRole(r)}
                >
                  {r === "emcee" ? "🎙 Emcee" : "🎭 Backstage"}
                </button>
              ))}
            </div>
          )}

          <input
            type="email" required placeholder="Email address"
            className="h-[52px] rounded-[8px] border px-4 text-[15px] outline-none placeholder-gray-600"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password" required placeholder="Password"
            className="h-[52px] rounded-[8px] border px-4 text-[15px] outline-none placeholder-gray-600"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            value={password} onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <div className="text-[13px] text-red-400 px-1">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="h-[52px] rounded-[8px] font-semibold text-[15px] mt-1 transition-all disabled:opacity-40"
            style={{ background: "var(--pink)", color: "white" }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[12px] text-gray-600 mt-5 leading-relaxed">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button className="text-pink-400 underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
