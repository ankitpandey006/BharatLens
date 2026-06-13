"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { BackendAdminContentItem } from "@/lib/api/admin";
import type { ItemStatus } from "@/types/admin";

interface ModerationTableProps {
  items: BackendAdminContentItem[];
  isLoading?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onPreview?: (item: BackendAdminContentItem) => void;
  onApprove?: (item: BackendAdminContentItem) => void;
  onReject?: (item: BackendAdminContentItem) => void;
  onPublish?: (item: BackendAdminContentItem) => void;
  onUnpublish?: (item: BackendAdminContentItem) => void;
  onRestore?: (item: BackendAdminContentItem) => void;
  onDelete?: (item: BackendAdminContentItem) => void;
  onEdit?: (item: BackendAdminContentItem) => void;
  showActions?: ("preview" | "edit" | "approve" | "reject" | "publish" | "unpublish" | "restore" | "delete")[];
  /** Tracks which row action is currently loading: { [itemId]: "approve" | "reject" | ... | null } */
  rowActionLoading?: Record<string, string | null>;
}

/** Shared button class for row action buttons */
const btnBase = "rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1";

const VARIANT_CLASSES: Record<string, string> = {
  preview: "border border-[#E5E7EB] bg-white text-[#1A3C6E] hover:bg-[#F5F3EE]",
  edit: "border border-[#E5E7EB] bg-white text-indigo-700 hover:bg-indigo-50",
  approve: "bg-green-50 text-green-700 hover:bg-green-100",
  reject: "bg-red-50 text-red-700 hover:bg-red-100",
  publish: "bg-green-600 text-white hover:bg-green-700",
  unpublish: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  restore: "bg-blue-50 text-[#1A3C6E] hover:bg-blue-100",
  delete: "bg-red-50 text-red-700 hover:bg-red-100",
};

function getItemTitle(item: BackendAdminContentItem): string {
  const r = item as Record<string, unknown>;
  return String(r.title || r.raw_title || "Untitled");
}

function getItemType(item: BackendAdminContentItem): string {
  const r = item as Record<string, unknown>;
  return String(r.item_type || r.type || "scheme");
}

function getContentAction(item: BackendAdminContentItem): string | undefined {
  const r = item as Record<string, unknown>;
  return (r.content_action as string) || undefined;
}

function getItemStatus(item: BackendAdminContentItem): ItemStatus {
  const r = item as Record<string, unknown>;
  const s = String(r.verification_status || r.status || "");
  const valid: ItemStatus[] = [
    "pending", "verified_ready", "approved", "rejected", "published",
    "duplicate", "failed", "ai_processed", "pending_verification",
  ];
  const lower = s.toLowerCase();
  if (valid.includes(lower as ItemStatus)) return lower as ItemStatus;
  if (lower === "collected") return "pending_verification";
  return "pending_verification";
}

function getSourceName(item: BackendAdminContentItem): string {
  const r = item as Record<string, unknown>;
  return String(r.source_name || r.sourceName || "-");
}

function getAiScore(item: BackendAdminContentItem): number {
  const r = item as Record<string, unknown>;
  return Number(r.verification_score || r.ai_confidence_score || r.ai_confidence || 0);
}

function getConfidence(item: BackendAdminContentItem): number {
  const r = item as Record<string, unknown>;
  return Number(r.ai_confidence_score || r.ai_confidence || r.verification_score || 0);
}

function getDuplicateReason(item: BackendAdminContentItem): string | null {
  const r = item as Record<string, unknown>;
  return (r.duplicate_reason as string) || null;
}

function getCollectedDate(item: BackendAdminContentItem): string | null {
  const r = item as Record<string, unknown>;
  return (r.collected_at || r.created_at) as string | null;
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-50 text-red-700 border-red-200";
  if (score >= 80) color = "bg-green-50 text-green-700 border-green-200";
  else if (score >= 60) color = "bg-blue-50 text-[#1A3C6E] border-[#3B82F6]/30";
  else if (score >= 40) color = "bg-yellow-50 text-yellow-700 border-yellow-200";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${color}`}>
      {score}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    notification: "bg-gray-50 text-gray-700 border-gray-200",
    apply: "bg-green-50 text-green-700 border-green-200",
    admit_card: "bg-orange-50 text-orange-700 border-orange-200",
    result: "bg-blue-50 text-blue-700 border-blue-200",
    answer_key: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const color = colors[action] || colors.notification;
  const label = action.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

/** Render a single action button with loading spinner */
function ActionButton({
  label,
  actionKey,
  onClick,
  variant,
  isLoading,
  isRowDisabled,
}: {
  label: string;
  actionKey: string;
  onClick: () => void;
  variant: string;
  isLoading: boolean;
  isRowDisabled: boolean;
}) {
  const disabled = isLoading || isRowDisabled;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${btnBase} ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.preview}`}
    >
      {isLoading && <Loader2 size={12} className="animate-spin shrink-0" />}
      {label}
    </button>
  );
}

export default function ModerationTable({
  items,
  isLoading = false,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onPreview,
  onApprove,
  onReject,
  onPublish,
  onUnpublish,
  onRestore,
  onDelete,
  onEdit,
  showActions = ["preview", "approve", "reject"],
  rowActionLoading = {},
}: ModerationTableProps) {
  const allSelected = useMemo(
    () => items.length > 0 && selectedIds?.size === items.length,
    [items.length, selectedIds],
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="animate-pulse space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-14 ${i > 0 ? "border-t border-[#E5E7EB]" : ""} flex items-center px-4`}>
              <div className="flex-1">
                <div className="h-4 w-48 rounded bg-[#E5E7EB]/70" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-[#E5E7EB]/50" />
                <div className="h-6 w-16 rounded bg-[#E5E7EB]/50" />
              </div>
            </div>
          ))}
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
            Items will appear here as they move through the pipeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-xs font-semibold uppercase tracking-wide text-[#1A3C6E]">
            {onToggleSelect && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-[#D1D5DB]"
                />
              </th>
            )}
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Sub Type</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {items.map((item) => {
            const title = getItemTitle(item);
            const source = getSourceName(item);
            const itemType = getItemType(item);
            const contentAction = getContentAction(item);
            const status = getItemStatus(item);
            const aiScore = getAiScore(item);
            const confidence = getConfidence(item);
            const dupReason = getDuplicateReason(item);
            const collectedDate = getCollectedDate(item);
            const isSelected = selectedIds?.has(item.id);
            const itemLoading = rowActionLoading[item.id] ?? null;

            return (
              <tr
                key={item.id}
                className={`transition hover:bg-[#F5F3EE]/40 ${isSelected ? "bg-blue-50/30" : ""}`}
              >
                {onToggleSelect && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="rounded border-[#D1D5DB]"
                    />
                  </td>
                )}
                <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-[#111827]">
                  {title}
                  {dupReason && (
                    <span className="ml-2 inline-flex items-center rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
                      Duplicate
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#111827]/70">{source}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-[#F5F3EE] px-2 py-0.5 text-xs font-medium text-[#1A3C6E]">
                    {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(itemType === "job" || itemType === "exam") && contentAction
                    ? <ActionBadge action={contentAction} />
                    : <span className="text-xs text-[#111827]/40">-</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={aiScore} />
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={confidence} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} size="sm" />
                </td>
                <td className="px-4 py-3 text-xs text-[#111827]/70">
                  {collectedDate ? format(new Date(collectedDate), "MMM dd") : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {showActions.includes("preview") && onPreview && (
                      <ActionButton
                        label="Preview"
                        actionKey="preview"
                        onClick={() => onPreview(item)}
                        variant="preview"
                        isLoading={itemLoading === "preview"}
                        isRowDisabled={false}
                      />
                    )}
                    {showActions.includes("edit") && onEdit && (
                      <ActionButton
                        label="Edit"
                        actionKey="edit"
                        onClick={() => onEdit(item)}
                        variant="edit"
                        isLoading={itemLoading === "edit"}
                        isRowDisabled={false}
                      />
                    )}
                    {showActions.includes("approve") && onApprove && (
                      <ActionButton
                        label="Approve"
                        actionKey="approve"
                        onClick={() => onApprove(item)}
                        variant="approve"
                        isLoading={itemLoading === "approve"}
                        isRowDisabled={itemLoading !== null && itemLoading !== "approve"}
                      />
                    )}
                    {showActions.includes("reject") && onReject && (
                      <ActionButton
                        label="Reject"
                        actionKey="reject"
                        onClick={() => onReject(item)}
                        variant="reject"
                        isLoading={itemLoading === "reject"}
                        isRowDisabled={itemLoading !== null && itemLoading !== "reject"}
                      />
                    )}
                    {showActions.includes("publish") && onPublish && (
                      <ActionButton
                        label="Publish"
                        actionKey="publish"
                        onClick={() => onPublish(item)}
                        variant="publish"
                        isLoading={itemLoading === "publish"}
                        isRowDisabled={itemLoading !== null && itemLoading !== "publish"}
                      />
                    )}
                    {showActions.includes("unpublish") && onUnpublish && (
                      <ActionButton
                        label="Unpublish"
                        actionKey="unpublish"
                        onClick={() => onUnpublish(item)}
                        variant="unpublish"
                        isLoading={itemLoading === "unpublish"}
                        isRowDisabled={itemLoading !== null && itemLoading !== "unpublish"}
                      />
                    )}
                    {showActions.includes("restore") && onRestore && (
                      <ActionButton
                        label="Restore"
                        actionKey="restore"
                        onClick={() => onRestore(item)}
                        variant="restore"
                        isLoading={itemLoading === "restore"}
                        isRowDisabled={itemLoading !== null && itemLoading !== "restore"}
                      />
                    )}
                    {showActions.includes("delete") && onDelete && (
                      <ActionButton
                        label="Delete"
                        actionKey="delete"
                        onClick={() => onDelete(item)}
                        variant="delete"
                        isLoading={itemLoading === "delete"}
                        isRowDisabled={itemLoading !== null && itemLoading !== "delete"}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Mobile Card View ── */}
      <div className="space-y-3 p-4 md:hidden">
        {items.map((item) => {
          const title = getItemTitle(item);
          const status = getItemStatus(item);
          const collectedDate = getCollectedDate(item);
          const isSelected = selectedIds?.has(item.id);
          const itemLoading = rowActionLoading[item.id] ?? null;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                isSelected ? "border-[#3B82F6] ring-2 ring-[#3B82F6]/20" : "border-[#E5E7EB]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {onToggleSelect && (
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="mt-0.5 rounded border-[#D1D5DB]"
                    />
                  )}
                  <p
                    className="flex-1 text-sm font-semibold text-[#111827] leading-snug line-clamp-2 cursor-pointer"
                    onClick={() => onPreview?.(item)}
                  >
                    {title}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={status} size="sm" />
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#111827]/70">
                <span>Updated: {collectedDate ? format(new Date(collectedDate), "MMM dd") : "-"}</span>
              </div>

              {/* Mobile action buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {showActions.includes("preview") && onPreview && (
                  <ActionButton
                    label="Preview"
                    actionKey="preview"
                    onClick={() => onPreview(item)}
                    variant="preview"
                    isLoading={itemLoading === "preview"}
                    isRowDisabled={false}
                  />
                )}
                {showActions.includes("approve") && onApprove && (
                  <ActionButton
                    label="Approve"
                    actionKey="approve"
                    onClick={() => onApprove(item)}
                    variant="approve"
                    isLoading={itemLoading === "approve"}
                    isRowDisabled={itemLoading !== null && itemLoading !== "approve"}
                  />
                )}
                {showActions.includes("reject") && onReject && (
                  <ActionButton
                    label="Reject"
                    actionKey="reject"
                    onClick={() => onReject(item)}
                    variant="reject"
                    isLoading={itemLoading === "reject"}
                    isRowDisabled={itemLoading !== null && itemLoading !== "reject"}
                  />
                )}
                {showActions.includes("publish") && onPublish && (
                  <ActionButton
                    label="Publish"
                    actionKey="publish"
                    onClick={() => onPublish(item)}
                    variant="publish"
                    isLoading={itemLoading === "publish"}
                    isRowDisabled={itemLoading !== null && itemLoading !== "publish"}
                  />
                )}
                {showActions.includes("unpublish") && onUnpublish && (
                  <ActionButton
                    label="Unpublish"
                    actionKey="unpublish"
                    onClick={() => onUnpublish(item)}
                    variant="unpublish"
                    isLoading={itemLoading === "unpublish"}
                    isRowDisabled={itemLoading !== null && itemLoading !== "unpublish"}
                  />
                )}
                {showActions.includes("restore") && onRestore && (
                  <ActionButton
                    label="Restore"
                    actionKey="restore"
                    onClick={() => onRestore(item)}
                    variant="restore"
                    isLoading={itemLoading === "restore"}
                    isRowDisabled={itemLoading !== null && itemLoading !== "restore"}
                  />
                )}
                {showActions.includes("delete") && onDelete && (
                  <ActionButton
                    label="Delete"
                    actionKey="delete"
                    onClick={() => onDelete(item)}
                    variant="delete"
                    isLoading={itemLoading === "delete"}
                    isRowDisabled={itemLoading !== null && itemLoading !== "delete"}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
