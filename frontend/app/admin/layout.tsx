"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, type UserProfile } from "@/lib/api/auth-api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, session } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [roleCheckLoading, setRoleCheckLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch user only on mount and session change — NOT on every pathname change
  // Initial state is already loading=true, so we only set it false when done.
  useEffect(() => {
    if (authLoading) return;
    if (!session) return;

    let canceled = false;

    getCurrentUser()
      .then((user) => {
        if (!canceled) setCurrentUser(user);
      })
      .catch(() => {
        if (!canceled) setCurrentUser(null);
      })
      .finally(() => {
        if (!canceled) setRoleCheckLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [authLoading, session]); // Intentionally omitting pathname/router — only re-fetch on auth state change

  // Separate effect for role-based redirects — listens to pathname
  const role =
    currentUser?.role ||
    (session?.user?.user_metadata as { role?: string } | undefined)?.role ||
    (session?.user?.app_metadata as { role?: string } | undefined)?.role;
  const isAdmin = role ? ["admin", "moderator"].includes(role) : null;

  useEffect(() => {
    if (authLoading || roleCheckLoading) return;

    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAdmin === false) {
      router.replace("/");
    }
  }, [authLoading, roleCheckLoading, pathname, router, session, isAdmin]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileSidebarOpen(false);
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isMobileSidebarOpen]);

  if (authLoading || roleCheckLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
        <div className="hidden lg:flex lg:h-full lg:w-64 lg:flex-col">
          <div className="flex h-16 items-center justify-center border-b border-[#E5E7EB]/60 bg-white px-6">
            <div className="h-8 w-24 rounded bg-[#E5E7EB]/70" />
          </div>
          <div className="flex-1 space-y-2 bg-white p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-[#E5E7EB]/50" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col lg:ml-64">
          <div className="flex h-16 items-center border-b border-[#E5E7EB]/60 bg-white px-6">
            <div className="h-8 w-32 rounded bg-[#E5E7EB]/70" />
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-[#E5E7EB]/70" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-[#E5E7EB]/50" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || isAdmin === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:flex">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 lg:hidden ${
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-50 h-full transition-transform duration-200 lg:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title=""
          subtitle=""
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
