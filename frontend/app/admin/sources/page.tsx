"use client";

import { useEffect, useState } from "react";
import type { BackendAdminSource } from "@/lib/api/admin";
import { fetchAdminSources } from "@/lib/api/admin";

export default function SourcesPage() {
  const [sources, setSources] = useState<BackendAdminSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminSources()
      .then(setSources)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">AI Data Sources</h1>
        <p className="mt-2 text-[#111827]/60">
          Manage and monitor data sources used by the BharatLens platform.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-sm font-semibold text-[#1A3C6E]">
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4">Verified By</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {sources.map((source) => (
                <tr key={source.id} className="transition hover:bg-[#F5F3EE]/50">
                  <td className="px-6 py-4 text-sm text-[#111827]">{source.name || source.id}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]">{source.is_verified ? "Yes" : "No"}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]/80">{source.verified_by || "—"}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]/80">
                    {source.created_at ? new Date(source.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="p-6 text-center text-[#111827]/60">Loading sources...</div>
          )}
          {!isLoading && sources.length === 0 && (
            <div className="p-6 text-center text-[#111827]/60">No sources found.</div>
          )}
        </div>
      )}
    </div>
  );
}
