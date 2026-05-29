"use client";

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Recommendations Engine</h1>
        <p className="mt-2 text-[#111827]/60">
          Configure and monitor recommendation matching algorithms
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
        <h2 className="mb-4 font-semibold text-[#1A3C6E]">Matching Criteria</h2>
        <div className="space-y-3 text-[#111827]">
          <p>✓ State Matching: Match by user state</p>
          <p>✓ Category Matching: Match by caste category</p>
          <p>✓ Education Matching: Match by education level</p>
          <p>✓ Age Range Matching: Match by age eligibility</p>
          <p>✓ Income Matching: Match by income criteria</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">Active Matches</h3>
          <div className="text-3xl font-bold text-green-600">15,432</div>
          <p className="mt-2 text-sm text-[#111827]/60">
            User-to-opportunity matches
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">Accuracy Rate</h3>
          <div className="text-3xl font-bold text-blue-600">94.2%</div>
          <p className="mt-2 text-sm text-[#111827]/60">
            Average recommendation accuracy
          </p>
        </div>
      </div>
    </div>
  );
}
