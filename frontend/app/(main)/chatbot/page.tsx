"use client";

import {
  Bot,
  Send,
  ArrowRight,
  Loader2,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Award,
  Briefcase,
  BookOpen,
  Bookmark,
  Bell,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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

// ─── Mobile Menu Items ─────────────────────────────────────────────

const MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schemes", label: "Schemes", icon: FileText },
  { href: "/scholarships", label: "Scholarships", icon: Award },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/saved", label: "Saved Items", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "My Profile", icon: User },
];

// ─── Generate a simple ID ──────────────────────────────────────────

let msgCounter = 0;
function nextId(): string {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

// ─── Component ─────────────────────────────────────────────────────

export default function ChatbotPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, isSigningOut } = useAuth();

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const drawerToggleRef = useRef<HTMLButtonElement>(null);

  // ── Scroll to bottom on new messages ─────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input on mount ─────────────────────────────────────────

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      mobileInputRef.current?.focus();
    } else {
      desktopInputRef.current?.focus();
    }
  }, []);

  // ── Close drawer with slide-out animation ───────────────────────

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setDrawerClosing(false);
      drawerToggleRef.current?.focus();
    }, 250);
  }, []);

  // ── Drawer: close on ESC ────────────────────────────────────────

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  // ── Prevent body scroll on mobile layout mount ─────────────────

  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Drawer: close on resize to desktop ──────────────────────────

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isDrawerOpen) {
        closeDrawer();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDrawerOpen, closeDrawer]);

  // ── Drawer: prevent body scroll when open ───────────────────────

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else if (window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isDrawerOpen]);

  // ── Send a message ──────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || sending) return;

    setHasInteracted(true);
    setSending(true);

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

  // ── Handle logout ────────────────────────────────────────────────

  const handleLogout = async () => {
    if (isSigningOut) return;

    await signOut();
    closeDrawer();
    router.push("/login");
  };

  // ── isActive helper ──────────────────────────────────────────────

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* ═════════════════════════════════════════════════════════
           MOBILE LAYOUT (<768px) — Fullscreen app experience
           ═════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F3EE] md:hidden">
        {/* ─── Mobile Header ───────────────────────────────── */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#E5E7EB] bg-white/80 px-4 py-3 shadow-xs backdrop-blur-lg">
          <button
            ref={drawerToggleRef}
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#111827] transition-colors hover:bg-[#F5F3EE] active:scale-95"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-[#1A3C6E]">
              BharatLens AI
            </h1>
            <p className="truncate text-xs text-[#111827]/50">
              AI Government Discovery
            </p>
          </div>

          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
        </header>

        {/* ─── Messages Area ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="mx-auto max-w-3xl">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1A3C6E] text-white"
                      : "bg-white text-[#111827] shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="mb-4 flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-[#3B82F6]" />
                  <span className="text-sm text-[#111827]/60">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── Suggested Questions ─────────────────────────── */}
        {!hasInteracted && !sending && (
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#111827]/40">
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {WELCOME_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={sending}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F5F3EE] px-3 py-1.5 text-xs font-medium text-[#111827]/70 transition-all hover:border-[#3B82F6] hover:text-[#3B82F6] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Input Area ─────────────────────────────────── */}
        <div
          className="border-t border-[#E5E7EB] bg-white px-3 py-3"
          style={{
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] px-4 py-2 transition-all focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/15">
              <input
                ref={mobileInputRef}
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A3C6E] text-white transition-all hover:bg-[#3B82F6] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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

        {/* ─── Navigation Drawer ──────────────────────────── */}
        {(isDrawerOpen || drawerClosing) && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity ${
                drawerClosing ? "opacity-0" : "opacity-100"
              }`}
              style={{
                transitionDuration: drawerClosing ? "250ms" : "300ms",
              }}
              onClick={closeDrawer}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
              className={`absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl`}
              style={{
                animation: !drawerClosing
                  ? "drawerSlideIn 0.3s ease-out"
                  : undefined,
                transform: drawerClosing
                  ? "translateX(-100%)"
                  : undefined,
                transition: drawerClosing
                  ? "transform 0.25s ease-out"
                  : undefined,
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A3C6E] to-[#3B82F6] text-sm font-bold text-white shadow-md">
                  <Sparkles size={16} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-[#111827]">
                    BharatLens
                  </h2>
                  <p className="truncate text-xs text-[#111827]/50">
                    AI Government Discovery
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#111827]/60 transition-colors hover:bg-[#F5F3EE] hover:text-[#111827]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="flex-1 overflow-y-auto py-2">
                {MENU_ITEMS.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "border-r-[3px] border-[#3B82F6] bg-[#3B82F6]/5 text-[#3B82F6]"
                          : "text-[#111827]/70 hover:bg-[#F5F3EE] hover:text-[#111827]"
                      }`}
                    >
                      <IconComponent
                        size={18}
                        className={active ? "text-[#3B82F6]" : ""}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Footer - Logout */}
              <div className="border-t border-[#E5E7EB] p-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isSigningOut
                      ? "cursor-not-allowed bg-red-100 text-red-400"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <LogOut size={18} />
                  {isSigningOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
           DESKTOP LAYOUT (>=768px) — Unchanged behaviour
           ═════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-[calc(100dvh-4rem)] bg-[#F5F3EE]">
        <div className="mx-auto flex w-full max-w-4xl flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-8">
          {/* ─── Chat Card ─────────────────────────────────── */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm sm:rounded-3xl sm:shadow-md">
            {/* ─── Header ──────────────────────────────────── */}
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 sm:px-6 sm:py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A3C6E] to-[#3B82F6] text-white shadow-sm sm:h-10 sm:w-10">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-[#1A3C6E] sm:text-lg">
                  BharatLens AI
                </h1>
                <p className="truncate text-xs text-[#111827]/50">
                  Ask about schemes, scholarships, jobs &amp; exams
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="hidden text-xs font-medium text-green-600 sm:inline">
                  Online
                </span>
              </div>
            </div>

            {/* ─── Messages Area ──────────────────────────── */}
            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] sm:px-5 sm:py-3.5 ${
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
                  <div className="flex items-center gap-2 rounded-2xl bg-[#F5F3EE] px-4 py-3 sm:px-5 sm:py-3.5">
                    <Loader2 size={16} className="animate-spin text-[#3B82F6]" />
                    <span className="text-sm text-[#111827]/60">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Welcome Suggestions ────────────────────── */}
            {!hasInteracted && !sending && (
              <div className="border-t border-[#E5E7EB] bg-[#FAFAF9] px-4 py-3 sm:px-6 sm:py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#111827]/40 sm:mb-3">
                  Suggested questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {WELCOME_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827]/70 shadow-sm transition-all hover:border-[#3B82F6] hover:text-[#3B82F6] hover:shadow disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {suggestion}
                      <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Input Area ─────────────────────────────── */}
            <div className="border-t border-[#E5E7EB] bg-white px-3 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] px-3 py-2 transition-all focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/15 sm:px-5 sm:py-2.5">
                <input
                  ref={desktopInputRef}
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

      {/* ─── Keyframes for drawer slide-in animation ─────────────── */}
      <style>{`
        @keyframes drawerSlideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
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
