"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] text-[#111827]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-md">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
            <p className="text-sm font-medium text-[#1A3C6E]">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#111827]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 md:grid-cols-[1fr_440px] md:px-8 lg:gap-16">
        <section className="hidden md:block">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
              BharatLens
            </p>
            <h1 className="text-4xl font-bold leading-tight text-[#1A3C6E] lg:text-5xl">
              AI-powered access to verified public opportunities.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#111827]/65">
              Discover schemes, scholarships, jobs, exams, and recommendations
              built around your needs.
            </p>
          </div>
        </section>

        <div className="flex w-full justify-center">{children}</div>
      </div>
    </div>
  );
}
