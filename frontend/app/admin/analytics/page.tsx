"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api/admin";
import type { AdminStats } from "@/types/admin";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getAdminStats();
        setStats(response);
      } catch (error) {
        console.error("Failed to load analytics stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const activeApprovalRate = stats
    ? Math.round((stats.approved / Math.max(1, stats.totalAiItems)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Analytics</h1>
        <p className="mt-2 text-[#111827]/60">
          System performance and verification metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Total AI Items
          </h3>
          <div className="text-3xl font-bold text-green-600">
            {loading ? "..." : stats?.totalAiItems ?? 0}
          </div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Items processed by the AI pipeline
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Approval Rate
          </h3>
          <div className="text-3xl font-bold text-blue-600">
            {loading ? "..." : `${activeApprovalRate}%`}
          </div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Items approved versus total AI items
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Pending Verification
          </h3>
          <div className="text-3xl font-bold text-yellow-600">
            {loading ? "..." : stats?.pendingVerification ?? 0}
          </div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Items waiting for review
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Published Content
          </h3>
          <div className="text-3xl font-bold text-green-600">
            {loading ? "..." : stats?.published ?? 0}
          </div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Items published to recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
