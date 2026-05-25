"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please fill both password fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setMessage(
        "Reset session expired. Please request a new password reset link."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F3EE] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">
          Reset Password
        </h1>

        <p className="mt-2 text-sm text-[#111827]/60">
          Enter your new password below.
        </p>

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-xl border border-[#E5E7EB] py-3 pl-11 pr-4 outline-none focus:border-[#3B82F6]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-[#E5E7EB] py-3 pl-11 pr-4 outline-none focus:border-[#3B82F6]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {message && (
            <p className="text-sm text-[#111827]/70">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1A3C6E] px-4 py-3 font-semibold text-white transition hover:bg-[#16345f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}