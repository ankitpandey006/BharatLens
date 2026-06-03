"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";
import { getAuthToken } from "@/lib/auth/storage";
import { safeRedirectPath } from "@/lib/auth/urls";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, preserve next redirect and avoid reloading login page.
  useEffect(() => {
    if (getAuthToken()) {
      const next = safeRedirectPath(searchParams.get("next"));
      router.replace(next ?? "/dashboard");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setFormMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setFormMessage("");

    try {
      await login({
        email: cleanEmail,
        password,
      });

      window.dispatchEvent(new Event("authChange"));
      const next = safeRedirectPath(searchParams.get("next")) ?? "/dashboard";
      await router.replace(next);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      setFormMessage(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 text-[#111827] shadow-lg shadow-[#1A3C6E]/10 sm:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C6E]">
          Welcome back to BharatLens
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#111827]/65">
          Access verified schemes, scholarships, jobs, exams and AI-powered
          recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="min-h-11 w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="min-h-11 w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            prefetch={false}
            className="text-sm font-medium text-[#3B82F6] transition hover:text-[#1A3C6E]"
          >
            Forgot password?
          </Link>
        </div>

        {formMessage ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {formMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-2xl bg-[#1A3C6E] py-3 font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5]"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#111827]/65">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          prefetch={false}
          className="font-medium text-[#3B82F6] transition hover:text-[#1A3C6E]"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
