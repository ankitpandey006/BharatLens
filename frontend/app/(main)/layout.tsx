"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, type UserProfile } from "@/lib/api/auth-api";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, session } = useAuth();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const isProfileSetupRoute = pathname.startsWith("/profile/setup");

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      // Once we know there's no session, mark initial load done.
      if (!initialLoadDone) setInitialLoadDone(true);
      return;
    }

    let canceled = false;

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();

        if (!canceled) {
          setCurrentUser(user);
        }
      } catch {
        if (!canceled) {
          setCurrentUser(null);
        }
      } finally {
        if (!canceled && !initialLoadDone) {
          setInitialLoadDone(true);
        }
      }
    }

    loadCurrentUser();

    return () => {
      canceled = true;
    };
  }, [authLoading, session]);

  const profileCompleted = currentUser?.profile_completed === true;

  useEffect(() => {
    if (authLoading || !initialLoadDone) return;

    // Redirect unauthenticated users to login
    if (!session) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    // Redirect completed profile users away from setup route
    if (profileCompleted && isProfileSetupRoute) {
      router.replace("/dashboard");
      return;
    }
  }, [
    authLoading,
    initialLoadDone,
    session,
    pathname,
    profileCompleted,
    isProfileSetupRoute,
    router,
  ]);

  // ── Show minimal skeleton only on FIRST render before auth is checked ──
  // Once initialLoadDone is true, we NEVER show the skeleton again —
  // even if auth events fire later (e.g. TOKEN_REFRESHED, which the
  // AuthProvider now silently ignores).
  if (!initialLoadDone) {
    // While auth is loading on very first render, show minimal skeleton.
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#F5F3EE] animate-pulse">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="h-8 w-48 rounded-lg bg-[#E5E7EB]/70" />
            <div className="mt-4 space-y-3">
              <div className="h-32 rounded-2xl bg-[#E5E7EB]/50" />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-[#E5E7EB]/50" />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Profile check on first load — same skeleton
    if (session) {
      return (
        <div className="min-h-screen bg-[#F5F3EE] animate-pulse">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="h-8 w-48 rounded-lg bg-[#E5E7EB]/70" />
            <div className="mt-4 space-y-3">
              <div className="h-32 rounded-2xl bg-[#E5E7EB]/50" />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-[#E5E7EB]/50" />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  if (!session) return null;

  return <>{children}</>;
}
