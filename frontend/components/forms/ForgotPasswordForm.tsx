"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password reset link sent. Please check your email.");
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F3EE] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">
          Forgot Password
        </h1>

        <p className="mt-2 text-sm text-[#111827]/60">
          Enter your registered email and we’ll send a password reset link.
        </p>

        <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#E5E7EB] py-3 pl-11 pr-4 outline-none focus:border-[#3B82F6]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <p className="text-sm text-[#111827]/70">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1A3C6E] px-4 py-3 font-semibold text-white transition hover:bg-[#16345f] disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[#3B82F6] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </main>
  );
}