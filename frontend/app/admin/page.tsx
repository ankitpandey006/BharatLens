"use client";

import { Users, Layers, Award, Briefcase, Clock, Bell } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useAdminStats } from "@/hooks/useApi";

export default function AdminDashboard() {
  const { data: stats, error, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-[#E5E7EB]/70" />
          <div className="mt-2 h-4 w-96 rounded bg-[#E5E7EB]/50" />
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#E5E7EB]/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-8 text-sm text-red-700">
        <p className="font-semibold">Unable to load admin dashboard</p>
        <p>{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Dashboard</h1>
        <p className="mt-2 text-[#111827]/60">Overview of BharatLens admin metrics and content status</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard label="Total Users" value={stats?.total_users ?? 0} color="blue" icon={<Users size={24} />} />
        <AdminStatCard label="Total Schemes" value={stats?.total_schemes ?? 0} color="green" icon={<Layers size={24} />} />
        <AdminStatCard label="Total Scholarships" value={stats?.total_scholarships ?? 0} color="yellow" icon={<Award size={24} />} />
        <AdminStatCard label="Total Jobs" value={stats?.total_jobs ?? 0} color="purple" icon={<Briefcase size={24} />} />
        <AdminStatCard label="Pending Verification" value={stats?.pending_items ?? 0} color="yellow" icon={<Clock size={24} />} />
        <AdminStatCard label="Unread Notifications" value={stats?.total_notifications ?? 0} color="red" icon={<Bell size={24} />} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h3 className="mb-6 font-semibold text-[#1A3C6E]">Content Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-[#111827]/70">Approved Items</span><span className="font-semibold text-[#1A3C6E]">{stats?.approved_items ?? 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-[#111827]/70">Rejected Items</span><span className="font-semibold text-[#1A3C6E]">{stats?.rejected_items ?? 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-[#111827]/70">Published Items</span><span className="font-semibold text-[#1A3C6E]">—</span></div>
            <div className="flex items-center justify-between"><span className="text-[#111827]/70">Saved Items</span><span className="font-semibold text-[#1A3C6E]">{stats?.total_saved_items ?? 0}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h3 className="mb-6 font-semibold text-[#1A3C6E]">Category Breakdown</h3>
          <div className="space-y-4 text-[#111827]/70">
            <p>Total schemes: <span className="font-semibold text-[#111827]">{stats?.total_schemes ?? 0}</span></p>
            <p>Total scholarships: <span className="font-semibold text-[#111827]">{stats?.total_scholarships ?? 0}</span></p>
            <p>Total jobs: <span className="font-semibold text-[#111827]">{stats?.total_jobs ?? 0}</span></p>
            <p>Total exams: <span className="font-semibold text-[#111827]">{stats?.total_exams ?? 0}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
