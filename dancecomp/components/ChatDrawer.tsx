"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";

interface Props { chat: ReturnType<typeof useChat>; }

export default function ChatDrawer({ chat }: Props) {
  const { messages, open, closeChat, sendMessage } = chat;
  const [sender, setSender] = useState<"emcee" | "backstage">("emcee");
  const [draft,  setDraft]  = useState("");
  const listRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function handleSend() {
    const text = draft.trim(); if (!text) return;
    await sendMessage(sender, text); setDraft("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 w-80 flex flex-col border-l z-40 transition-transform duration-300`}
      style={{
        background: "var(--surface)", borderColor: "var(--border)",
        transform: open ? "translateX(0)" : "translateX(100%)",
      }}
    >
      {/* Header */}
      <div className="h-[52px] px-4 flex items-center justify-between border-b flex-shrink-0"
        style={{ borderColor: "var(--border)" }}>
        <span className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-500">Chat</span>
        <button className="w-8 h-8 rounded-[6px] border flex items-center justify-center text-gray-500 hover:text-white transition-all"
          style={{ borderColor: "var(--border)" }} onClick={closeChat}>✕</button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center font-mono text-[11px] text-gray-600 text-center leading-relaxed p-5">
            No messages yet.<br />Send a note to the other side.
          </div>
        ) : messages.map(m => (
          <div key={m.id} className={`flex flex-col gap-1 max-w-[88%] ${m.sender === "emcee" ? "self-end items-end" : "self-start items-start"}`}>
            <span className={`font-mono text-[9px] tracking-[1px] uppercase px-1 ${m.sender === "emcee" ? "text-blue-400" : "text-emerald-400"}`}>
              {m.sender === "emcee" ? "🎙 Emcee" : "🎭 Backstage"}
            </span>
            <div className={`px-3.5 py-2.5 rounded-[12px] border text-[13px] leading-snug break-words
              ${m.sender === "emcee"
                ? "bg-[#1e2a3a] border-blue-400/20 rounded-br-[4px]"
                : "bg-[#1e2a24] border-emerald-400/20 rounded-bl-[4px]"
              }`}>
              {m.text}
            </div>
            <span className="font-mono text-[9px] text-gray-600 px-1">
              {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t p-3 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-1.5 mb-2">
          {(["emcee", "backstage"] as const).map(s => (
            <button key={s}
              className={`flex-1 h-[30px] rounded-full border font-mono text-[10px] tracking-wide transition-all
                ${sender === s && s === "emcee"     ? "border-blue-400/40 bg-blue-400/10 text-blue-400"      :
                  sender === s && s === "backstage" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-400" :
                  "border-[var(--border)] text-gray-600"}`}
              onClick={() => setSender(s)}
            >
              {s === "emcee" ? "🎙 Emcee" : "🎭 Backstage"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} rows={1}
            className="flex-1 min-h-[40px] max-h-[100px] rounded-[10px] border px-3 py-2.5 text-[13px] leading-snug resize-none outline-none bg-[var(--card)] placeholder-gray-600 focus:border-[var(--border2)]"
            style={{ borderColor: "var(--border)" }}
            placeholder="Type a message…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="w-10 h-10 rounded-[10px] border flex items-center justify-center text-gray-500 hover:text-pink-400 hover:border-pink-400/30 transition-all flex-shrink-0"
            style={{ borderColor: "var(--border2)", background: "var(--card2)" }}
            onClick={handleSend} aria-label="Send">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
