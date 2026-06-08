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
