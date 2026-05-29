"use client";

interface ListingSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  filterLabel: string;
  filterOptions: string[];
  resultCount?: number;
}

export default function ListingSearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  selectedFilter,
  onFilterChange,
  filterLabel,
  filterOptions,
  resultCount,
}: ListingSearchFilterProps) {
  const filterId = `${filterLabel.toLowerCase().replace(/\s+/g, "-")}-filter`;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-md sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1A3C6E]">Search and filter</p>
        {typeof resultCount === "number" ? (
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none transition-colors duration-200 placeholder:text-[#6B7280] focus:border-[#3B82F6] focus:bg-white"
        />

        <label className="sr-only" htmlFor={filterId}>
          {filterLabel}
        </label>
        <select
          id={filterId}
          value={selectedFilter}
          onChange={(event) => onFilterChange(event.target.value)}
          className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none transition-colors duration-200 focus:border-[#3B82F6] focus:bg-white"
        >
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
