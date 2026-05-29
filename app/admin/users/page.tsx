"use client";

export default function UsersPage() {
  const stats = [
    { label: "Total Users", value: "12,534", color: "blue" },
    { label: "Active This Week", value: "3,421", color: "green" },
    { label: "Verified", value: "9,876", color: "blue" },
    { label: "New This Month", value: "1,234", color: "yellow" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">User Management</h1>
        <p className="mt-2 text-[#111827]/60">
          Monitor and manage BharatLens user base
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
          >
            <p className="text-sm text-[#111827]/60">{stat.label}</p>
            <div className="mt-2 text-2xl font-bold text-[#1A3C6E]">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
        <h2 className="mb-6 font-semibold text-[#1A3C6E]">
          Demographic Distribution
        </h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>SC/ST</span>
              <span className="font-medium">34%</span>
            </div>
            <div className="h-2 rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: "34%" }}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>OBC</span>
              <span className="font-medium">28%</span>
            </div>
            <div className="h-2 rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: "28%" }}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>General</span>
              <span className="font-medium">38%</span>
            </div>
            <div className="h-2 rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{ width: "38%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
