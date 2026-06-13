"use client";

import { useRouter } from "next/navigation";
import type { ReactNode, MouseEvent, KeyboardEvent } from "react";

export interface BharatLensCardProps {
  /** Link to the detail page (e.g. /jobs/123) */
  detailHref: string;
  /** Content type badge */
  badge: {
    label: string;
    gradient: string; // tailwind gradient class like "from-emerald-500 to-green-600"
    dotColor?: string; // tailwind bg class like "bg-emerald-400"
  };
  /** Show "Official Source" badge */
  isOfficial?: boolean;
  /** Card title */
  title: string;
  /** Optional description (max 2 lines) */
  description?: string;
  /** Metadata rows: icon + text pairs */
  metadata?: Array<{
    icon: ReactNode;
    text: ReactNode;
  }>;
  /** Deadline string shown in top-right */
  deadline?: string;
  /** Whether deadline is within 7 days */
  isExpiringSoon?: boolean;
  /** Source domain name shown at bottom */
  sourceUrl?: string;
  /** ISO date string shown at bottom */
  createdAt?: string;
  /** Primary CTA button */
  primaryAction: {
    label: string;
    href?: string;
    gradient: string; // tailwind gradient class
  };
  /** Save state */
  isSaved?: boolean;
  saving?: boolean;
  onToggleSaved?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function BharatLensCard({
  detailHref,
  badge,
  isOfficial,
  title,
  description,
  metadata,
  deadline,
  isExpiringSoon,
  sourceUrl,
  createdAt,
  primaryAction,
  isSaved,
  saving,
  onToggleSaved,
}: BharatLensCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(detailHref);
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(detailHref);
    }
  };

  // Stop propagation so button clicks don't trigger card navigation
  const handleActionClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const handleActionKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
    }
  };

  const handleSaveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleSaved?.(e);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`View details: ${title}`}
      className="group relative block cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-300 hover:border-[#9BB6E5] hover:shadow-[0_8px_30px_rgba(26,60,110,0.12)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
    >
      {/* Gradient accent top bar */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#1A3C6E] to-[#3B82F6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-col p-5 sm:p-6">
        {/* Top row: badges + deadline */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Content type badge - gradient */}
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${badge.gradient} text-white px-3 py-1 text-xs font-semibold shadow-sm`}>
              <span className={`h-1.5 w-1.5 rounded-full ${badge.dotColor || "bg-white/70"} animate-pulse`} />
              {badge.label}
            </span>
            {/* Official Source badge */}
            {isOfficial && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Official Source
              </span>
            )}
          </div>
          {/* Deadline badge */}
          {deadline && (
            <span className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
              isExpiringSoon
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
            }`}>
              {isExpiringSoon ? "⚠ " : ""}{deadline}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-3 text-base font-bold leading-6 text-[#1A3C6E] group-hover:text-[#3B82F6] transition-colors duration-200 sm:text-lg line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-1.5 text-sm leading-5 text-gray-500 line-clamp-2">{description}</p>
        )}

        {/* Metadata rows - clean text with icons */}
        {metadata && metadata.length > 0 && (
          <div className="mt-4 space-y-2">
            {metadata.map((row, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="shrink-0 text-[#3B82F6]">{row.icon}</span>
                <span className="truncate">{row.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Source / updated metadata */}
        {(sourceUrl || createdAt) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            {sourceUrl && (
              <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                {sourceUrl.replace(/^https?:\/\//, "").split("/")[0]}
              </span>
            )}
            {createdAt && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Save button */}
          {onToggleSaved && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={saving}
              aria-label={isSaved ? "Remove from saved" : "Save item"}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:w-auto ${
                isSaved
                  ? "border-[#3B82F6]/30 bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE] shadow-sm"
                  : "border-[#E5E7EB] bg-white text-gray-700 hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:shadow-sm"
              } ${saving ? "cursor-wait opacity-70" : ""}`}
            >
              {saving ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isSaved ? (
                <svg className="h-4 w-4 text-[#3B82F6]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              )}
              <span>{saving ? "Saving..." : isSaved ? "Saved" : "Save"}</span>
            </button>
          )}

          {/* Primary CTA */}
          <div className="flex gap-2.5">
            {(() => {
              const href = primaryAction.href || detailHref;
              const isExternal = href.startsWith("http");

              if (isExternal) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleActionClick}
                    onKeyDown={handleActionKeyDown}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${primaryAction.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97]`}
                  >
                    {primaryAction.label}
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                );
              }

              return (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e: MouseEvent<HTMLSpanElement>) => {
                    e.stopPropagation();
                    router.push(href);
                  }}
                  onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(href);
                    }
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${primaryAction.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97] cursor-pointer`}
                >
                  {primaryAction.label}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
