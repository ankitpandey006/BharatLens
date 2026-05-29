"use client";

import { getDummyAdminItems, getDummyAdminStats } from "@/lib/dummyAdminData";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function AdminDashboard() {
  const stats = getDummyAdminStats();
  const allItems = getDummyAdminItems();

  // Calculate breakdowns
  const typeBreakdown = {
    scheme: allItems.filter(i => i.type === "scheme").length,
    scholarship: allItems.filter(i => i.type === "scholarship").length,
    job: allItems.filter(i => i.type === "job").length,
    exam: allItems.filter(i => i.type === "exam").length,
    update: allItems.filter(i => i.type === "update").length,
  };

  const categoryBreakdown = {
    sc_st: allItems.filter(i => i.category === "sc" || i.category === "st").length,
    obc: allItems.filter(i => i.category === "obc").length,
    women: allItems.filter(i => i.category === "women").length,
    general: allItems.filter(i => i.category === "general").length,
    other: allItems.filter(i => 
      !["sc", "st", "obc", "women", "general"].includes(i.category)
    ).length,
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
          value={stats.totalAiItems}
          color="blue"
          icon="Database"
        />
        <AdminStatCard
          label="Pending Verification"
          value={stats.pendingVerification}
          color="yellow"
          icon="Clock"
        />
        <AdminStatCard
          label="Approved"
          value={stats.approved}
          color="blue"
          icon="CheckCircle"
        />
        <AdminStatCard
          label="Rejected"
          value={stats.rejected}
          color="red"
          icon="XCircle"
        />
        <AdminStatCard
          label="Published"
          value={stats.published}
          color="green"
          icon="Send"
        />
        <AdminStatCard
          label="High Priority Alerts"
          value={stats.highPriorityAlerts}
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
