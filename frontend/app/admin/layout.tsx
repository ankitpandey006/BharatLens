"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, session } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading || session) {
      return;
    }

    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [authLoading, pathname, router, session]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileSidebarOpen(false);
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isMobileSidebarOpen]);

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
