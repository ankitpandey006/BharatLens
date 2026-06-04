"use client";

import { useEffect, useState } from "react";
import type { BackendAdminUpdate } from "@/lib/api/admin";
import { fetchAdminUpdates } from "@/lib/api/admin";

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<BackendAdminUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminUpdates()
      .then(setUpdates)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] mb-2">Content Updates</h1>
        <p className="text-[#111827]/60">Track recent content updates and change history.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center text-[#111827]/60">
              Loading updates...
            </div>
          ) : updates.length > 0 ? (
            updates.map((update) => (
              <div
                key={update.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1A3C6E]">
                      {update.title || `Update ${update.id}`}
                    </h2>
                    <p className="text-sm text-[#111827]/70">
                      {update.description || "No description available."}
                    </p>
                  </div>
                  <div className="text-sm text-[#111827]/60">
                    {update.created_at ? new Date(update.created_at).toLocaleDateString() : "Unknown date"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center text-[#111827]/60">
              No update records found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
