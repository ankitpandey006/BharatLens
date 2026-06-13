"use client";

import { Clock, CheckCircle, XCircle, FileText, TrendingUp, Layers, Award, Briefcase, Activity } from "lucide-react";
import { useAdminStats } from "@/hooks/useApi";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: stats, error, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 w-56 rounded-lg bg-[#E5E7EB]/70" />
          <div className="mt-2 h-4 w-72 rounded bg-[#E5E7EB]/50" />
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#E5E7EB]/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-8 text-sm text-red-700">
        <p className="font-semibold">Unable to load admin dashboard</p>
        <p className="mt-1">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  const published = (stats?.total_schemes ?? 0) + (stats?.total_jobs ?? 0) + (stats?.total_exams ?? 0) + (stats?.total_scholarships ?? 0);

  // Pipeline workflow stats
  const pipelineCards = [
    { label: "Pending Verification", value: stats?.pending_items ?? 0, icon: Clock, color: "bg-[#EEF2FF] text-[#1A3C6E] border-[#3B82F6]/30", href: "/admin/verification" },
    { label: "Approved", value: stats?.approved_items ?? 0, icon: CheckCircle, color: "bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]/40", href: "/admin/approved" },
    { label: "Published", value: published, icon: FileText, color: "bg-[#EFF6FF] text-[#1A3C6E] border-[#3B82F6]/20", href: "/admin/published" },
    { label: "Rejected", value: stats?.rejected_items ?? 0, icon: XCircle, color: "bg-red-50 text-red-700 border-red-200", href: "/admin/rejected" },
    { label: "Duplicates", value: 0, icon: Layers, color: "bg-[#F3F4F6] text-[#374151] border-gray-200", href: "/admin/verification?tab=duplicate" },
    { label: "Failed", value: 0, icon: Activity, color: "bg-[#F9FAFB] text-[#6B7280] border-gray-200", href: "/admin/verification?tab=failed" },
  ];

  const contentCards = [
    { label: "Schemes", value: stats?.total_schemes ?? 0, icon: Layers, color: "bg-[#EEF2FF] text-[#1A3C6E] border-[#3B82F6]/30" },
    { label: "Scholarships", value: stats?.total_scholarships ?? 0, icon: Award, color: "bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]/40" },
    { label: "Jobs", value: stats?.total_jobs ?? 0, icon: Briefcase, color: "bg-[#EFF6FF] text-[#1A3C6E] border-[#3B82F6]/20" },
    { label: "Exams", value: stats?.total_exams ?? 0, icon: TrendingUp, color: "bg-[#F0F5FA] text-[#1A3C6E] border-[#9BB6E5]/30" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-[#111827]/60">
          Pipeline overview, content moderation status, and system metrics
        </p>
      </div>

      {/* Pipeline Workflow Stats */}
      <div>
        <h2 className="text-sm font-semibold text-[#111827]/70 mb-3 uppercase tracking-wide">Pipeline Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {pipelineCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className={`rounded-2xl border p-5 ${card.color} hover:shadow-md transition`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium opacity-80">{card.label}</p>
                  <Icon size={18} />
                </div>
                <p className="mt-2 text-2xl font-bold">{card.value}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content by Type */}
      <div>
        <h2 className="text-sm font-semibold text-[#111827]/70 mb-3 uppercase tracking-wide">Content by Type</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contentCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`rounded-2xl border p-5 ${card.color}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium opacity-80">{card.label}</p>
                  <Icon size={20} />
                </div>
                <p className="mt-3 text-2xl font-bold">{card.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="font-semibold text-[#1A3C6E] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/verification" className="flex items-center gap-3 rounded-xl bg-[#EEF2FF] px-4 py-3 text-sm font-medium text-[#1A3C6E] hover:bg-[#DBEAFE] transition">
              <Clock size={18} />
              Review {stats?.pending_items ?? 0} pending items
            </Link>
            <Link href="/admin/approved" className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-[#1A3C6E] hover:bg-blue-100 transition">
              <CheckCircle size={18} />
              Publish {stats?.approved_items ?? 0} approved items
            </Link>
            <Link href="/admin/rejected" className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition">
              <XCircle size={18} />
              Review {stats?.rejected_items ?? 0} rejected items
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="font-semibold text-[#1A3C6E] mb-4">System Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]/50">
              <span className="text-[#111827]/70">Total Users</span>
              <span className="font-semibold text-[#1A3C6E]">{stats?.total_users ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]/50">
              <span className="text-[#111827]/70">Saved Items</span>
              <span className="font-semibold text-[#1A3C6E]">{stats?.total_saved_items ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]/50">
              <span className="text-[#111827]/70">Notifications</span>
              <span className="font-semibold text-[#1A3C6E]">{stats?.total_notifications ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#111827]/70">Pipeline</span>
              <span className="inline-flex items-center gap-1.5 text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
