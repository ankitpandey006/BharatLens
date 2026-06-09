"use client";

import { useAdminStats } from "@/hooks/useApi";

export default function AnalyticsPage() {
  const { data: stats, error, isLoading } = useAdminStats();

  const approvalRate = stats
    ? Math.round((stats.approved_items / Math.max(stats.approved_items + stats.rejected_items, 1)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Analytics</h1>
        <p className="mt-2 text-[#111827]/60">System performance and verification metrics</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">{error instanceof Error ? error.message : String(error)}</div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#E5E7EB]/50" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <h3 className="mb-4 font-semibold text-[#1A3C6E]">Approval Rate</h3>
            <div className="text-3xl font-bold text-blue-600">{approvalRate}%</div>
            <p className="mt-2 text-sm text-[#111827]/60">Items approved vs rejected</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <h3 className="mb-4 font-semibold text-[#1A3C6E]">Total Notifications</h3>
            <div className="text-3xl font-bold text-green-600">{stats?.total_notifications ?? 0}</div>
            <p className="mt-2 text-sm text-[#111827]/60">Notifications handled by the system</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <h3 className="mb-4 font-semibold text-[#1A3C6E]">Pending Verification</h3>
            <div className="text-3xl font-bold text-yellow-600">{stats?.pending_items ?? 0}</div>
            <p className="mt-2 text-sm text-[#111827]/60">Items waiting for review</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <h3 className="mb-4 font-semibold text-[#1A3C6E]">Saved Items</h3>
            <div className="text-3xl font-bold text-purple-600">{stats?.total_saved_items ?? 0}</div>
            <p className="mt-2 text-sm text-[#111827]/60">Total items saved by users</p>
          </div>
        </div>
      )}
    </div>
  );
}
