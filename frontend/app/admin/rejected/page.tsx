"use client";

import { useMemo, useState } from "react";
import AdminItemTable from "@/components/admin/AdminItemTable";
import VerificationDetailPanel from "@/components/admin/VerificationDetailPanel";
import { fetchAdminItemsByStatus, type BackendAdminContentItem } from "@/lib/api/admin";
import { mapBackendItemToAdminItem } from "@/lib/api/admin-utils";
import useSWR from "swr";

export default function RejectedPage() {
  const [selected, setSelected] = useState<BackendAdminContentItem | null>(null);
  const [search, setSearch] = useState("");

  const { data: items, error, isLoading, mutate } = useSWR(
    "admin/rejected",
    () => fetchAdminItemsByStatus("rejected"),
    { dedupingInterval: 10000, revalidateOnFocus: false },
  );

  const filteredItems = useMemo(
    () => (items ?? []).filter((item) => {
      const needle = search.trim().toLowerCase();
      if (!needle) return true;
      return (
        item.title?.toLowerCase().includes(needle) ||
        String(item.description ?? "").toLowerCase().includes(needle) ||
        String(item.source_name ?? "").toLowerCase().includes(needle)
      );
    }),
    [items, search],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Rejected Items</h1>
        <p className="mt-2 text-[#111827]/60">Items that were rejected by the verification workflow.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rejected items..."
          className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 sm:py-3" />
        <button type="button" onClick={() => mutate()} className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A3C6E] transition hover:bg-[#F5F3EE] sm:py-3">Refresh</button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">{error instanceof Error ? error.message : String(error)}</div>
      ) : (
        <>
          <AdminItemTable items={filteredItems} isLoading={isLoading} onRowClick={(item) => setSelected(item)} />
          <VerificationDetailPanel
            item={selected ? mapBackendItemToAdminItem(selected) : null}
            isOpen={Boolean(selected)}
            onClose={() => setSelected(null)}
            onStatusChange={() => { mutate(); }}
            onActionComplete={() => { setSelected(null); mutate(); }}
          />
        </>
      )}
    </div>
  );
}
