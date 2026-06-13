/**
 * SWR-based API hooks for client-side caching with stale-while-revalidate.
 * All GET requests benefit from deduping, caching, and background revalidation.
 *
 * DEFAULT_SWR_CONFIG:
 *   dedupingInterval: 5000   — dedupe concurrent requests within 5s
 *   revalidateOnFocus: false  — don't refetch on window focus to avoid flicker
 *   revalidateOnReconnect: false — don't refetch on reconnect
 *   shouldRetryOnError: false  — don't retry on error (show cached or error state)
 *   errorRetryCount: 0
 *
 * Pages can override these defaults per-hook as needed (e.g. search pages
 * may want shorter dedupingInterval).
 */

import useSWR, { type SWRConfiguration, type Key } from "swr";
import {
  fetchSchemes,
  fetchJobs,
  fetchExams,
  fetchScholarships,
  fetchSavedItems,
  fetchNotifications,
  fetchRecommendations,
  fetchSchemeById,
  fetchJobById,
  fetchExamById,
  fetchScholarshipById,
  type Scheme,
  type Job,
  type Exam,
  type Scholarship,
  type SavedItem,
  type Notification,
  type Recommendation,
  type PaginatedResponse,
  type ContentType,
} from "@/lib/api/content-api";
import { fetchDashboardSummary, type DashboardSummary } from "@/lib/api/dashboard-api";
import { getCurrentUser, type UserProfile } from "@/lib/api/auth-api";
import { fetchAdminStats, fetchAdminCollectedData, type BackendAdminStats, type BackendAdminContentItem } from "@/lib/api/admin";

// ─── Default SWR config ──────────────────────────────────────────
export const DEFAULT_SWR_CONFIG: SWRConfiguration = {
  dedupingInterval: 60000,       // dedupe within 60s (was 5s)
  revalidateOnFocus: false,      // don't refetch on tab focus
  revalidateOnReconnect: false,  // don't refetch on reconnect
  shouldRetryOnError: false,
  errorRetryCount: 0,
  keepPreviousData: true,        // always keep old data visible during refetch
};

// Faster refresh config for search/list pages (user may expect fresh data on filter change)
export const SEARCH_SWR_CONFIG: SWRConfiguration = {
  ...DEFAULT_SWR_CONFIG,
  dedupingInterval: 2000,
  keepPreviousData: true,
};

// ─── Generic fetcher ─────────────────────────────────────────────
async function fetcher<T>(url: string): Promise<T> {
  // This is never called directly; each hook uses its own fetcher.
  throw new Error("Direct fetcher not supported — use specific hooks");
}

// ─── Helper to build stable cache keys ───────────────────────────
function listKey(prefix: string, params?: Record<string, unknown>): string {
  if (!params) return prefix;
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${prefix}?${sorted}`;
}

// ─── Schemes ─────────────────────────────────────────────────────
export function useSchemes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}, swrConfig?: SWRConfiguration) {
  const key = listKey("schemes", params as Record<string, unknown>);
  return useSWR(key, () => fetchSchemes(params), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

export function useSchemeById(id: string | undefined, swrConfig?: SWRConfiguration) {
  return useSWR(
    id ? `scheme/${id}` : null,
    () => fetchSchemeById(id!),
    { ...DEFAULT_SWR_CONFIG, ...swrConfig },
  );
}

// ─── Jobs ────────────────────────────────────────────────────────
export function useJobs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  tab?: string;
}, swrConfig?: SWRConfiguration) {
  const key = listKey("jobs", params as Record<string, unknown>);
  return useSWR(key, () => fetchJobs(params), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

export function useJobById(id: string | undefined, swrConfig?: SWRConfiguration) {
  return useSWR(
    id ? `job/${id}` : null,
    () => fetchJobById(id!),
    { ...DEFAULT_SWR_CONFIG, ...swrConfig },
  );
}

// ─── Exams ───────────────────────────────────────────────────────
export function useExams(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  tab?: string;
}, swrConfig?: SWRConfiguration) {
  const key = listKey("exams", params as Record<string, unknown>);
  return useSWR(key, () => fetchExams(params), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

export function useExamById(id: string | undefined, swrConfig?: SWRConfiguration) {
  return useSWR(
    id ? `exam/${id}` : null,
    () => fetchExamById(id!),
    { ...DEFAULT_SWR_CONFIG, ...swrConfig },
  );
}

// ─── Scholarships ────────────────────────────────────────────────
export function useScholarships(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}, swrConfig?: SWRConfiguration) {
  const key = listKey("scholarships", params as Record<string, unknown>);
  return useSWR(key, () => fetchScholarships(params), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

export function useScholarshipById(id: string | undefined, swrConfig?: SWRConfiguration) {
  return useSWR(
    id ? `scholarship/${id}` : null,
    () => fetchScholarshipById(id!),
    { ...DEFAULT_SWR_CONFIG, ...swrConfig },
  );
}

// ─── Saved Items ─────────────────────────────────────────────────
export function useSavedItems(params?: {
  page?: number;
  limit?: number;
  item_type?: ContentType;
}, swrConfig?: SWRConfiguration) {
  const key = listKey("saved", params as Record<string, unknown>);
  return useSWR(key, () => fetchSavedItems({ ...params, optional: true }), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

// ─── Notifications ───────────────────────────────────────────────
export function useNotifications(params?: {
  page?: number;
  limit?: number;
}, swrConfig?: SWRConfiguration) {
  const key = listKey("notifications", params as Record<string, unknown>);
  return useSWR(key, () => fetchNotifications({ ...params, optional: true }), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

// ─── Recommendations ─────────────────────────────────────────────
export function useRecommendations(params?: {
  page?: number;
  limit?: number;
}, swrConfig?: SWRConfiguration) {
  const key = listKey("recommendations", params as Record<string, unknown>);
  return useSWR(key, () => fetchRecommendations({ ...params, optional: true }), {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

// ─── Dashboard Summary ───────────────────────────────────────────
export function useDashboardSummary(swrConfig?: SWRConfiguration) {
  return useSWR("dashboard/summary", fetchDashboardSummary, {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
    keepPreviousData: true,
  });
}

// ─── Current User (Profile) ──────────────────────────────────────
export function useCurrentUser(swrConfig?: SWRConfiguration) {
  return useSWR("current-user", getCurrentUser, {
    ...DEFAULT_SWR_CONFIG,
    revalidateOnMount: true,
    ...swrConfig,
  });
}

// ─── Admin Stats ─────────────────────────────────────────────────
export function useAdminStats(swrConfig?: SWRConfiguration) {
  return useSWR("admin/stats", fetchAdminStats, {
    ...DEFAULT_SWR_CONFIG,
    ...swrConfig,
  });
}

export function useAdminCollectedData(
  page: number,
  limit: number,
  status?: string,
  swrConfig?: SWRConfiguration,
) {
  const key = listKey("admin/collected-data", { page, limit, status: status ?? "all" });
  return useSWR(
    key,
    () => fetchAdminCollectedData(page, limit, status),
    { ...DEFAULT_SWR_CONFIG, ...swrConfig, keepPreviousData: true },
  );
}

// ─── Saved Items Map (for checkbox states) ───────────────────────
// This is a lower-level hook that just returns a map of item_id -> boolean
export function useSavedItemsMap(itemType?: ContentType, swrConfig?: SWRConfiguration) {
  const { data, ...rest } = useSavedItems(
    { limit: 200, item_type: itemType },
    { ...DEFAULT_SWR_CONFIG, ...swrConfig },
  );

  const savedMap: Record<string, boolean> = {};
  if (data?.items) {
    for (const item of data.items) {
      savedMap[item.item_id] = true;
    }
  }

  return { savedMap, ...rest, data };
}
