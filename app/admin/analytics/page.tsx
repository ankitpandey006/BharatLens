"use client";

export default function AnalyticsPage() {
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
            Verification Speed
          </h3>
          <div className="text-3xl font-bold text-green-600">2.3 hrs</div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Average time to verify
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Approval Rate
          </h3>
          <div className="text-3xl font-bold text-blue-600">76.8%</div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Items approved vs total
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            System Uptime
          </h3>
          <div className="text-3xl font-bold text-green-600">99.8%</div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Last 30 days
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            AI Accuracy
          </h3>
          <div className="text-3xl font-bold text-yellow-600">87.5%</div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Confidence threshold met
          </p>
        </div>
      </div>
    </div>
  );
}
