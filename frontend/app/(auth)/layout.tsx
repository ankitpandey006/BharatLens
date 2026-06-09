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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] animate-pulse text-[#111827]">
        <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 md:grid-cols-[1fr_440px] md:px-8 lg:gap-16">
          <section className="hidden space-y-4 md:block">
            <div className="h-4 w-32 rounded bg-[#E5E7EB]/70" />
            <div className="space-y-3">
              <div className="h-10 w-3/4 rounded bg-[#E5E7EB]/70" />
              <div className="h-10 w-1/2 rounded bg-[#E5E7EB]/70" />
            </div>
            <div className="h-4 w-full rounded bg-[#E5E7EB]/70" />
            <div className="h-4 w-2/3 rounded bg-[#E5E7EB]/70" />
          </section>
          <div className="flex w-full justify-center">
            <div className="h-96 w-full max-w-sm rounded-2xl bg-[#E5E7EB]/50" />
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
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
