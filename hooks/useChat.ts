"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase, DEFAULT_EVENT } from "@/lib/supabase";
import { ChatMessage } from "@/types";
export function useChat(eventSlug = DEFAULT_EVENT) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("chat_messages").select("*").eq("event_slug", eventSlug).order("created_at", { ascending: true }).limit(100);
      if (data) setMessages(data);
    }
    fetch();
  }, [eventSlug]);
  useEffect(() => {
    const channel = supabase.channel(`chat:${eventSlug}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `event_slug=eq.${eventSlug}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
        if (!open) setUnread(u => u + 1);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages", filter: `event_slug=eq.${eventSlug}` }, () => {
        setMessages([]); setUnread(0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventSlug, open]);
  const sendMessage = useCallback(async (sender: "emcee" | "backstage", text: string) => {
    await supabase.from("chat_messages").insert({ event_slug: eventSlug, sender, text });
  }, [eventSlug]);
  const clearMessages = useCallback(async () => {
    await supabase.from("chat_messages").delete().eq("event_slug", eventSlug);
    setMessages([]); setUnread(0);
  }, [eventSlug]);
  const openChat  = useCallback(() => { setOpen(true);  setUnread(0); }, []);
  const closeChat = useCallback(() => { setOpen(false); setUnread(0); }, []);
  return { messages, unread, open, openChat, closeChat, sendMessage, clearMessages };
}
