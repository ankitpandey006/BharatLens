"use client";

import { useEffect, useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import {
  fetchAdminStats,
  fetchAdminItemsByStatus,
  type BackendAdminStats,
} from "@/lib/api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState<BackendAdminStats | null>(null);
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchAdminStats(), fetchAdminItemsByStatus("published")])
      .then(([statsResponse, publishedItems]) => {
        setStats(statsResponse);
        setPublishedCount(publishedItems.length);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-[#111827]/80">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-8 text-sm text-red-700">
        <p className="font-semibold">Unable to load admin dashboard</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Dashboard</h1>
        <p className="mt-2 text-[#111827]/60">
          Overview of BharatLens admin metrics and content status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          label="Total Users"
          value={stats?.total_users ?? 0}
          color="blue"
          icon="Users"
        />
        <AdminStatCard
          label="Total Schemes"
          value={stats?.total_schemes ?? 0}
          color="green"
          icon="Layers"
        />
        <AdminStatCard
          label="Total Scholarships"
          value={stats?.total_scholarships ?? 0}
          color="yellow"
          icon="Award"
        />
        <AdminStatCard
          label="Total Jobs"
          value={stats?.total_jobs ?? 0}
          color="purple"
          icon="Briefcase"
        />
        <AdminStatCard
          label="Pending Verification"
          value={stats?.pending_items ?? 0}
          color="yellow"
          icon="Clock"
        />
        <AdminStatCard
          label="Unread Notifications"
          value={stats?.total_notifications ?? 0}
          color="red"
          icon="Bell"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h3 className="mb-6 font-semibold text-[#1A3C6E]">Content Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Approved Items</span>
              <span className="font-semibold text-[#1A3C6E]">
                {stats?.approved_items ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Rejected Items</span>
              <span className="font-semibold text-[#1A3C6E]">
                {stats?.rejected_items ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Published Items</span>
              <span className="font-semibold text-[#1A3C6E]">
                {publishedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Saved Items</span>
              <span className="font-semibold text-[#1A3C6E]">
                {stats?.total_saved_items ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h3 className="mb-6 font-semibold text-[#1A3C6E]">Category Breakdown</h3>
          <div className="space-y-4 text-[#111827]/70">
            <p>
              Total schemes: <span className="font-semibold text-[#111827]">{stats?.total_schemes ?? 0}</span>
            </p>
            <p>
              Total scholarships: <span className="font-semibold text-[#111827]">{stats?.total_scholarships ?? 0}</span>
            </p>
            <p>
              Total jobs: <span className="font-semibold text-[#111827]">{stats?.total_jobs ?? 0}</span>
            </p>
            <p>
              Total exams: <span className="font-semibold text-[#111827]">{stats?.total_exams ?? 0}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
