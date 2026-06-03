"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getAuthToken, setUserProfile } from "@/lib/auth/storage";
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, isAuthenticated, userProfile } = useAuth();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionProfile, setSessionProfile] = useState<Record<string, unknown> | null>(
    userProfile,
  );
  const isProfileSetupRoute = pathname.startsWith("/profile/setup");
  const profileCompleted = Boolean(
    (sessionProfile ?? userProfile)?.profile_completed,
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSessionLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setSessionProfile(currentUser as unknown as Record<string, unknown>);
        setUserProfile(currentUser as unknown as Record<string, unknown>);
      } catch (error) {
        setSessionProfile(userProfile);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [authLoading, userProfile]);

  useEffect(() => {
    if (authLoading || sessionLoading) {
      return;
    }

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname);
      window.location.href = `/login?next=${next}`;
      return;
    }

    if (!profileCompleted && !isProfileSetupRoute) {
      router.replace("/profile/setup");
    }
  }, [
    authLoading,
    isAuthenticated,
    isProfileSetupRoute,
    pathname,
    profileCompleted,
    router,
    sessionLoading,
  ]);

  if (authLoading || sessionLoading) {
    return (
      <div className="min-h-[40vh] bg-[#F5F3EE] text-[#111827]">
        <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-md">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
            <p className="text-sm font-medium text-[#1A3C6E]">Checking session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[40vh] bg-[#F5F3EE] text-[#111827]">
        <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-md">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
            <p className="text-sm font-medium text-[#1A3C6E]">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileCompleted && !isProfileSetupRoute) {
    return (
      <div className="min-h-[40vh] bg-[#F5F3EE] text-[#111827]">
        <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-md">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
            <p className="text-sm font-medium text-[#1A3C6E]">Redirecting to profile setup...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
