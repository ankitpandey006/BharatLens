"use client";

export default function SourcesPage() {
  const sources = [
    {
      id: "1",
      name: "Ministry of Education",
      trustScore: 99,
      itemsProcessed: 342,
      category: "Government",
    },
    {
      id: "2",
      name: "AICTE",
      trustScore: 97,
      itemsProcessed: 156,
      category: "Government",
    },
    {
      id: "3",
      name: "State Employment Exchange",
      trustScore: 85,
      itemsProcessed: 89,
      category: "Government",
    },
    {
      id: "4",
      name: "Educational News Portal",
      trustScore: 72,
      itemsProcessed: 234,
      category: "Third-party",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">AI Data Sources</h1>
        <p className="mt-2 text-[#111827]/60">
          Manage and monitor AI data collection sources
        </p>
      </div>

      <div className="grid gap-6">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div>
              <h3 className="font-semibold text-[#1A3C6E]">{source.name}</h3>
              <p className="text-sm text-[#111827]/60">{source.category}</p>
            </div>
            <div className="flex w-full justify-between gap-4 sm:w-auto sm:justify-start sm:gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {source.trustScore}%
                </div>
                <p className="text-xs text-[#111827]/60">Trust Score</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#1A3C6E]">
                  {source.itemsProcessed}
                </div>
                <p className="text-xs text-[#111827]/60">Items Processed</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
