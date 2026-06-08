"use client";

import { Bot, Send, ArrowRight, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// ─── Welcome suggestions ───────────────────────────────────────────

const WELCOME_SUGGESTIONS = [
  "Which schemes am I eligible for?",
  "Find scholarships for my profile",
  "Latest government job openings",
  "Upcoming exam notifications",
];

// ─── Generate a simple ID ──────────────────────────────────────────

let msgCounter = 0;
function nextId(): string {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

// ─── Component ─────────────────────────────────────────────────────

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I'm your BharatLens AI assistant. Ask me about government schemes, scholarships, jobs, or exams — or pick a suggestion below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Scroll to bottom on new messages ─────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input on mount ─────────────────────────────────────────

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send a message ──────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setHasInteracted(true);
    setSending(true);

    // Add user message
    const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI response (placeholder — plug in a real API later)
    setTimeout(() => {
      const reply = buildReply(trimmed);
      const aiMsg: ChatMessage = { id: nextId(), role: "assistant", content: reply };
      setMessages((prev) => [...prev, aiMsg]);
      setSending(false);
    }, 800);
  };

  // ── Handle Enter key ─────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#F5F3EE]">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* ─── Chat Card ───────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm sm:rounded-3xl sm:shadow-md">
          {/* ─── Header ────────────────────────────────────────── */}
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A3C6E] to-[#3B82F6] text-white shadow-sm">
              <Bot size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-[#1A3C6E] sm:text-lg">
                BharatLens AI
              </h1>
              <p className="truncate text-xs text-[#111827]/50 sm:text-sm">
                Ask about schemes, scholarships, jobs &amp; exams
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden h-2 w-2 rounded-full bg-green-500 sm:inline-block" />
              <span className="hidden text-xs font-medium text-green-600 sm:inline">
                Online
              </span>
            </div>
          </div>

          {/* ─── Messages Area ─────────────────────────────────── */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] sm:px-5 sm:py-3.5 ${
                    msg.role === "user"
                      ? "bg-[#1A3C6E] text-white"
                      : "bg-[#F5F3EE] text-[#111827]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-[#F5F3EE] px-5 py-3.5">
                  <Loader2 size={16} className="animate-spin text-[#3B82F6]" />
                  <span className="text-sm text-[#111827]/60">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Welcome Suggestions ───────────────────────────── */}
          {!hasInteracted && !sending && (
            <div className="border-t border-[#E5E7EB] bg-[#FAFAF9] px-5 py-4 sm:px-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#111827]/40">
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {WELCOME_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      sendMessage(suggestion);
                    }}
                    disabled={sending}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-[#111827]/70 shadow-sm transition-all hover:border-[#3B82F6] hover:text-[#3B82F6] hover:shadow disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    {suggestion}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Input Area ────────────────────────────────────── */}
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] px-4 py-2.5 transition-all focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/15 sm:px-5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                disabled={sending}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#111827]/35 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A3C6E] text-white transition-all hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Simple reply builder (placeholder — replace with real AI) ────

function buildReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("scheme") || lower.includes("eligible")) {
    return (
      "Great question! Based on your profile details, I'd recommend checking out:\n\n" +
      "• **Pradhan Mantri Awas Yojana** – Housing for all\n" +
      "• **PM-KISAN** – Income support for farmers\n" +
      "• **Stand-Up India** – Financing for SC/ST & women\n\n" +
      "Would you like me to filter these by your state or income category?"
    );
  }

  if (lower.includes("scholarship")) {
    return (
      "Here are scholarships matching your profile:\n\n" +
      "• **National Scholarship Portal** – Central sector schemes\n" +
      "• **Post-Matric Scholarship** – For SC/ST/OBC students\n" +
      "• **AICTE Pragati** – For girl students\n\n" +
      "Head to the Scholarships section to explore all options!"
    );
  }

  if (lower.includes("job") || lower.includes("government")) {
    return (
      "Upcoming government opportunities:\n\n" +
      "• **SSC CGL 2025** – Graduate level exams\n" +
      "• **UPSC Civil Services** – Preliminary exams\n" +
      "• **State PSC** – Various state-level openings\n\n" +
      "Check the Jobs section for full details and application links."
    );
  }

  if (lower.includes("exam") || lower.includes("notification")) {
    return (
      "Recent exam notifications:\n\n" +
      "• **NEET PG 2025** – Application deadline extended\n" +
      "• **JEE Main 2025** – Session 2 results out\n" +
      "• **CTET 2025** – Application form released\n\n" +
      "Visit the Exams page for more."
    );
  }

  return (
    "I can help you find schemes, scholarships, jobs, and exams tailored to your profile. " +
    "Try asking:\n\n" +
    "• \"Which schemes am I eligible for?\"\n" +
    "• \"Find scholarships for students\"\n" +
    "• \"Latest government jobs\"\n" +
    "• \"Upcoming exam notifications\""
  );
}
