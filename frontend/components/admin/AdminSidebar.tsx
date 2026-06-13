"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Database,
  Zap,
  Users,
} from "lucide-react";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: AlertCircle, label: "Verification Queue", href: "/admin/verification" },
  { icon: CheckCircle, label: "Approved", href: "/admin/approved" },
  { icon: FileText, label: "Published", href: "/admin/published" },
  { icon: XCircle, label: "Rejected", href: "/admin/rejected" },
  { icon: Database, label: "Sources", href: "/admin/sources" },
  { icon: Zap, label: "AI Logs", href: "/admin/updates" },
  { icon: Users, label: "Users", href: "/admin/users" },
];

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="sticky top-0 h-screen w-64 overflow-y-auto border-r border-[#E5E7EB] bg-white py-6">
      <div className="px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C6E] text-sm font-bold text-white">
            BL
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A3C6E]">BharatLens</p>
            <p className="text-xs text-[#111827]/60">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isItemActive = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isItemActive
                  ? "bg-[#1A3C6E] text-white"
                  : "text-[#111827]/70 hover:bg-[#F5F3EE] hover:text-[#1A3C6E]"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isItemActive && (
                <div className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-[#E5E7EB] px-3 pt-8">
        <div className="px-4 text-xs font-semibold uppercase text-[#111827]/60">
          Pipeline Status
        </div>
        <div className="mt-4 space-y-3 px-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111827]/60">AI Collector</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111827]/60">AI Processing</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111827]/60">Database</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}
