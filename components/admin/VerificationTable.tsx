"use client";

import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import type { AdminItem } from "@/types/admin";
import StatusBadge from "./StatusBadge";

interface VerificationTableProps {
  items: AdminItem[];
  isLoading?: boolean;
  onRowClick: (item: AdminItem) => void;
}

export default function VerificationTable({
  items,
  isLoading = false,
  onRowClick,
}: VerificationTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-12">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#3B82F6]" />
          </div>
          <p className="text-[#111827]/60">Loading items...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-12">
        <div className="text-center">
          <p className="text-lg font-medium text-[#111827]">
            No items found
          </p>
          <p className="mt-2 text-sm text-[#111827]/60">
            Try adjusting your filters or search terms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
      <table className="min-w-225 w-full">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE]">
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              Title
            </th>
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              Type
            </th>
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              Status
            </th>
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              AI Confidence
            </th>
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              Trust
            </th>
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              Deadline
            </th>
            <th className="px-3 py-4 text-left text-sm font-semibold text-[#1A3C6E] sm:px-6">
              Updated
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item)}
              className="transition hover:bg-[#F5F3EE]/50 cursor-pointer"
            >
              <td className="px-3 py-4 sm:px-6">
                <div className="max-w-xs">
                  <p className="truncate font-medium text-[#111827]">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#111827]/60">
                    {item.sourceName}
                  </p>
                </div>
              </td>
              <td className="px-3 py-4 sm:px-6">
                <span className="inline-flex items-center rounded-lg bg-[#1A3C6E]/10 px-2.5 py-1 text-xs font-medium text-[#1A3C6E]">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </td>
              <td className="px-3 py-4 sm:px-6">
                <StatusBadge status={item.status} size="sm" />
              </td>
              <td className="px-3 py-4 sm:px-6">
                <div className="max-w-xs">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#111827]/60">
                      {item.aiConfidenceScore}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        item.aiConfidenceScore >= 80
                          ? "bg-green-500"
                          : item.aiConfidenceScore >= 60
                            ? "bg-[#3B82F6]"
                            : "bg-red-400"
                      }`}
                      style={{ width: `${item.aiConfidenceScore}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-3 py-4 sm:px-6">
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.sourceTrustScore >= 90
                        ? "bg-green-500"
                        : item.sourceTrustScore >= 70
                          ? "bg-[#3B82F6]"
                          : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-[#111827]">
                    {item.sourceTrustScore}%
                  </span>
                </div>
              </td>
              <td className="px-3 py-4 text-sm text-[#111827] sm:px-6">
                {item.deadline
                  ? format(new Date(item.deadline), "MMM dd, yyyy")
                  : "-"}
              </td>
              <td className="px-3 py-4 text-xs text-[#111827]/60 sm:px-6">
                {format(new Date(item.lastUpdated), "MMM dd")}
              </td>
              <td className="px-3 py-4 sm:px-6">
                <ChevronRight
                  size={16}
                  className="text-[#111827]/40 transition group-hover:text-[#3B82F6]"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
