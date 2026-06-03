"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { getAuthToken } from "@/lib/auth/storage";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (getAuthToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

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

    setLoading(true);
    setMessage("");

    try {
      const user = await register({
        full_name: name,
        email: email.trim(),
        password,
      });

      // User registered, but not logged in yet. Redirect to login
      router.replace("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setMessage(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 text-[#111827] shadow-lg shadow-[#1A3C6E]/8 sm:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C6E]">
          Create your BharatLens account
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#111827]/65">
          Start discovering verified government opportunities with AI
          assistance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full Name</label>
          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            required
          />
        </div>

        {message && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#1A3C6E] py-3 font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5]"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#111827]/65">
        Already have an account?{" "}
        <Link
          href="/login"
          prefetch={false}
          className="font-medium text-[#3B82F6] transition hover:text-[#1A3C6E]"
        >
          Login
        </Link>
      </p>
    </div>
  );
}