"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  approveCollectedData,
  rejectCollectedData,
  editCollectedData,
  publishCollectedData,
  publishContentUpdate,
  unpublishCollectedData,
  deleteCollectedData,
  processSingleItemWithAi,
  recheckVerification,
  getAiProcessingLogs,
} from "@/lib/api/admin";
import { X, Copy, ExternalLink } from "lucide-react";
import type { AdminItem, ItemType } from "@/types/admin";
import StatusBadge from "./StatusBadge";
import ConfidenceBadge from "./ConfidenceBadge";
import SourceBadge from "./SourceBadge";

type PublishType = "scheme" | "scholarship" | "job" | "exam";
type UpdateType = "notification" | "apply" | "admit_card" | "result" | "answer_key" | "update";
type PublishMode = "main" | "update";

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

const CONTENT_TYPE_OPTIONS = [
  { value: "scheme", label: "Scheme" },
  { value: "scholarship", label: "Scholarship" },
  { value: "job", label: "Job" },
  { value: "exam", label: "Exam" },
  { value: "admit_card", label: "Admit Card" },
  { value: "result", label: "Result" },
  { value: "answer_key", label: "Answer Key" },
  { value: "notification", label: "Notification" },
  { value: "update", label: "Update" },
];

const CATEGORY_OPTIONS = [
  "general",
  "obc",
  "sc",
  "st",
  "ebc",
  "women",
  "minority",
  "ews",
  "disability",
  "agriculture",
  "student",
  "job_seeker",
];

export default function VerificationDetailPanel({
  item,
  isOpen,
  onClose,
  onStatusChange,
  onActionComplete,
}: VerificationDetailPanelProps) {
  // ─── All hooks must be at the top, before any conditional return ───

  const [editedItem, setEditedItem] = useState<AdminItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishMode, setPublishMode] = useState<PublishMode>("main");
  const [publishType, setPublishType] = useState<PublishType>("scheme");
  const [publishPayload, setPublishPayload] = useState<Record<string, unknown>>({});
  const [updateType, setUpdateType] = useState<UpdateType>("notification");
  const [updateItemId, setUpdateItemId] = useState("");
  const [updateItemType, setUpdateItemType] = useState<string>("exam");
  const [isSaved, setIsSaved] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiLogs, setAiLogs] = useState<Record<string, unknown>[] | null>(null);
  const [showAiLogs, setShowAiLogs] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initialize panel state when item changes
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

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Derived values
  const currentItem = editedItem || item;
  const normalizedStatus = currentItem?.status;

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

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
  const canRunAi = isPendingStatus || normalizedStatus === "verified_ready" || normalizedStatus === "duplicate" || normalizedStatus === "failed";

  // hasChanges must be a hook BEFORE any early return
  const hasChanges = useMemo(() => {
    if (!editedItem || !item) return false;
    return (
      editedItem.title !== item.title ||
      editedItem.type !== item.type ||
      editedItem.category !== item.category ||
      editedItem.summary !== (item.summary || item.description) ||
      editedItem.eligibility !== item.eligibility ||
      editedItem.benefits !== item.benefits ||
      editedItem.deadline !== item.deadline ||
      editedItem.sourceUrl !== item.sourceUrl
    );
  }, [editedItem, item]);

  // ⛔ Early return — must come AFTER all hooks
  if (!item || !isOpen || !currentItem) return null;

  // ─── Regular variables (not hooks — safe after early return) ───

  const updateEdited = (patch: Partial<AdminItem>) => {
    setEditedItem((prev) => ({ ...(prev ?? currentItem), ...patch }) as AdminItem);
    setIsSaved(false);
  };

  const handleCopyUrl = async () => {
    const r = asRecord(currentItem);
    const url = firstNonEmpty(currentItem.sourceUrl, currentItem.rawUrl, r.official_url);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    showToast("success", "URL copied.");
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
        item_type: editedItem.type,
        content_action: editedItem.contentAction?.trim() || null,
        category: editedItem.category,
        eligibility: editedItem.eligibility?.trim() || null,
        benefits: editedItem.benefits?.trim() || null,
        deadline: editedItem.deadline?.trim() || null,
        admin_notes: adminNotes?.trim() || null,
      };

      const targetId = getTargetId(currentItem);
      await editCollectedData(targetId, updates);

      setIsSaved(true);
      showToast("success", "Changes saved successfully.");
      onActionComplete?.();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save changes.",
      );
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
      showToast("success", "Item approved. You can publish it now.");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Approve failed.",
      );
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
      showToast("success", "Item rejected successfully.");
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Reject failed.",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const openPublishForm = () => {
    const preferredType = normalizePublishType(currentItem.type);
    const payload = buildInitialPublishPayload(currentItem);

    let initialUpdateType: UpdateType = "notification";
    const itemTypeLower = String(currentItem.type).toLowerCase();
    if (itemTypeLower === "admit_card") initialUpdateType = "admit_card";
    else if (itemTypeLower === "result") initialUpdateType = "result";
    else if (itemTypeLower === "answer_key") initialUpdateType = "answer_key";
    else if (itemTypeLower === "notification") initialUpdateType = "notification";

    const isUpdateType = ["admit_card", "result", "answer_key", "notification", "update"].includes(itemTypeLower);
    setPublishMode(isUpdateType ? "update" : "main");
    setPublishType(preferredType);
    setPublishPayload(payload);
    setUpdateType(initialUpdateType);
    setUpdateItemId("");
    setUpdateItemType(preferredType);
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
      showToast("success", "Item approved again successfully.");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Approve again failed.",
      );
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
      showToast("success", "Item unpublished successfully.");
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Unpublish failed.",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAiProcess = async () => {
    setIsAiProcessing(true);
    setToast(null);

    try {
      const targetId = getTargetId(currentItem);
      const result = await processSingleItemWithAi(targetId);
      showToast("success", `AI processing complete: ${result.verification_status} (${result.confidence}% confidence)`);
      setIsSaved(false);
      onActionComplete?.();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "AI processing failed.",
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleRecheckVerification = async () => {
    setIsAiProcessing(true);
    setToast(null);

    try {
      const targetId = getTargetId(currentItem);
      const result = await recheckVerification(targetId);
      showToast("success", `Verification recheck complete: ${result.verification_status} (${result.verification_score} score)`);
      setIsSaved(false);
      onActionComplete?.();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Verification recheck failed.",
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleViewAiLogs = async () => {
    if (aiLogs) {
      setShowAiLogs(!showAiLogs);
      return;
    }

    try {
      const targetId = getTargetId(currentItem);
      const logs = await getAiProcessingLogs(targetId);
      setAiLogs(logs as Record<string, unknown>[]);
      setShowAiLogs(true);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to fetch AI logs.",
      );
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
      showToast("success", "Item deleted successfully.");
      window.setTimeout(() => onClose(), 700);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Delete failed.",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublishSubmit = async () => {
    if (publishMode === "main") {
      if (!publishPayload.title && !currentItem.title) {
        showToast("error", "Title is required for publishing.");
        return;
      }
      if (!publishPayload.description && !currentItem.summary && !currentItem.description) {
        showToast("error", "Description is required for publishing.");
        return;
      }
      if (!publishPayload.official_url && !currentItem.sourceUrl && !currentItem.rawUrl) {
        showToast("error", "Official/Apply URL is required for publishing.");
        return;
      }
    }

    setIsActionLoading(true);

    try {
      if (publishMode === "update") {
        const title = firstNonEmpty(
          publishPayload.title as string,
          currentItem.title,
          "Update Notification",
        );
        const description = firstNonEmpty(
          publishPayload.description as string,
          publishPayload.title as string,
          title,
        );
        const officialUrl = firstNonEmpty(
          publishPayload.official_url as string,
          publishPayload.apply_url as string,
          currentItem.sourceUrl,
          currentItem.rawUrl,
          "",
        );

        await publishContentUpdate({
          item_type: updateItemType,
          item_id: updateItemId || getTargetId(currentItem),
          update_type: updateType,
          title,
          description,
          official_url: officialUrl,
          parent_content_type: updateItemType,
          parent_content_id: updateItemId || null,
          status: "published",
          collected_data_id: getTargetId(currentItem),
        });

        setEditedItem({
          ...currentItem,
          status: "published" as AdminItem["status"],
        } as AdminItem);

        setIsPublishOpen(false);
        onStatusChange(currentItem.id, "published");
        onActionComplete?.();
        showToast("success", `Update (${updateType}) published successfully.`);
        window.setTimeout(() => onClose(), 700);
      } else {
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
        showToast("success", "Item published successfully.");
        window.setTimeout(() => onClose(), 700);
      }
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Publish failed.",
      );
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
        <div className="sticky top-0 z-10 flex justify-center bg-white pt-2 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-[#E5E7EB]" />
        </div>

        {toast && (
          <div
            className={`fixed right-4 top-24 z-70 rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300 ${
              toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.message}
            </div>
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
              disabled={isActionLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F5F3EE] disabled:opacity-50 sm:h-11 sm:w-11"
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

              <ConfidenceBadge score={currentItem.aiConfidenceScore ?? currentItem.aiConfidence ?? 0} label="AI Confidence" />
              <ConfidenceBadge score={currentItem.verificationScore ?? 0} label="Verification Score" />
              <ConfidenceBadge score={currentItem.sourceTrustScore} label="Source Trust" />

              {isApprovedStatus && (
                <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                  ✓ Approved successfully. Publish option is now available.
                </div>
              )}

              {isRejectedStatus && (
                <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                  ✗ This item is rejected.
                </div>
              )}

              {isPublishedStatus && (
                <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                  ✓ This item is published and visible to users.
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
                  disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Type</label>
                  <select
                    value={currentItem.type || "scheme"}
                    onChange={(e) => updateEdited({ type: e.target.value as ItemType })}
                    disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                  >
                    {CONTENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(currentItem.type === "job" || currentItem.type === "exam" || currentItem.contentAction) && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Content Action</label>
                    <select
                      value={currentItem.contentAction || (r.content_action as string) || "notification"}
                      onChange={(e) => updateEdited({ contentAction: e.target.value } as Partial<AdminItem>)}
                      disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                    >
                      <option value="notification">Notification</option>
                      <option value="apply">Apply Now</option>
                      <option value="admit_card">Admit Card</option>
                      <option value="result">Result</option>
                      <option value="answer_key">Answer Key</option>
                    </select>
                    <p className="mt-1 text-xs text-[#111827]/50">Applies to job/exam items</p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Category</label>
                  <div className="relative">
                    <select
                      value={CATEGORY_OPTIONS.includes(currentItem.category) ? currentItem.category : "custom"}
                      onChange={(e) => {
                        if (e.target.value === "custom") return;
                        updateEdited({ category: e.target.value as AdminItem["category"] });
                      }}
                      disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                      className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                      <option value="custom" disabled>
                        ── Custom ──
                      </option>
                    </select>
                    {!CATEGORY_OPTIONS.includes(currentItem.category) && (
                      <input
                        type="text"
                        value={currentItem.category}
                        onChange={(e) => updateEdited({ category: e.target.value as AdminItem["category"] })}
                        disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                        placeholder="Enter custom category..."
                        className="mt-2 w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Summary / Description</label>
                <textarea
                  value={currentItem.summary || currentItem.description || ""}
                  onChange={(e) => updateEdited({ summary: e.target.value, description: e.target.value } as Partial<AdminItem>)}
                  rows={3}
                  disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Eligibility</label>
                <textarea
                  value={currentItem.eligibility || ""}
                  onChange={(e) => updateEdited({ eligibility: e.target.value })}
                  rows={2}
                  disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Benefits</label>
                <textarea
                  value={currentItem.benefits || ""}
                  onChange={(e) => updateEdited({ benefits: e.target.value })}
                  rows={2}
                  disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Deadline</label>
                <input
                  type="date"
                  value={currentItem.deadline ? currentItem.deadline.split("T")[0] : ""}
                  onChange={(e) => updateEdited({ deadline: e.target.value || null })}
                  disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">Apply / Official URL</label>
                <input
                  type="url"
                  value={urlForDisplay}
                  onChange={(e) => updateEdited({ sourceUrl: e.target.value } as Partial<AdminItem>)}
                  disabled={isRejectedStatus || isActionLoading}
                  placeholder="https://example.com/apply"
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[#1A3C6E]">AI Processing</h3>

              {canRunAi && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAiProcess}
                    disabled={isAiProcessing || isActionLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-60"
                  >
                    {isAiProcessing ? "Processing..." : "Process with AI"}
                  </button>

                  <button
                    onClick={handleRecheckVerification}
                    disabled={isAiProcessing || isActionLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                  >
                    {isAiProcessing ? "Processing..." : "Recheck Verification"}
                  </button>
                </div>
              )}

              <button
                onClick={handleViewAiLogs}
                disabled={isAiProcessing || isActionLoading}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] hover:text-[#1A3C6E] disabled:opacity-60"
              >
                {showAiLogs ? "Hide AI Logs" : "View AI Logs"}
              </button>

              {showAiLogs && aiLogs && (
                <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-white p-3">
                  {aiLogs.length === 0 ? (
                    <p className="text-sm text-[#111827]/60">No AI processing logs found</p>
                  ) : (
                    aiLogs.slice(0, 5).map((log, i) => (
                      <div key={i} className="border-b border-[#E5E7EB] pb-2 last:border-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`rounded px-1.5 py-0.5 font-medium ${
                            log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>{log.status as string}</span>
                          {String(log.fallback_used) === 'true' && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700">Fallback</span>
                          )}
                          {log.confidence ? <span>Confidence: {String(log.confidence)}%</span> : null}
                          {log.processing_time_ms ? <span>Time: {String(Math.round(Number(log.processing_time_ms)))}ms</span> : null}
                        </div>
                        {log.error_message ? (
                          <p className="mt-1 text-xs text-red-600">Error: {String(log.error_message)}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              )}

              {currentItem.verificationNotes && (
                <div>
                  <p className="text-sm font-medium text-[#111827]/70">Verification Notes</p>
                  <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{currentItem.verificationNotes}</p>
                </div>
              )}

              {currentItem.duplicateReason && (
                <div>
                  <p className="text-sm font-medium text-red-600">Duplicate Reason</p>
                  <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{currentItem.duplicateReason}</p>
                </div>
              )}

              {currentItem.aiOutput && (
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-[#1A3C6E]">View AI Output</summary>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                    {JSON.stringify(currentItem.aiOutput, null, 2)}
                  </pre>
                </details>
              )}
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
                  disabled={isActionLoading}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] disabled:opacity-50"
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
                disabled={isRejectedStatus || isPublishedStatus || isActionLoading}
                placeholder="Add approval/rejection notes..."
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] px-6 py-4">
            <div className="space-y-3">
              {canSave && (
                <button
                  onClick={handleSaveEdits}
                  disabled={!hasChanges || isActionLoading}
                  className={`w-full rounded-lg px-4 py-3 font-medium transition ${
                    hasChanges && !isActionLoading
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "cursor-not-allowed bg-slate-100 text-slate-500"
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
                    className="rounded-lg bg-blue-50 px-4 py-3 font-medium text-[#1A3C6E] transition hover:bg-blue-100 disabled:opacity-60"
                  >
                    {isActionLoading ? "Approving..." : "Approve"}
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={handleReject}
                    disabled={isActionLoading}
                    className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    {isActionLoading ? "Rejecting..." : "Reject"}
                  </button>
                )}

                {isApprovedStatus && (
                  <button
                    onClick={openPublishForm}
                    disabled={!canPublish || isActionLoading}
                    className={`rounded-lg px-4 py-3 font-medium text-white transition ${
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
                      className="rounded-lg bg-blue-50 px-4 py-3 font-medium text-[#1A3C6E] transition hover:bg-blue-100 disabled:opacity-60"
                    >
                      {isActionLoading ? "Approving..." : "Approve Again"}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isActionLoading}
                      className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
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
                      className="rounded-lg bg-yellow-50 px-4 py-3 font-medium text-[#92400E] transition hover:bg-yellow-100 disabled:opacity-60"
                    >
                      {isActionLoading ? "Unpublishing..." : "Unpublish"}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isActionLoading}
                      className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
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
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 font-medium transition hover:bg-[#F5F3EE] disabled:opacity-60"
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
              Choose how to publish this collected data.
            </p>

            <div className="mt-4 flex gap-3 rounded-lg border border-[#E5E7EB] p-3">
              <button
                type="button"
                onClick={() => setPublishMode("main")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  publishMode === "main"
                    ? "bg-[#1A3C6E] text-white"
                    : "bg-[#F5F3EE] text-[#111827]/70 hover:bg-[#E5E7EB]"
                }`}
              >
                Publish as Main Content
              </button>
              <button
                type="button"
                onClick={() => setPublishMode("update")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  publishMode === "update"
                    ? "bg-[#1A3C6E] text-white"
                    : "bg-[#F5F3EE] text-[#111827]/70 hover:bg-[#E5E7EB]"
                }`}
              >
                Publish as Update
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {publishMode === "update" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium">Related Item Type *</label>
                    <select
                      value={updateItemType}
                      onChange={(e) => setUpdateItemType(e.target.value)}
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    >
                      <option value="exam">Exam</option>
                      <option value="job">Job</option>
                      <option value="scheme">Scheme</option>
                      <option value="scholarship">Scholarship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Related Item ID</label>
                    <input
                      value={updateItemId}
                      onChange={(e) => setUpdateItemId(e.target.value)}
                      disabled={isActionLoading}
                      placeholder="Enter the ID of the related item (optional, defaults to current ID)"
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Update Type *</label>
                    <select
                      value={updateType}
                      onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    >
                      <option value="notification">Notification</option>
                      <option value="apply">Apply</option>
                      <option value="admit_card">Admit Card</option>
                      <option value="result">Result</option>
                      <option value="answer_key">Answer Key</option>
                      <option value="update">Update</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Title *</label>
                    <input
                      value={String(publishPayload.title || currentItem.title || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, title: e.target.value })}
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      rows={3}
                      value={String(publishPayload.description || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, description: e.target.value })}
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Official URL</label>
                    <input
                      type="url"
                      value={String(publishPayload.official_url || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, official_url: e.target.value })}
                      disabled={isActionLoading}
                      placeholder="https://example.com/notification"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Date / Deadline (optional)</label>
                    <input
                      type="date"
                      value={publishPayload.date ? String(publishPayload.date).split("T")[0] : ""}
                      onChange={(e) => setPublishPayload({ ...publishPayload, date: e.target.value, deadline: e.target.value })}
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </>
              ) : (
                <>
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
                      disabled={isActionLoading}
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
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Description *</label>
                    <textarea
                      rows={3}
                      value={String(publishPayload.description || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, description: e.target.value })}
                      disabled={isActionLoading}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
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
                      disabled={isActionLoading}
                      placeholder="https://example.com/apply"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Eligibility</label>
                    <textarea
                      rows={2}
                      value={String(publishPayload.eligibility || "")}
                      onChange={(e) => setPublishPayload({ ...publishPayload, eligibility: e.target.value })}
                      disabled={isActionLoading}
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
                      disabled={isActionLoading}
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
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Provider *</label>
                        <input
                          value={String(publishPayload.provider || "")}
                          onChange={(e) => setPublishPayload({ ...publishPayload, provider: e.target.value })}
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
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
                          disabled={isActionLoading}
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
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Amount</label>
                        <input
                          type="number"
                          value={String(publishPayload.amount || "")}
                          onChange={(e) => setPublishPayload({ ...publishPayload, amount: e.target.value })}
                          disabled={isActionLoading}
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
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Location *</label>
                        <input
                          value={String(publishPayload.location || "")}
                          onChange={(e) => setPublishPayload({ ...publishPayload, location: e.target.value })}
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Vacancies</label>
                        <input
                          value={String(publishPayload.vacancies || "")}
                          onChange={(e) => setPublishPayload({ ...publishPayload, vacancies: e.target.value })}
                          disabled={isActionLoading}
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
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Exam Date</label>
                        <input
                          type="date"
                          value={publishPayload.exam_date ? String(publishPayload.exam_date).split("T")[0] : ""}
                          onChange={(e) => setPublishPayload({ ...publishPayload, exam_date: e.target.value })}
                          disabled={isActionLoading}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={handlePublishSubmit}
                  disabled={isActionLoading}
                  className={`rounded-lg px-4 py-2 text-white transition ${
                    !isActionLoading
                      ? "bg-green-600 hover:bg-green-700"
                      : "cursor-not-allowed bg-green-200"
                  }`}
                >
                  {isActionLoading ? "Publishing..." : publishMode === "update" ? "Publish Update" : "Publish"}
                </button>

                <button
                  onClick={() => setIsPublishOpen(false)}
                  disabled={isActionLoading}
                  className="rounded-lg border px-4 py-2 transition hover:bg-gray-50 disabled:opacity-50"
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
