"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ensureSafeBrowserOrigin,
  getAuthCallbackUrl,
  safeRedirectPath,
} from "@/lib/auth/urls";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, loginWithBackend } from "@/lib/api/auth-api";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  missing_oauth_code: "Sign-in was cancelled or incomplete. Please try again.",
  oauth_exchange_failed: "Could not complete Google sign-in. Please try again.",
  bad_oauth_state:
    "Sign-in session expired or used a different address. Open http://localhost:3000 (not 0.0.0.0) and try again.",
  supabase_not_configured: "Authentication is not configured. Contact support.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const { isAuthenticated, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const oauthErrorCode = searchParams.get("error");
  const oauthErrorMessage =
    oauthErrorCode && OAUTH_ERROR_MESSAGES[oauthErrorCode]
      ? OAUTH_ERROR_MESSAGES[oauthErrorCode]
      : "";
  const message = formMessage || oauthErrorMessage;

  const isSubmitting = emailLoading || googleLoading;

  useEffect(() => {
    ensureSafeBrowserOrigin();
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const next = safeRedirectPath(searchParams.get("next"));
      router.replace(next ?? "/dashboard");
    }
  }, [authLoading, isAuthenticated, router, searchParams]);

  const handleGoogleLogin = async () => {
    ensureSafeBrowserOrigin();

    setGoogleLoading(true);
    setFormMessage("");

    const redirectTo = getAuthCallbackUrl();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      setFormMessage(error.message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setFormMessage("Please enter your email and password.");
      return;
    }

    setEmailLoading(true);
    setFormMessage("");

    try {
      const result = await loginWithBackend(cleanEmail, password);

      // Sync the Supabase browser session for protected routes and middleware.
      try {
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token ?? "",
        });
      } catch (sessionError) {
        console.error("Failed to sync Supabase session after backend login:", sessionError);
      }

      let profileComplete = false;
      try {
        const currentUser = await getCurrentUser();
        profileComplete = currentUser.profile_completed === true;
      } catch (profileError) {
        profileComplete = result.user.profile_completed === true;
      }

      if (profileComplete) {
        try {
          await supabase.auth.updateUser({
            data: { profile_completed: "true" },
          });
        } catch (metadataError) {
          console.warn("Failed to sync profile metadata after login:", metadataError);
        }
      }

      router.replace(profileComplete ? "/dashboard" : "/profile/setup");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      setFormMessage(errorMessage);
      setEmailLoading(false);
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

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting || authLoading}
        className="mb-4 min-h-11 w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#111827] transition hover:border-[#1A3C6E] hover:bg-[#F5F3EE] disabled:cursor-not-allowed disabled:bg-[#F5F3EE] disabled:text-[#9CA3AF]"
      >
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-xs font-medium text-[#111827]/45">OR</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
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
            disabled={isSubmitting || authLoading}
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
            disabled={isSubmitting || authLoading}
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

        {message ? (
          <p className="rounded-2xl bg-[#F5F3EE] px-3 py-2 text-sm text-[#1A3C6E]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || authLoading}
          className="min-h-11 w-full rounded-2xl bg-[#1A3C6E] py-3 font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5]"
        >
          {emailLoading ? "Logging in..." : "Login"}
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
