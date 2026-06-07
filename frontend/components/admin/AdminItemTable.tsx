"use client";

import { format } from "date-fns";
import StatusBadge from "./StatusBadge";
import type { BackendAdminContentItem } from "@/lib/api/admin";
import type { ItemStatus } from "@/types/admin";

interface AdminItemTableProps {
  items: BackendAdminContentItem[];
  isLoading?: boolean;
  onRowClick?: (item: BackendAdminContentItem) => void;
}

const statusValues: ItemStatus[] = [
  "ai_processed",
  "pending_verification",
  "approved",
  "rejected",
  "published",
];

function normalizeStatus(status?: string): ItemStatus {
  if (!status) {
    return "pending_verification";
  }

  const s = String(status).toLowerCase();

  // Map DB processing_status values to UI statuses
  if (s === "collected" || s === "ai_processed") return "pending_verification";
  if (s === "processing") return "approved";
  if (s === "failed") return "rejected";
  if (s === "processed") return "published";

  if (statusValues.includes(s as ItemStatus)) {
    return s as ItemStatus;
  }

  return "pending_verification";
}

export default function AdminItemTable({
  items,
  isLoading = false,
  onRowClick,
}: AdminItemTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-12">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#3B82F6]" />
          </div>
          <p className="text-[#111827]/60">Loading admin items...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-12">
        <div className="text-center">
          <p className="text-lg font-medium text-[#111827]">No items found</p>
          <p className="mt-2 text-sm text-[#111827]/60">
            Adjust filters or return after new content is processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
      <table className="min-w-180 w-full">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-sm font-semibold text-[#1A3C6E]">
            <th className="px-4 py-4">Title</th>
            <th className="px-4 py-4">Type</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">Published</th>
            <th className="px-4 py-4">Updated</th>
            <th className="px-4 py-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {items.map((item) => {
            const title = item.title || (item as any).raw_title || "Untitled Item";
            const itemType = item.item_type || (item as any).type || "scheme";
            const status = normalizeStatus((item as any).processing_status || item.verification_status || item.status);
            const publishedAt = item.published_at ? format(new Date(item.published_at), "MMM dd, yyyy") : "-";
            const updatedAt = item.updated_at || item.created_at;
            const updatedLabel = updatedAt ? format(new Date(updatedAt), "MMM dd, yyyy") : "-";

            return (
              <tr
                key={item.id}
                className={`transition ${onRowClick ? "cursor-pointer hover:bg-[#F5F3EE]/50" : ""}`}
              >
                <td className="px-4 py-4 align-top text-sm text-[#111827]" onClick={() => onRowClick?.(item)}>
                  {title}
                </td>
                <td className="px-4 py-4 align-top text-sm text-[#111827]" onClick={() => onRowClick?.(item)}>
                  {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </td>
                <td className="px-4 py-4 align-top" onClick={() => onRowClick?.(item)}>
                  <StatusBadge status={status} size="sm" />
                </td>
                <td className="px-4 py-4 align-top text-sm text-[#111827]" onClick={() => onRowClick?.(item)}>
                  {publishedAt}
                </td>
                <td className="px-4 py-4 align-top text-sm text-[#111827]" onClick={() => onRowClick?.(item)}>
                  {updatedLabel}
                </td>
                <td className="px-4 py-4 align-top">
                  <button
                    type="button"
                    onClick={() => onRowClick?.(item)}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
                  >
                    Review
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
