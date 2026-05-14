"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

interface Props { analysis: AnalysisResult; }
interface ChatMessage { id: string; role: "user" | "assistant"; content: string; }
interface AskResponse { response: string; }

const SUGGESTIONS = [
  "Who is doing the frontend?",
  "What was decided about the tech stack?",
  "Who hasn't responded yet?",
  "What is the project deadline?",
] as const;

function TypingDots() {
  return <div className="flex gap-1 px-4 py-3 rounded-[14px]" style={{ background: "#111828" }}>{[0, 1, 2].map((d) => <motion.span key={d} className="h-2 w-2 rounded-full" style={{ background: "#7A92B8" }} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }} />)}</div>;
}

export default function AskAI({ analysis }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const history = useMemo(() => messages.map((m) => ({ role: m.role, content: m.content })), [messages]);

  const sendMessage = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setError(null);
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, analysis, conversationHistory: history.slice(-10) }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as AskResponse;
      const aiMessage: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setError("Could not reach AI right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}>
      <div className="flex items-center gap-2 mb-1"><Bot size={20} style={{ color: "#6366F1" }} /><h2 className="text-white font-semibold text-xl">Ask AI</h2></div>
      <p className="text-sm mb-6" style={{ color: "#7A92B8" }}>Ask anything about your group chat</p>
      <div className="rounded-[14px] border h-[500px] flex flex-col" style={{ background: "#0C1121", borderColor: "#1A2440" }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#1A2440" }}>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#6366F1" }}><Bot size={16} style={{ color: "#060810" }} /></div><div><p className="text-sm text-white font-medium">ClearGroup AI</p><p className="text-xs" style={{ color: "#7A92B8" }}>Powered by Gemini</p></div></div>
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#8B5CF6" }} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && <div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => void sendMessage(s)} className="text-[13px] px-4 py-2 rounded-full border transition-colors hover:border-[#2A3860]" style={{ background: "#111828", borderColor: "#1A2440", color: "#E8F4F8" }}>{s}</button>)}</div>}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1" style={{ background: "#111828" }}><Bot size={14} style={{ color: "#6366F1" }} /></div>}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed" style={{ background: m.role === "user" ? "#6366F1" : "#111828", color: m.role === "user" ? "#060810" : "#E8F4F8", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", maxWidth: m.role === "user" ? "75%" : "85%" }}>{m.content}</motion.div>
            </div>
          ))}
          {loading && <div className="flex items-start"><div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1" style={{ background: "#111828" }}><Bot size={14} style={{ color: "#6366F1" }} /></div><TypingDots /></div>}
          {error && <p className="text-sm" style={{ color: "#FF6B6B" }}>{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }} className="border-t p-4 flex gap-3" style={{ borderColor: "#1A2440" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your chat..." className="flex-1 rounded-[10px] px-4 py-3 text-sm outline-none border" style={{ background: "#111828", borderColor: "#1A2440", color: "#E8F4F8" }} onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F1"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#1A2440"; }} />
          <button type="submit" disabled={!input.trim() || loading} className="rounded-lg px-4 py-3 disabled:opacity-50" style={{ background: "#6366F1", color: "#060810" }}><Send size={16} /></button>
        </form>
      </div>
    </motion.section>
  );
}

