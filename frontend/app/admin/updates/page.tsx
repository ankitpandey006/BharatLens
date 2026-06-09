"use client";

import { fetchAdminUpdates } from "@/lib/api/admin";
import useSWR from "swr";

export default function UpdatesPage() {
  const { data: updates, error, isLoading } = useSWR("admin/updates", fetchAdminUpdates, {
    dedupingInterval: 10000,
    revalidateOnFocus: false,
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Recent Updates</h1>
        <p className="mt-2 text-[#111827]/60">View recent data collection and system updates.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">{error instanceof Error ? error.message : String(error)}</div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : !updates || updates.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[#111827]/60">No updates available.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-sm font-semibold text-[#1A3C6E]">
                <th className="px-6 py-4">Title</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {updates.map((update) => (
                <tr key={update.id} className="transition hover:bg-[#F5F3EE]/50">
                  <td className="px-6 py-4 text-sm font-medium text-[#111827]">{update.title || "—"}</td>
                  <td className="max-w-md truncate px-6 py-4 text-sm text-[#111827]/80">{update.description || "—"}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]/80">{update.updated_at ? new Date(update.updated_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
