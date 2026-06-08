"use client";

import { useEffect, useMemo, useState } from "react";
import {
  approveCollectedData,
  rejectCollectedData,
  editCollectedData,
  publishCollectedData,
  unpublishCollectedData,
  deleteCollectedData,
} from "@/lib/api/admin";
import { X, Copy, ExternalLink } from "lucide-react";
import type { AdminItem } from "@/types/admin";
import StatusBadge from "./StatusBadge";
import ConfidenceBadge from "./ConfidenceBadge";
import SourceBadge from "./SourceBadge";

type PublishType = "scheme" | "scholarship" | "job" | "exam";

interface VerificationDetailPanelProps {
  item: AdminItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: AdminItem["status"]) => void;
  onActionComplete?: () => void;
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

/** Cast item to Record for dynamic property access */
function asRecord(item: AdminItem | Record<string, unknown>): Record<string, unknown> {
  return item as unknown as Record<string, unknown>;
}

function getRaw(item: AdminItem | null | undefined): Record<string, unknown> {
  const r = asRecord(item ?? {});
  return (r.raw_data as Record<string, unknown>) || (r.rawData as Record<string, unknown>) || {};
}

function getTargetId(item: AdminItem): string {
  const r = asRecord(item);
  return (
    (r.collected_data_id as string) ||
    (r.collectedDataId as string) ||
    (r.collectedId as string) ||
    item.id
  );
}

function normalizePublishType(type: unknown): PublishType {
  const value = String(type || "").toLowerCase();

  if (value.includes("scholarship")) return "scholarship";
  if (value.includes("job") || value.includes("recruitment")) return "job";
  if (value.includes("exam")) return "exam";
  return "scheme";
}

function buildInitialPublishPayload(item: AdminItem): Record<string, unknown> {
  const raw = getRaw(item);
  const r = asRecord(item);

  const title = firstNonEmpty(item.title, raw.title, raw.name, r.name);
  const description = firstNonEmpty(
    item.description,
    item.summary,
    r.content,
    item.rawContent,
    raw.description,
    raw.summary,
    raw.content,
    title,
  );

  const officialUrl = firstNonEmpty(
    r.official_url,
    r.officialUrl,
    r.apply_url,
    r.applyUrl,
    item.sourceUrl,
    r.source_url,
    r.sourceUrl,
    item.rawUrl,
    raw.official_url,
    raw.officialUrl,
    raw.apply_url,
    raw.applyUrl,
    raw.source_url,
    raw.sourceUrl,
    raw.url,
    raw.link,
  );

  const provider = firstNonEmpty(
    r.provider,
    item.sourceName,
    raw.provider,
    raw.organization,
    raw.department,
    raw.sourceName,
    "Government of India",
  );

  return {
    title,
    description,
    official_url: officialUrl,
    apply_url: officialUrl,
    source_url: officialUrl,
    category: firstNonEmpty(item.category, raw.category, "general"),
    provider,
    organization: firstNonEmpty(raw.organization, raw.department, provider),
    conducting_body: firstNonEmpty(raw.conducting_body, raw.conductingBody, provider),
    conductingBody: firstNonEmpty(raw.conducting_body, raw.conductingBody, provider),
    location: firstNonEmpty(r.location, raw.location, item.state, "All India"),
    state: firstNonEmpty(r.state, raw.state, "All India"),
    benefit: firstNonEmpty(item.benefits, raw.benefit, raw.benefits),
    benefits: firstNonEmpty(item.benefits, raw.benefits, raw.benefit),
    eligibility: firstNonEmpty(item.eligibility, raw.eligibility),
    documents_required: firstNonEmpty(raw.documents_required, raw.documentsRequired),
    application_process: firstNonEmpty(raw.application_process, raw.applicationProcess),
    deadline: firstNonEmpty(item.deadline, raw.deadline, raw.last_date, raw.application_end),
    last_date: firstNonEmpty(raw.last_date, item.deadline),
    application_end: firstNonEmpty(raw.application_end, item.deadline),
    exam_date: firstNonEmpty(raw.exam_date, raw.examDate),
    vacancies: firstNonEmpty(raw.vacancies, raw.total_posts, raw.totalPosts),
    qualification: firstNonEmpty(raw.qualification, raw.education, raw.eligibility),
    amount: firstNonEmpty(raw.amount, raw.benefit_amount, "1"),
  };
}

export default function VerificationDetailPanel({
  item,
  isOpen,
  onClose,
  onStatusChange,
  onActionComplete,
}: VerificationDetailPanelProps) {
  const [editedItem, setEditedItem] = useState<AdminItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishType, setPublishType] = useState<PublishType>("scheme");
  const [publishPayload, setPublishPayload] = useState<Record<string, unknown>>({});
  const [isSaved, setIsSaved] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initialize panel state when item changes - avoid sync setState in effect
  useEffect(() => {
    if (!item || !isOpen) return;

    const timer = window.setTimeout(() => {
      setEditedItem(item);
      setAdminNotes("");
      setIsPublishOpen(false);
      setIsSaved(true);
      setToast(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [item, isOpen]);

  const publishErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const payload = publishPayload || {};

    const required = (key: string, message: string) => {
      const val = payload[key];
      if (val === undefined || val === null || String(val).trim() === "") {
        errors[key] = message;
      }
    };

    required("title", "Title is required");
    required("description", "Description is required");
    required("official_url", "Apply / Official URL is required");

    if (publishType === "scheme") {
      required("category", "Category is required");
      required("provider", "Provider is required");
    }

    if (publishType === "scholarship") {
      required("provider", "Provider is required");
    }

    if (publishType === "job") {
      required("organization", "Organization is required");
      required("location", "Location is required");
    }

    if (publishType === "exam") {
      required("conducting_body", "Conducting body is required");
    }

    return errors;
  }, [publishPayload, publishType]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentItem = editedItem || item;
  const normalizedStatus = currentItem?.status;

  const isPendingStatus = useMemo(
    () =>
      normalizedStatus === "pending" ||
      normalizedStatus === "ai_processed" ||
      normalizedStatus === "pending_verification",
    [normalizedStatus],
  );

  const isApprovedStatus = normalizedStatus === "approved";
  const isRejectedStatus = normalizedStatus === "rejected";
  const isPublishedStatus = normalizedStatus === "published";

  const canSave = isPendingStatus || isApprovedStatus || isPublishedStatus;
  const canApprove = isPendingStatus;
  const canReject = isPendingStatus || isApprovedStatus;
  const canPublish = isApprovedStatus && isSaved;

  if (!item || !isOpen || !currentItem) return null;

  const updateEdited = (patch: Partial<AdminItem>) => {
    setEditedItem((prev) => ({ ...(prev ?? currentItem), ...patch }) as AdminItem);
    setIsSaved(false);
  };

  const handleCopyUrl = async () => {
    const r = asRecord(currentItem);
    const url = firstNonEmpty(currentItem.sourceUrl, currentItem.rawUrl, r.official_url);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setToast({ type: "success", message: "URL copied." });
  };

  const handleSaveEdits = async () => {
    if (!editedItem) return;

    setIsActionLoading(true);

    try {
      const r = asRecord(editedItem);
      const url = firstNonEmpty(editedItem.sourceUrl, r.official_url, r.apply_url, editedItem.rawUrl);

      const updates: Record<string, unknown> = {
        official_url: url || null,
        apply_url: url || null,
        source_url: url || null,
        title: editedItem.title?.trim() || null,
        description: firstNonEmpty(editedItem.summary, editedItem.description, editedItem.title) || null,
        eligibility: editedItem.eligibility?.trim() || null,
        benefits: editedItem.benefits?.trim() || null,
        deadline: editedItem.deadline?.trim() || null,
        admin_notes: adminNotes?.trim() || null,
      };

      const targetId = getTargetId(currentItem);
      await editCollectedData(targetId, updates);

      setIsSaved(true);
      setToast({ type: "success", message: "Changes saved successfully." });
      onActionComplete?.();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save changes.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsActionLoading(true);

    try {
      const targetId = getTargetId(currentItem);
      const res = await approveCollectedData(targetId, adminNotes || undefined);

      setEditedItem({
        ...currentItem,
        ...(res as Partial<AdminItem>),
        status: "approved" as AdminItem["status"],
      } as AdminItem);

      setIsSaved(true);
      onStatusChange(currentItem.id, "approved");
      onActionComplete?.();
      setToast({ type: "success", message: "Item approved. You can publish it now." });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Approve failed.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    setIsActionLoading(true);

    try {
      const targetId = getTargetId(currentItem);
      await rejectCollectedData(
        targetId,
        adminNotes || "Rejected by admin",
        adminNotes || undefined,
      );

      setEditedItem({
        ...currentItem,
        status: "rejected" as AdminItem["status"],
      } as AdminItem);

      onStatusChange(currentItem.id, "rejected");
      onActionComplete?.();
      setToast({ type: "success", message: "Item rejected successfully." });
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Reject failed.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const openPublishForm = () => {
    const preferredType = normalizePublishType(currentItem.type);
    const payload = buildInitialPublishPayload(currentItem);

    setPublishType(preferredType);
    setPublishPayload(payload);
    setIsPublishOpen(true);
  };

  const handleApproveAgain = async () => {
    setIsActionLoading(true);

    try {
      const targetId = getTargetId(currentItem);
      const res = await approveCollectedData(targetId, adminNotes || undefined);

      setEditedItem({
        ...currentItem,
        ...(res as Partial<AdminItem>),
        status: "approved",
      } as AdminItem);

      setIsSaved(true);
      onStatusChange(currentItem.id, "approved");
      onActionComplete?.();
      setToast({ type: "success", message: "Item approved again successfully." });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Approve again failed.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm("Unpublish this item and return it to Approved?")) return;

    setIsActionLoading(true);

    try {
      const targetId = getTargetId(currentItem);
      await unpublishCollectedData(targetId);

      setEditedItem({
        ...currentItem,
        status: "approved" as AdminItem["status"],
      } as AdminItem);

      onStatusChange(currentItem.id, "approved");
      onActionComplete?.();
      setToast({ type: "success", message: "Item unpublished successfully." });
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Unpublish failed.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this collected data item? This is a soft delete.")) return;

    setIsActionLoading(true);

    try {
      const targetId = getTargetId(currentItem);
      await deleteCollectedData(targetId);

      onStatusChange(currentItem.id, "rejected");
      onActionComplete?.();
      setToast({ type: "success", message: "Item deleted successfully." });
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Delete failed.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublishSubmit = async () => {
    if (Object.keys(publishErrors).length > 0 || !isSaved) {
      setToast({ type: "error", message: "Please complete required fields first." });
      return;
    }

    setIsActionLoading(true);

    try {
      const base = buildInitialPublishPayload(currentItem);

      const officialUrl = firstNonEmpty(
        publishPayload.official_url,
        publishPayload.apply_url,
        publishPayload.source_url,
        publishPayload.link,
        base.official_url,
      );

      const finalPayload: Record<string, unknown> = {
        ...base,
        ...publishPayload,
        item_type: publishType,
        title: firstNonEmpty(publishPayload.title as string, base.title as string),
        description: firstNonEmpty(publishPayload.description as string, base.description as string, publishPayload.title as string, base.title as string),
        official_url: officialUrl,
        apply_url: firstNonEmpty(publishPayload.apply_url as string, officialUrl),
        source_url: firstNonEmpty(publishPayload.source_url as string, officialUrl),
      };

      if (!finalPayload.description) {
        finalPayload.description = finalPayload.title;
      }

      if (publishType === "exam") {
        finalPayload.conducting_body = firstNonEmpty(
          publishPayload.conducting_body as string,
          publishPayload.conductingBody as string,
          finalPayload.conducting_body as string,
          finalPayload.provider as string,
        );
      }

      if (publishType === "job") {
        finalPayload.organization = firstNonEmpty(
          publishPayload.organization as string,
          finalPayload.organization as string,
          finalPayload.provider as string,
        );
      }

      await publishCollectedData(getTargetId(currentItem), publishType, finalPayload);

      setEditedItem({
        ...currentItem,
        status: "published" as AdminItem["status"],
      } as AdminItem);

      setIsPublishOpen(false);
      onStatusChange(currentItem.id, "published");
      onActionComplete?.();
      setToast({ type: "success", message: "Item published successfully." });
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Publish failed.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const r = asRecord(currentItem);
  const urlForDisplay = firstNonEmpty(r.official_url, r.apply_url, currentItem.sourceUrl, currentItem.rawUrl);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed inset-x-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl sm:right-0 sm:left-auto sm:w-full sm:max-w-2xl">
        {/* Mobile drag handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-white pt-2 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-[#E5E7EB]" />
        </div>
        {toast && (
          <div
            className={`fixed right-4 top-24 z-70 rounded-xl px-4 py-3 text-sm shadow-lg ${
              toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1A3C6E] sm:text-2xl">Review Item</h2>
              <p className="mt-0.5 truncate text-xs text-[#111827]/60 sm:text-sm">ID: {currentItem.id}</p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F5F3EE] sm:h-11 sm:w-11"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            <div className="grid gap-6 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE]/50 p-6">
              <div>
                <p className="mb-2 text-sm font-medium text-[#111827]/60">Current Status</p>
                <StatusBadge status={currentItem.status} size="lg" />
              </div>

              <ConfidenceBadge score={currentItem.aiConfidenceScore} />
              <ConfidenceBadge score={currentItem.sourceTrustScore} label="Source Trust" />

              {isApprovedStatus && (
                <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                  Approved successfully. Publish option is now available.
                </div>
              )}

              {isRejectedStatus && (
                <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                  This item is rejected.
                </div>
              )}

              {isPublishedStatus && (
                <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                  This item is published and visible to users.
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Title</label>
                <input
                  type="text"
                  value={currentItem.title || ""}
                  onChange={(e) => updateEdited({ title: e.target.value })}
                  disabled={isRejectedStatus || isPublishedStatus}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Type</label>
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm font-medium text-[#1A3C6E]">
                    {currentItem.type}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Category</label>
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm font-medium text-[#1A3C6E]">
                    {currentItem.category || "general"}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Summary / Description</label>
                <textarea
                  value={currentItem.summary || currentItem.description || ""}
                  onChange={(e) => updateEdited({ summary: e.target.value, description: e.target.value } as Partial<AdminItem>)}
                  rows={3}
                  disabled={isRejectedStatus || isPublishedStatus}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Eligibility</label>
                <textarea
                  value={currentItem.eligibility || ""}
                  onChange={(e) => updateEdited({ eligibility: e.target.value })}
                  rows={2}
                  disabled={isRejectedStatus || isPublishedStatus}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Benefits</label>
                <textarea
                  value={currentItem.benefits || ""}
                  onChange={(e) => updateEdited({ benefits: e.target.value })}
                  rows={2}
                  disabled={isRejectedStatus || isPublishedStatus}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Deadline</label>
                <input
                  type="date"
                  value={currentItem.deadline ? currentItem.deadline.split("T")[0] : ""}
                  onChange={(e) => updateEdited({ deadline: e.target.value || null })}
                  disabled={isRejectedStatus || isPublishedStatus}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Apply / Official URL</label>
                <input
                  type="url"
                  value={urlForDisplay}
                  onChange={(e) => updateEdited({ sourceUrl: e.target.value } as Partial<AdminItem>)}
                  disabled={isRejectedStatus}
                  placeholder="https://example.com/apply"
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-blue-50/50 p-6">
              <h3 className="font-semibold text-[#1A3C6E]">Source Information</h3>

              <SourceBadge sourceName={currentItem.sourceName} trustScore={currentItem.sourceTrustScore} />

              <div className="space-y-2 text-sm text-[#111827]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="font-medium">Collection method:</span>
                  <span>{currentItem.collectionMethod || "Unknown"}</span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="font-medium">Raw URL:</span>
                  {urlForDisplay ? (
                    <a
                      href={urlForDisplay}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-[#3B82F6] underline-offset-2 hover:underline"
                    >
                      {urlForDisplay}
                    </a>
                  ) : (
                    <span>No raw URL</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB]"
                >
                  <Copy size={16} />
                </button>

                {urlForDisplay && (
                  <a
                    href={urlForDisplay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB]"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">AI Notes</label>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm">
                  {currentItem.aiNotes || "No AI notes"}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Raw Content</label>
                <div className="whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm">
                  {currentItem.rawContent || "No raw content available"}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                disabled={isRejectedStatus || isPublishedStatus}
                placeholder="Add approval/rejection notes..."
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] px-6 py-4">
            <div className="space-y-3">
              {canSave && (
                <button
                  onClick={handleSaveEdits}
                  disabled={isSaved || isActionLoading}
                  className={`w-full rounded-lg px-4 py-3 font-medium ${
                    isSaved || isActionLoading
                      ? "cursor-not-allowed bg-slate-100 text-slate-500"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {isActionLoading ? "Saving..." : "Save Changes"}
                </button>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={isActionLoading}
                    className="rounded-lg bg-blue-50 px-4 py-3 font-medium text-[#1A3C6E] hover:bg-blue-100 disabled:opacity-60"
                  >
                    {isActionLoading ? "Approving..." : "Approve"}
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={handleReject}
                    disabled={isActionLoading}
                    className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {isActionLoading ? "Rejecting..." : "Reject"}
                  </button>
                )}

                {isApprovedStatus && (
                  <button
                    onClick={openPublishForm}
                    disabled={!canPublish || isActionLoading}
                    className={`rounded-lg px-4 py-3 font-medium text-white ${
                      canPublish && !isActionLoading
                        ? "bg-green-600 hover:bg-green-700"
                        : "cursor-not-allowed bg-green-200"
                    }`}
                  >
                    {isActionLoading ? "Processing..." : "Publish"}
                  </button>
                )}

                {isRejectedStatus && (
                  <>
                    <button
                      onClick={handleApproveAgain}
                      disabled={isActionLoading}
                      className="rounded-lg bg-blue-50 px-4 py-3 font-medium text-[#1A3C6E] hover:bg-blue-100 disabled:opacity-60"
                    >
                      {isActionLoading ? "Approving..." : "Approve Again"}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isActionLoading}
                      className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {isActionLoading ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}

                {isPublishedStatus && (
                  <>
                    <button
                      onClick={handleUnpublish}
                      disabled={isActionLoading}
                      className="rounded-lg bg-yellow-50 px-4 py-3 font-medium text-[#92400E] hover:bg-yellow-100 disabled:opacity-60"
                    >
                      {isActionLoading ? "Unpublishing..." : "Unpublish"}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isActionLoading}
                      className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {isActionLoading ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>

              {isApprovedStatus && !isSaved && (
                <p className="text-sm text-yellow-700">Save changes before publishing.</p>
              )}

              <button
                onClick={onClose}
                disabled={isActionLoading}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 font-medium hover:bg-[#F5F3EE] disabled:opacity-60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPublishOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsPublishOpen(false)} />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1A3C6E]">Publish Item</h3>
            <p className="mt-1 text-sm text-[#111827]/60">
              Select destination type and fill required fields.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select
                  value={publishType}
                  onChange={(e) => {
                    const nextType = e.target.value as PublishType;
                    const base = buildInitialPublishPayload(currentItem);
                    setPublishType(nextType);
                    setPublishPayload({
                      ...base,
                      ...publishPayload,
                      item_type: nextType,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  <option value="scheme">Scheme</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="job">Job</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Title *</label>
                <input
                  value={String(publishPayload.title || "")}
                  onChange={(e) => setPublishPayload({ ...publishPayload, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                {publishErrors.title && <p className="mt-1 text-sm text-red-600">{publishErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Description *</label>
                <textarea
                  rows={3}
                  value={String(publishPayload.description || "")}
                  onChange={(e) => setPublishPayload({ ...publishPayload, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                {publishErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{publishErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Apply / Official URL *</label>
                <input
                  type="url"
                  value={String(publishPayload.official_url || "")}
                  onChange={(e) =>
                    setPublishPayload({
                      ...publishPayload,
                      official_url: e.target.value,
                      apply_url: e.target.value,
                      source_url: (publishPayload.source_url as string) || e.target.value,
                    })
                  }
                  placeholder="https://example.com/apply"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                {publishErrors.official_url && (
                  <p className="mt-1 text-sm text-red-600">{publishErrors.official_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Eligibility</label>
                <textarea
                  rows={2}
                  value={String(publishPayload.eligibility || "")}
                  onChange={(e) => setPublishPayload({ ...publishPayload, eligibility: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Deadline / Last Date</label>
                <input
                  type="date"
                  value={publishPayload.deadline ? String(publishPayload.deadline).split("T")[0] : ""}
                  onChange={(e) =>
                    setPublishPayload({
                      ...publishPayload,
                      deadline: e.target.value,
                      last_date: e.target.value,
                      application_end: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              {publishType === "scheme" && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Category *</label>
                    <input
                      value={String(publishPayload.category || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, category: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {publishErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{publishErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Provider *</label>
                    <input
                      value={String(publishPayload.provider || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, provider: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {publishErrors.provider && (
                      <p className="mt-1 text-sm text-red-600">{publishErrors.provider}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Benefit</label>
                    <input
                      value={String(publishPayload.benefit || publishPayload.benefits || "")}
                      onChange={(e) =>
                        setPublishPayload({
                          ...publishPayload,
                          benefit: e.target.value,
                          benefits: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </>
              )}

              {publishType === "scholarship" && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Provider *</label>
                    <input
                      value={String(publishPayload.provider || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, provider: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {publishErrors.provider && (
                      <p className="mt-1 text-sm text-red-600">{publishErrors.provider}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      value={String(publishPayload.amount || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, amount: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </>
              )}

              {publishType === "job" && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Organization *</label>
                    <input
                      value={String(publishPayload.organization || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, organization: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {publishErrors.organization && (
                      <p className="mt-1 text-sm text-red-600">{publishErrors.organization}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Location *</label>
                    <input
                      value={String(publishPayload.location || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, location: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {publishErrors.location && (
                      <p className="mt-1 text-sm text-red-600">{publishErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Vacancies</label>
                    <input
                      value={String(publishPayload.vacancies || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, vacancies: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </>
              )}

              {publishType === "exam" && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Conducting Body *</label>
                    <input
                      value={String(publishPayload.conducting_body || "")}
                      onChange={(e) =>
                        setPublishPayload({
                          ...publishPayload,
                          conducting_body: e.target.value,
                          conductingBody: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {publishErrors.conducting_body && (
                      <p className="mt-1 text-sm text-red-600">{publishErrors.conducting_body}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Exam Date</label>
                    <input
                      type="date"
                      value={publishPayload.exam_date ? String(publishPayload.exam_date).split("T")[0] : ""}
                      onChange={(e) => setPublishPayload({ ...publishPayload, exam_date: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={handlePublishSubmit}
                  disabled={Object.keys(publishErrors).length > 0 || isActionLoading}
                  className={`rounded-lg px-4 py-2 text-white ${
                    Object.keys(publishErrors).length === 0 && !isActionLoading
                      ? "bg-green-600 hover:bg-green-700"
                      : "cursor-not-allowed bg-green-200"
                  }`}
                >
                  {isActionLoading ? "Publishing..." : "Publish"}
                </button>

                <button
                  onClick={() => setIsPublishOpen(false)}
                  disabled={isActionLoading}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
