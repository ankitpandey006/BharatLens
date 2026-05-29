"use client";

import { useState } from "react";
import { X, Copy, ExternalLink } from "lucide-react";
import type { AdminItem } from "@/types/admin";
import StatusBadge from "./StatusBadge";
import ConfidenceBadge from "./ConfidenceBadge";
import SourceBadge from "./SourceBadge";

interface VerificationDetailPanelProps {
  item: AdminItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: AdminItem["status"]) => void;
}

export default function VerificationDetailPanel({
  item,
  isOpen,
  onClose,
  onStatusChange,
}: VerificationDetailPanelProps) {
  const [editedItem, setEditedItem] = useState<AdminItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  if (!item || !isOpen) return null;

  const currentItem = editedItem || item;

  const handleStatusUpdate = (newStatus: AdminItem["status"]) => {
    onStatusChange(item.id, newStatus);
  };

  const handleCopyUrl = () => {
    if (item.sourceUrl) {
      navigator.clipboard.writeText(item.sourceUrl);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div>
            <h2 className="text-xl font-bold text-[#1A3C6E] sm:text-2xl">Review Item</h2>
            <p className="mt-1 text-sm text-[#111827]/60">
              ID: {item.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] transition hover:bg-[#F5F3EE]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:space-y-8 lg:px-8 lg:py-8">
          {/* Status & Scores */}
          <div className="grid gap-6 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE]/50 p-6">
            <div>
              <p className="mb-2 text-sm font-medium text-[#111827]/60">
                Current Status
              </p>
              <StatusBadge status={currentItem.status} size="lg" />
            </div>

            <ConfidenceBadge score={currentItem.aiConfidenceScore} />
            <ConfidenceBadge
              score={currentItem.sourceTrustScore}
              label="Source Trust"
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Title
              </label>
              <input
                type="text"
                value={currentItem.title}
                onChange={(e) =>
                  setEditedItem({
                    ...currentItem,
                    title: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">
                  Type
                </label>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm font-medium text-[#1A3C6E]">
                  {currentItem.type.charAt(0).toUpperCase() +
                    currentItem.type.slice(1)}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">
                  Category
                </label>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm font-medium text-[#1A3C6E]">
                  {currentItem.category.toUpperCase()}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Summary
              </label>
              <textarea
                value={currentItem.summary}
                onChange={(e) =>
                  setEditedItem({
                    ...currentItem,
                    summary: e.target.value,
                  })
                }
                rows={3}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Eligibility
              </label>
              <textarea
                value={currentItem.eligibility}
                onChange={(e) =>
                  setEditedItem({
                    ...currentItem,
                    eligibility: e.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Benefits
              </label>
              <textarea
                value={currentItem.benefits}
                onChange={(e) =>
                  setEditedItem({
                    ...currentItem,
                    benefits: e.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">
                  Deadline
                </label>
                <input
                  type="date"
                  value={
                    currentItem.deadline
                      ? currentItem.deadline.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditedItem({
                      ...currentItem,
                      deadline: e.target.value || null,
                    })
                  }
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]">
                  State
                </label>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm font-medium text-[#1A3C6E]">
                  {currentItem.state}
                </div>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-blue-50/50 p-6">
            <h3 className="font-semibold text-[#1A3C6E]">Source Information</h3>
            <SourceBadge
              sourceName={currentItem.sourceName}
              trustScore={currentItem.sourceTrustScore}
            />
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={currentItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 break-all rounded-lg border border-[#3B82F6] px-3 py-2 text-sm font-medium text-[#3B82F6] transition hover:bg-[#3B82F6]/5"
              >
                {currentItem.sourceUrl}
              </a>
              <button
                onClick={handleCopyUrl}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] transition hover:bg-[#F5F3EE]"
              >
                <Copy size={16} />
              </button>
              <a
                href={currentItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] transition hover:bg-[#F5F3EE]"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* AI Notes */}
          <div className="space-y-2">
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              AI Notes (Read Only)
            </label>
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F3EE]/50 px-4 py-3 text-sm text-[#111827]">
              {currentItem.aiNotes}
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add your review notes..."
              rows={3}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            />
          </div>

          {/* Recommendation Info */}
          {currentItem.status === "published" && (
            <div className="space-y-3 rounded-2xl border border-green-200 bg-green-50 p-6">
              <h3 className="font-semibold text-green-900">
                Recommendation Status
              </h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Eligible for Recommendations:</span>
                  <span className="font-medium text-green-900">
                    {currentItem.recommendationEligible ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Matched Users:</span>
                  <span className="font-medium text-green-900">
                    {currentItem.matchedUsersCount || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 border-t border-[#E5E7EB] pt-6">
            {currentItem.status === "ai_processed" && (
              <button
                onClick={() => handleStatusUpdate("pending_verification")}
                className="w-full rounded-lg bg-yellow-50 px-4 py-3 font-medium text-yellow-700 transition hover:bg-yellow-100"
              >
                Mark as Pending Verification
              </button>
            )}

            {currentItem.status === "pending_verification" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("approved")}
                  className="w-full rounded-lg bg-blue-50 px-4 py-3 font-medium text-[#1A3C6E] transition hover:bg-[#3B82F6]/10"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  className="w-full rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700 transition hover:bg-red-100"
                >
                  Reject
                </button>
              </>
            )}

            {currentItem.status === "approved" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("published")}
                  className="w-full rounded-lg bg-green-50 px-4 py-3 font-medium text-green-700 transition hover:bg-green-100"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleStatusUpdate("pending_verification")}
                  className="w-full rounded-lg bg-[#F5F3EE] px-4 py-3 font-medium text-[#111827] transition hover:bg-[#E5E7EB]"
                >
                  Send Back for Review
                </button>
              </>
            )}

            {currentItem.status === "rejected" && (
              <button
                onClick={() => handleStatusUpdate("pending_verification")}
                className="w-full rounded-lg bg-yellow-50 px-4 py-3 font-medium text-yellow-700 transition hover:bg-yellow-100"
              >
                Reconsider & Review Again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
