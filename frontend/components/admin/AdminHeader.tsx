"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, Settings, LogOut, Menu } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const { signOut, isSigningOut } = useAuth();

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }
    await signOut();
  };

  return (
    <div className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {onOpenMobileMenu ? (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] transition hover:bg-[#F5F3EE] lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#1A3C6E] sm:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden truncate text-sm text-[#111827]/60 sm:block">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] transition-all hover:bg-[#F5F3EE]"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] transition-all hover:bg-[#F5F3EE]"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
           className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 sm:gap-2 sm:px-4"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              {isSigningOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
