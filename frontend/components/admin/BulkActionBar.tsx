"use client";

import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import type { BulkActionResult } from "@/lib/api/admin";

interface BulkActionButton {
  label: string;
  action: () => void;
  variant?: "primary" | "danger" | "warning" | "default";
  requiresConfirmation?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkActionButton[];
  /** The key of the bulk action currently running (e.g. "publish", "reject") or null */
  activeAction?: string | null;
  result?: BulkActionResult | null;
  pageLabel?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-[#1A3C6E] text-white hover:bg-[#3B82F6]",
  danger: "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  default: "bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F5F3EE]",
};

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions,
  activeAction = null,
  result = null,
  pageLabel,
}: BulkActionBarProps) {
  if (selectedCount === 0 && !result) return null;

  const isAnyProcessing = activeAction !== null;

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-lg shadow-black/5 transition-all">
        {/* Result banner */}
        {result && (
          <div className={`flex items-center gap-3 px-4 py-3 text-sm border-b ${
            result.success
              ? "bg-green-50 border-green-200 text-green-800"
              : result.failedCount > 0 && result.successCount > 0
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {result.success ? (
              <CheckCircle2 size={16} className="shrink-0 text-green-600" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-red-500" />
            )}
            <span className="flex-1">
              {result.processed} processed — {result.successCount} succeeded, {result.failedCount} failed
            </span>
            {result.failedCount > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium underline">Details</summary>
                <ul className="mt-1 space-y-1">
                  {result.failed.slice(0, 5).map((f) => (
                    <li key={f.id} className="truncate max-w-xs">
                      <span className="font-mono">{f.id.slice(0, 8)}…</span>: {f.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-[#1A3C6E] px-2.5 py-0.5 text-xs font-bold text-white">
              {selectedCount}
            </span>
            <span className="text-sm font-medium text-[#111827]">
              {pageLabel || "selected"}
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={isAnyProcessing}
              className="ml-1 rounded-full p-1 text-[#6B7280] hover:bg-[#F5F3EE] disabled:opacity-50"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2">
            {actions.map((btn) => {
              const actionKey = btn.label.toLowerCase().replace(/\s+/g, "-");
              const isThisProcessing = activeAction === actionKey;

              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => {
                    if (btn.requiresConfirmation) {
                      const msg = `Perform "${btn.label}" on ${selectedCount} items?`;
                      if (!window.confirm(msg)) return;
                    }
                    btn.action();
                  }}
                  disabled={isAnyProcessing}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${VARIANT_STYLES[btn.variant || "default"] || VARIANT_STYLES.default}`}
                >
                  {isThisProcessing && <Loader2 size={12} className="animate-spin" />}
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
