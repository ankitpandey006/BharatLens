"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ShieldCheck, RefreshCcw } from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#1A3C6E] p-6 text-white">
      <h2 className="mb-8 text-2xl font-bold">BharatLens Admin</h2>

      <nav className="space-y-4">
        <Link href="/admin" className="flex items-center gap-3 hover:text-blue-200">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link href="/admin/users" className="flex items-center gap-3 hover:text-blue-200">
          <Users size={18} />
          Users
        </Link>

        <Link href="/admin/sources" className="flex items-center gap-3 hover:text-blue-200">
          <ShieldCheck size={18} />
          Sources
        </Link>

        <Link href="/admin/updates" className="flex items-center gap-3 hover:text-blue-200">
          <RefreshCcw size={18} />
          Updates
        </Link>
      </nav>
    </aside>
  );
}