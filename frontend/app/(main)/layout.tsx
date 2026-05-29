"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, session } = useAuth();
  const isProfileSetupRoute = pathname.startsWith("/profile/setup");
  const profileCompleted = Boolean(
    session?.user?.user_metadata?.profile_completed,
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!session) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (!profileCompleted && !isProfileSetupRoute) {
      router.replace("/profile/setup");
    }
  }, [
    authLoading,
    isProfileSetupRoute,
    pathname,
    profileCompleted,
    router,
    session,
  ]);

  if (authLoading) {
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

  if (!session) {
    return null;
  }

  if (!profileCompleted && !isProfileSetupRoute) {
    return null;
  }

  return <>{children}</>;
}
