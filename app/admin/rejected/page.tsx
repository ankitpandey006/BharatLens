"use client";

import { useState } from "react";
import {
  getDummyAdminItems,
  filterAdminItems,
  sortAdminItems,
} from "@/lib/dummyAdminData";
import FilterBar from "@/components/admin/FilterBar";
import VerificationTable from "@/components/admin/VerificationTable";
import VerificationDetailPanel from "@/components/admin/VerificationDetailPanel";
import type { AdminItem, FilterState } from "@/types/admin";

export default function RejectedPage() {
  const allRejected = getDummyAdminItems().filter(
    (item) => item.status === "rejected"
  );
  const [selectedItem, setSelectedItem] = useState<AdminItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    status: "all",
    state: "",
    source: "",
    sortBy: "latest",
    sortOrder: "desc",
  });
  const [items, setItems] = useState<AdminItem[]>(allRejected);

  const states = Array.from(new Set(allRejected.map((item) => item.state)));
  const sources = Array.from(
    new Set(allRejected.map((item) => item.sourceName))
  );

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    let filtered = filterAdminItems(allRejected, {
      search: updatedFilters.search,
      type: updatedFilters.type === "all" ? undefined : updatedFilters.type,
      state: updatedFilters.state || undefined,
      source: updatedFilters.source || undefined,
    });

    filtered = sortAdminItems(
      filtered,
      updatedFilters.sortBy,
      updatedFilters.sortOrder
    );
    setItems(filtered);
  };

  const handleRowClick = (item: AdminItem) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: AdminItem["status"]) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Rejected Items</h1>
        <p className="mt-2 text-[#111827]/60">
          Items that were rejected or need reconsideration
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        states={states}
        sources={sources}
      />

      <VerificationTable items={items} onRowClick={handleRowClick} />

      <VerificationDetailPanel
        item={selectedItem}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
