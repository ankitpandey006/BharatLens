/**
 * Job Repository
 * Handles all job data operations with Supabase
 * Supports pagination, filtering, searching, sorting, and tab-based filtering via content_updates
 */

import { supabase } from "../config/supabase";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult, AllowedSortColumns } from "../types/query.types";
import { calculateOffset, calculatePaginationMeta } from "../utils/query-parser";
import { AppError } from "../utils/app-error";

export interface JobItem {
  id: string;
  title: string;
  description?: string;
  department?: string;
  organization?: string;
  state?: string;
  category?: string;
  sub_category?: string;
  qualification?: string;
  vacancies?: number;
  deadline?: string;
  status: string;
  verification_status?: string;
  official_url?: string;
  apply_url?: string;
  source_url?: string;
  search_text?: string;
  source_id?: string;
  location?: string;
  is_expired?: boolean;
  expired_at?: string;
  created_at?: string;
  updated_at?: string;
  // Tab-filter/update badge fields populated by the service
  updates?: {
    apply: boolean;
    admit_card: boolean;
    result: boolean;
    notification: boolean;
  };
  updateLinks?: {
    apply?: string;
    admit_card?: string;
    result?: string;
    notification?: string;
  };
}

/**
 * Fetch all jobs with pagination, filtering, searching, and sorting
 * Supports ?tab= parameter for content_updates-based filtering
 * @param query Query parameters including pagination, filters, search, sorting, and tab
 * @returns ListResult with items and pagination metadata
 */
export async function getAllJobs(query: ListQueryInput & { tab?: string }): Promise<ListResult<JobItem>> {
  try {
    const { page, limit, sortBy = "created_at", sortOrder = "desc", state, category, status, search, tab } = query;

    const offset = calculateOffset(page, limit);

    // If tab is specified and not "all", filter by sub_category directly
    if (tab && tab !== "all") {
      let jobQuery = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("sub_category", tab)
        .eq("status", "active")
        .eq("verification_status", "published");

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        jobQuery = jobQuery.or(
          `title.ilike.${searchPattern},description.ilike.${searchPattern},search_text.ilike.${searchPattern}`
        );
      }
      if (state && state.trim()) {
        jobQuery = jobQuery.eq("state", state.trim());
      }
      if (category && category.trim()) {
        jobQuery = jobQuery.eq("category", category.trim());
      }

      const isAscending = sortOrder === "asc";
      jobQuery = jobQuery.order(sortBy as AllowedSortColumns, { ascending: isAscending });
      jobQuery = jobQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await jobQuery;

      if (error) {
        throw new AppError(
          `Failed to fetch jobs by sub_category: ${error.message}`,
          error.code === "42501" ? 403 : 500,
        );
      }

      const total = count ?? 0;
      return {
        items: (data ?? []).map(normalizeJobRow),
        pagination: calculatePaginationMeta(page, limit, total),
      };
    }

    // Standard query without tab filter
    let sqlQuery = supabase.from("jobs").select("*", { count: "exact" });

    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      sqlQuery = sqlQuery.or(
        `title.ilike.${searchPattern},description.ilike.${searchPattern},search_text.ilike.${searchPattern}`
      );
    }
    if (state && state.trim()) {
      sqlQuery = sqlQuery.eq("state", state.trim());
    }
    if (category && category.trim()) {
      sqlQuery = sqlQuery.eq("category", category.trim());
    }

    // Public website should only surface active, published content
    sqlQuery = sqlQuery.eq("status", "active").eq("verification_status", "published");
    if (status && status.trim()) {
      sqlQuery = sqlQuery.eq("status", status.trim());
    }

    const isAscending = sortOrder === "asc";
    sqlQuery = sqlQuery.order(sortBy as AllowedSortColumns, { ascending: isAscending });
    sqlQuery = sqlQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await sqlQuery;

    if (error) {
      throw new AppError(
        `Failed to fetch jobs from database: ${error.message}`,
        error.code === "42501" ? 403 : 500,
      );
    }

    if (!data) {
      throw new AppError("No data returned from database", 500);
    }

    const total = count ?? 0;
    const pagination = calculatePaginationMeta(page, limit, total);

    return {
      items: data.map(normalizeJobRow),
      pagination,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Job repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

function normalizeJobRow(raw: Record<string, unknown>): JobItem {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: raw.description as string | undefined,
    department: raw.department as string | undefined,
    organization: raw.organization as string | undefined,
    state: raw.state as string | undefined,
    category: raw.category as string | undefined,
    sub_category: raw.sub_category as string | undefined,
    qualification: raw.qualification as string | undefined,
    vacancies: raw.vacancies as number | undefined,
    deadline: raw.deadline as string | undefined,
    status: String(raw.status ?? "active"),
    verification_status: raw.verification_status as string | undefined,
    official_url: raw.official_url as string | undefined,
    apply_url: raw.apply_url as string | undefined,
    source_url: raw.source_url as string | undefined,
    search_text: raw.search_text as string | undefined,
    source_id: raw.source_id as string | undefined,
    location: raw.location as string | undefined ?? raw.state as string | undefined,
    is_expired: Boolean(raw.is_expired),
    expired_at: raw.expired_at as string | undefined,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

/**
 * Fetch a single job by ID
 * @param id Job ID
 * @returns Job item or null if not found
 */
export async function getJobById(id: string): Promise<JobItem | null> {
  try {
    if (!id || id.trim() === "") {
      throw new AppError("Job ID is required", 400);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to fetch job from database: ${error.message}`,
        error.code === "42501" ? 403 : 500,
      );
    }

    return data ? normalizeJobRow(data as Record<string, unknown>) : null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Job repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}
