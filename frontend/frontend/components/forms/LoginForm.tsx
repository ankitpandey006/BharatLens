"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const { isAuthenticated, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/profile/setup");
  }, [router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile/setup`,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const authIdentifier = email.includes("@")
      ? { email: email.trim() }
      : { phone: email.trim() };

    const { data, error } = await supabase.auth.signInWithPassword({
      ...authIdentifier,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const isProfileComplete = Boolean(
      data.user?.user_metadata?.profile_completed
    );

    const destination = isProfileComplete ? "/dashboard" : "/profile/setup";

    router.replace(destination);
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 text-[#111827] shadow-lg shadow-[#1A3C6E]/8 sm:p-8">
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
        disabled={isSubmitting}
        className={`mb-4 w-full rounded-2xl border py-3 text-sm font-semibold transition ${
          isSubmitting
            ? "cursor-not-allowed border-[#E5E7EB] bg-[#F5F3EE] text-[#9CA3AF]"
            : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#1A3C6E] hover:bg-[#F5F3EE]"
        }`}
      >
        {isSubmitting ? "Please wait..." : "Continue with Google"}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
          disabled={isSubmitting}
          className={`w-full rounded-2xl py-3 font-semibold text-white transition ${
            isSubmitting
              ? "cursor-not-allowed bg-[#9BB6E5]"
              : "bg-[#1A3C6E] hover:bg-[#3B82F6]"
          }`}
        >
          {isSubmitting ? "Logging in..." : "Login"}
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