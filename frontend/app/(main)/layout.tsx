"use client";

import { useEffect, useState } from "react";
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
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);

  const isProfileSetupRoute = pathname.startsWith("/profile/setup");

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      // Schedule state updates to avoid synchronous setState in effect
      const timer = window.setTimeout(() => {
        setCurrentUser(null);
        setProfileCheckLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    let canceled = false;

    async function loadCurrentUser() {
      setProfileCheckLoading(true);

      try {
        const user = await getCurrentUser();

        if (!canceled) {
          setCurrentUser(user);
        }
      } catch {
        // Silently handle — user stays logged out in the UI

        if (!canceled) {
          setCurrentUser(null);
        }
      } finally {
        if (!canceled) {
          setProfileCheckLoading(false);
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
    if (authLoading || profileCheckLoading) return;

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

    // For incomplete users: allow dashboard and setup routes to render normally
    // Dashboard will show a "Complete Profile" card for incomplete users
    // Setup route will show the profile wizard
  }, [
    authLoading,
    profileCheckLoading,
    session,
    pathname,
    profileCompleted,
    isProfileSetupRoute,
    router,
  ]);

  if (authLoading || profileCheckLoading) {
    return (
      <div className="min-h-[40vh] bg-[#F5F3EE] text-[#111827]">
        <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-md">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
            <p className="text-sm font-medium text-[#1A3C6E]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
