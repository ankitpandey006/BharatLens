"use client";

import { useEffect, useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { getAdminStats } from "@/lib/api/admin";
import type { AdminStats } from "@/types/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getAdminStats();
        setStats(response);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const summary = stats ?? {
    totalAiItems: 0,
    pendingVerification: 0,
    approved: 0,
    rejected: 0,
    published: 0,
    highPriorityAlerts: 0,
  };

  const typeBreakdown = {
    scheme: 0,
    scholarship: 0,
    job: 0,
    exam: 0,
    update: 0,
  };

  const categoryBreakdown = {
    sc_st: 0,
    obc: 0,
    women: 0,
    general: 0,
    other: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Dashboard</h1>
        <p className="mt-2 text-[#111827]/60">
          Overview of your AI data verification system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          label="Total AI Items"
          value={loading ? "..." : summary.totalAiItems}
          color="blue"
          icon="Database"
        />
        <AdminStatCard
          label="Pending Verification"
          value={loading ? "..." : summary.pendingVerification}
          color="yellow"
          icon="Clock"
        />
        <AdminStatCard
          label="Approved"
          value={loading ? "..." : summary.approved}
          color="blue"
          icon="CheckCircle"
        />
        <AdminStatCard
          label="Rejected"
          value={loading ? "..." : summary.rejected}
          color="red"
          icon="XCircle"
        />
        <AdminStatCard
          label="Published"
          value={loading ? "..." : summary.published}
          color="green"
          icon="Send"
        />
        <AdminStatCard
          label="High Priority Alerts"
          value={loading ? "..." : summary.highPriorityAlerts}
          color="purple"
          icon="AlertCircle"
          trend={-5}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h3 className="mb-6 font-semibold text-[#1A3C6E]">
            Items by Type
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Schemes</span>
              <span className="font-semibold text-[#1A3C6E]">
                {typeBreakdown.scheme}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Scholarships</span>
              <span className="font-semibold text-[#1A3C6E]">
                {typeBreakdown.scholarship}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Jobs</span>
              <span className="font-semibold text-[#1A3C6E]">
                {typeBreakdown.job}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Exams</span>
              <span className="font-semibold text-[#1A3C6E]">
                {typeBreakdown.exam}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Updates</span>
              <span className="font-semibold text-[#1A3C6E]">
                {typeBreakdown.update}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <h3 className="mb-6 font-semibold text-[#1A3C6E]">
            Items by Category
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">SC/ST</span>
              <span className="font-semibold text-[#1A3C6E]">
                {categoryBreakdown.sc_st}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">OBC</span>
              <span className="font-semibold text-[#1A3C6E]">
                {categoryBreakdown.obc}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Women</span>
              <span className="font-semibold text-[#1A3C6E]">
                {categoryBreakdown.women}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">General</span>
              <span className="font-semibold text-[#1A3C6E]">
                {categoryBreakdown.general}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]/70">Other Categories</span>
              <span className="font-semibold text-[#1A3C6E]">
                {categoryBreakdown.other}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
