"use client";

import { Search, Filter, ChevronDown } from "lucide-react";
import type { ItemType, ItemStatus, FilterState } from "@/types/admin";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  states: string[];
  sources: string[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  states,
  sources,
}: FilterBarProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center gap-2 text-[#1A3C6E]">
        <Filter size={18} />
        <h3 className="font-semibold">Filters & Search</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Search
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111827]/40"
            />
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-9 py-2.5 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Type
          </label>
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) =>
                onFilterChange({ type: e.target.value as ItemType | "all" })
              }
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="all">All Types</option>
              <option value="scheme">Scheme</option>
              <option value="scholarship">Scholarship</option>
              <option value="job">Job</option>
              <option value="exam">Exam</option>
              <option value="update">Update</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/60"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ status: e.target.value as ItemStatus | "all" })
              }
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="all">All Status</option>
              <option value="ai_processed">Processing</option>
              <option value="pending_verification">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/60"
            />
          </div>
        </div>

        {/* State Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            State
          </label>
          <div className="relative">
            <select
              value={filters.state}
              onChange={(e) => onFilterChange({ state: e.target.value })}
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/60"
            />
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Source Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Source
          </label>
          <div className="relative">
            <select
              value={filters.source}
              onChange={(e) => onFilterChange({ source: e.target.value })}
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/60"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Sort By
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as
                    | "confidence"
                    | "trust"
                    | "latest"
                    | "deadline",
                })
              }
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="latest">Latest</option>
              <option value="confidence">Confidence Score</option>
              <option value="trust">Trust Score</option>
              <option value="deadline">Deadline</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/60"
            />
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#111827]">
            Order
          </label>
          <div className="relative">
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                onFilterChange({ sortOrder: e.target.value as "asc" | "desc" })
              }
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
