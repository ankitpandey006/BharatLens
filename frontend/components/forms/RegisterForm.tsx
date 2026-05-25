"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Lock,
  Eye,
  UserPlus,
  Sparkles,
} from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogleSignup = async () => {
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

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const authIdentifier = email.includes("@")
      ? { email: email.trim() }
      : { phone: email.trim() };

    const { error } = await supabase.auth.signUp({
      ...authIdentifier,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created. Complete your profile for better recommendations."
    );

    setTimeout(() => {
      router.push("/profile/setup");
    }, 2000);
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 text-[#111827] shadow-xl shadow-[#1A3C6E]/10 sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A3C6E]/10 text-[#1A3C6E]">
          <Sparkles size={24} />
        </div>

        <h2 className="text-2xl font-bold text-[#1A3C6E]">
          Create your BharatLens account
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#111827]/65">
          Start discovering verified government opportunities with AI
          assistance.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:border-[#1A3C6E] hover:bg-[#F5F3EE]"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1A3C6E]">
          G
        </span>
        Continue with Google
      </button>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-xs text-[#111827]/50">or sign up with email</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full Name</label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-2xl border border-[#E5E7EB] px-11 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Email or Mobile Number
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="text"
              placeholder="Email or mobile number"
              className="w-full rounded-2xl border border-[#E5E7EB] px-11 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl border border-[#E5E7EB] px-11 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <Eye
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full rounded-2xl border border-[#E5E7EB] px-11 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>

        {message && (
          <p className="rounded-2xl bg-[#F5F3EE] px-3 py-2 text-sm text-[#1A3C6E]">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A3C6E] py-3 font-semibold text-white transition hover:bg-[#3B82F6]"
        >
          <UserPlus size={18} />
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#111827]/65">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#3B82F6] transition hover:text-[#1A3C6E]"
        >
          Login
        </Link>
      </p>
    </div>
  );
}