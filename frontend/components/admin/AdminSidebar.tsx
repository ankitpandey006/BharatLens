"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  XCircle,
  Database,
  Users,
  Zap,
  BarChart3,
  Settings,
  AlertCircle,
} from "lucide-react";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    void import("@/lib/api/admin").then(({ fetchAdminStats }) => {
      void fetchAdminStats()
        .then((s) => setPendingCount(s.pending_items ?? 0))
        .catch(() => setPendingCount(null));
    });
  }, []);

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
      badge: null,
    },
    {
      icon: AlertCircle,
      label: "Verification",
      href: "/admin/verification",
      badge: pendingCount !== null ? String(pendingCount) : null,
    },
    {
      icon: CheckCircle,
      label: "Approved",
      href: "/admin/approved",
      badge: null,
    },
    {
      icon: XCircle,
      label: "Rejected",
      href: "/admin/rejected",
      badge: null,
    },
    {
      icon: FileText,
      label: "Published",
      href: "/admin/published",
      badge: null,
    },
    {
      icon: Database,
      label: "AI Sources",
      href: "/admin/sources",
      badge: null,
    },
    {
      icon: Zap,
      label: "Recommendations",
      href: "/admin/recommendations",
      badge: null,
    },
    {
      icon: Users,
      label: "Users",
      href: "/admin/users",
      badge: null,
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics",
      badge: null,
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
      badge: null,
    },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 overflow-y-auto border-r border-[#E5E7EB] bg-white py-6">
      <div className="px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C6E] text-sm font-bold text-white">
            BA
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A3C6E]">BharatLens</p>
            <p className="text-xs text-[#111827]/60">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 transition ${
                isItemActive
                  ? "bg-[#3B82F6]/10 text-[#1A3C6E]"
                  : "text-[#111827]/70 hover:bg-[#F5F3EE] hover:text-[#1A3C6E]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={`transition ${
                    isItemActive ? "text-[#1A3C6E]" : "text-[#111827]/60"
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
              {isItemActive && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-lg bg-[#1A3C6E]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-[#E5E7EB] px-3 pt-8">
        <p className="px-4 text-xs font-semibold uppercase text-[#111827]/60">
          System Info
        </p>
        <div className="mt-4 space-y-2 px-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111827]/60">AI Processing:</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111827]/60">DB Status:</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111827]/60">Last Sync:</span>
            <span className="text-[#111827]">2 min ago</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
