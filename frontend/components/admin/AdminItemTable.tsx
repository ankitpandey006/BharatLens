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

function getItemTitle(item: BackendAdminContentItem): string {
  const record = item as Record<string, unknown>;
  return String(record.title || record.raw_title || "Untitled Item");
}

function getItemType(item: BackendAdminContentItem): string {
  const record = item as Record<string, unknown>;
  const itemType = String(record.type || record.item_type || "scheme");
  return itemType.charAt(0).toUpperCase() + itemType.slice(1);
}

function getItemStatus(item: BackendAdminContentItem): ItemStatus {
  const record = item as Record<string, unknown>;
  return normalizeStatus(String(record.verification_status || record.status || ""));
}

function normalizeStatus(status?: string): ItemStatus {
  if (!status) {
    return "pending_verification";
  }

  const s = String(status).toLowerCase();

  // Direct passthrough for known verification_status values from backend
  const validStatuses: ItemStatus[] = [
    "pending", "verified_ready", "approved", "rejected", "published",
    "duplicate", "failed", "ai_processed", "pending_verification",
  ];

  if (validStatuses.includes(s as ItemStatus)) {
    return s as ItemStatus;
  }

  // Map legacy processing_status values
  if (s === "collected") return "pending_verification";
  if (s === "processing") return "approved";
  if (s === "processed") return "published";
  if (s === "failed") return "failed";

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
    <>
      {/* ── Desktop Table View ── */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white md:block">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-sm font-semibold text-[#1A3C6E]">
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Action</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Published</th>
              <th className="px-4 py-4">Updated</th>
              <th className="px-4 py-4">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {items.map((item) => {
              const title = getItemTitle(item);
              const itemType = getItemType(item);
              const status = getItemStatus(item);
              const publishedAt = item.published_at ? format(new Date(item.published_at), "MMM dd, yyyy") : "-";
              const updatedAt = item.updated_at || item.created_at;
              const updatedLabel = updatedAt ? format(new Date(updatedAt), "MMM dd, yyyy") : "-";

              const record = item as Record<string, unknown>;
              const contentAction = (record.content_action || record.sub_category) as string | undefined;
              const actionLabel = contentAction
                ? contentAction.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                : '-';

              return (
                <tr
                  key={item.id}
                  className={`transition ${onRowClick ? "cursor-pointer hover:bg-[#F5F3EE]/50" : ""}`}
                >
                  <td className="max-w-xs truncate px-4 py-4 align-top text-sm text-[#111827]" onClick={() => onRowClick?.(item)}>
                    {title}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-[#111827]" onClick={() => onRowClick?.(item)}>
                    {itemType}
                  </td>
                  <td className="px-4 py-4 align-top text-sm" onClick={() => onRowClick?.(item)}>
                    {contentAction ? (
                      <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {actionLabel}
                      </span>
                    ) : (
                      <span className="text-xs text-[#111827]/40">-</span>
                    )}
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

      {/* ── Mobile Card View ── */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const title = getItemTitle(item);
          const itemType = getItemType(item);
          const status = getItemStatus(item);
          const publishedAt = item.published_at ? format(new Date(item.published_at), "MMM dd, yyyy") : "-";
          const updatedAt = item.updated_at || item.created_at;

          return (
            <div
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className="cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:border-[#9BB6E5] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm font-semibold text-[#111827] leading-snug line-clamp-2">
                  {title}
                </p>
                <div className="shrink-0">
                  <StatusBadge status={status} size="sm" />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#111827]/70">
                <span className="rounded-md bg-[#F5F3EE] px-2 py-0.5 font-medium text-[#1A3C6E]">
                  {itemType}
                </span>
                <span>Published: {publishedAt}</span>
                <span>Updated: {updatedAt ? format(new Date(updatedAt), "MMM dd, yyyy") : "-"}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick?.(item);
                }}
                className="mt-3 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-medium text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
              >
                Review
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
