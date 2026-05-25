"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile/setup`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    const authIdentifier = email.includes("@")
      ? { email: email.trim() }
      : { phone: email.trim() };

    const { data, error } = await supabase.auth.signInWithPassword({
      ...authIdentifier,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const isProfileComplete = Boolean(
      data.user?.user_metadata?.profile_completed
    );

    setMessage("Login successful.");
    router.push(isProfileComplete ? "/dashboard" : "/profile/setup");
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 text-[#111827] shadow-xl shadow-[#1A3C6E]/10 sm:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C6E]">
          Welcome back to BharatLens
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#111827]/65">
          Access verified schemes, scholarships, jobs, exams and AI-powered
          recommendations.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mb-4 w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#111827] transition hover:border-[#1A3C6E] hover:bg-[#F5F3EE]"
      >
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-xs font-medium text-[#111827]/45">OR</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Email or Mobile Number
          </label>
          <input
            type="text"
            placeholder="Email or mobile number"
            className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#3B82F6] transition hover:text-[#1A3C6E]"
          >
            Forgot password?
          </Link>
        </div>

        {message ? (
          <p className="rounded-2xl bg-[#F5F3EE] px-3 py-2 text-sm text-[#1A3C6E]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-[#1A3C6E] py-3 font-semibold text-white transition hover:bg-[#3B82F6]"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#111827]/65">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#3B82F6] transition hover:text-[#1A3C6E]"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
