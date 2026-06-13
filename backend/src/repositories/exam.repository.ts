/**
 * Exam Repository
 * Handles all exam data operations with Supabase
 * Supports pagination, filtering, searching, sorting, and tab-based filtering via content_updates
 */

import { supabase } from "../config/supabase";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult, AllowedSortColumns } from "../types/query.types";
import { calculateOffset, calculatePaginationMeta } from "../utils/query-parser";
import { AppError } from "../utils/app-error";

export interface ExamItem {
  id: string;
  exam_name?: string;
  title: string;
  description?: string;
  conducting_body?: string;
  category?: string;
  state?: string;
  sub_category?: string;
  notification_date?: string;
  application_start_date?: string;
  application_end_date?: string;
  admit_card_date?: string;
  result_date?: string;
  status: string;
  verification_status?: string;
  official_url?: string;
  apply_url?: string;
  source_url?: string;
  search_text?: string;
  source_id?: string;
  is_expired?: boolean;
  expired_at?: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Tab-filter/update badge fields populated by the service
  updates?: {
    apply: boolean;
    admit_card: boolean;
    result: boolean;
    notification: boolean;
    answer_key?: boolean;
  };
  updateLinks?: {
    apply?: string;
    admit_card?: string;
    result?: string;
    notification?: string;
    answer_key?: string;
  };
}

/**
 * Fetch all exams with pagination, filtering, searching, and sorting
 * Supports ?tab= parameter for content_updates-based filtering
 * @param query Query parameters including pagination, filters, search, sorting, and tab
 * @returns ListResult with items and pagination metadata
 */
export async function getAllExams(query: ListQueryInput & { tab?: string }): Promise<ListResult<ExamItem>> {
  try {
    const { page, limit, sortBy = "created_at", sortOrder = "desc", state, category, status, search, tab } = query;

    const offset = calculateOffset(page, limit);

    // If tab is specified and not "all", filter by sub_category directly
    if (tab && tab !== "all") {
      let examQuery = supabase
        .from("exams")
        .select("*", { count: "exact" })
        .eq("sub_category", tab)
        .eq("status", "active")
        .eq("verification_status", "published")
        .eq("is_expired", false);

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        examQuery = examQuery.or(
          `title.ilike.${searchPattern},description.ilike.${searchPattern},search_text.ilike.${searchPattern}`
        );
      }
      if (state && state.trim()) {
        examQuery = examQuery.eq("state", state.trim());
      }
      if (category && category.trim()) {
        examQuery = examQuery.eq("category", category.trim());
      }

      const isAscending = sortOrder === "asc";
      examQuery = examQuery.order(sortBy as AllowedSortColumns, { ascending: isAscending });
      examQuery = examQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await examQuery;

      if (error) {
        throw new AppError(
          `Failed to fetch exams by sub_category: ${error.message}`,
          error.code === "42501" ? 403 : 500,
        );
      }

      const total = count ?? 0;
      return {
        items: (data ?? []).map(normalizeExamRow),
        pagination: calculatePaginationMeta(page, limit, total),
      };
    }

    // Standard query without tab filter
    let sqlQuery = supabase.from("exams").select("*", { count: "exact" });

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

    // Public website should only surface active, published, non-expired content
    sqlQuery = sqlQuery
      .eq("status", "active")
      .eq("verification_status", "published")
      .eq("is_expired", false);
    if (status && status.trim()) {
      sqlQuery = sqlQuery.eq("status", status.trim());
    }

    const isAscending = sortOrder === "asc";
    sqlQuery = sqlQuery.order(sortBy as AllowedSortColumns, { ascending: isAscending });
    sqlQuery = sqlQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await sqlQuery;

    if (error) {
      throw new AppError(
        `Failed to fetch exams from database: ${error.message}`,
        error.code === "42501" ? 403 : 500,
      );
    }

    if (!data) {
      throw new AppError("No data returned from database", 500);
    }

    const total = count ?? 0;
    console.log("[exam-repo] GET /api/exams — total returned:", total);
    if (data.length > 0) {
      for (const row of data) {
        console.log(
          `[exam-repo]   id=${row.id} exam_name="${String(row.exam_name ?? row.title ?? "").slice(0, 60)}" ` +
          `verification_status=${row.verification_status} status=${row.status} ` +
          `is_expired=${row.is_expired} published_at=${row.published_at}`
        );
      }
    }

    const pagination = calculatePaginationMeta(page, limit, total);

    return {
      items: data.map(normalizeExamRow),
      pagination,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Exam repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

function normalizeExamRow(raw: Record<string, unknown>): ExamItem {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? raw.exam_name ?? ""),
    exam_name: String(raw.exam_name ?? raw.title ?? ""),
    description: raw.description as string | undefined,
    conducting_body: raw.conducting_body as string | undefined,
    category: raw.category as string | undefined,
    state: raw.state as string | undefined,
    sub_category: raw.sub_category as string | undefined,
    notification_date: raw.notification_date as string | undefined,
    application_start_date: raw.application_start_date as string | undefined,
    application_end_date: raw.application_end_date as string | undefined,
    admit_card_date: raw.admit_card_date as string | undefined,
    result_date: raw.result_date as string | undefined,
    status: String(raw.status ?? "active"),
    verification_status: raw.verification_status as string | undefined,
    official_url: raw.official_url as string | undefined,
    apply_url: raw.apply_url as string | undefined,
    source_url: raw.source_url as string | undefined,
    search_text: raw.search_text as string | undefined,
    source_id: raw.source_id as string | undefined,
    is_expired: Boolean(raw.is_expired),
    expired_at: raw.expired_at as string | undefined,
    published_at: raw.published_at as string | null | undefined,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

/**
 * Fetch a single exam by ID (public endpoint — only returns active, published, non-expired)
 * For admin/internal lookups, query the exams table directly without filters.
 * @param id Exam ID
 * @returns Exam item or null if not found or not publicly visible
 */
export async function getExamById(id: string): Promise<ExamItem | null> {
  try {
    if (!id || id.trim() === "") {
      throw new AppError("Exam ID is required", 400);
    }

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .eq("verification_status", "published")
      .eq("is_expired", false)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to fetch exam from database: ${error.message}`,
        error.code === "42501" ? 403 : 500,
      );
    }

    if (data) {
      console.log(
        `[exam-repo] GET /api/exams/:id — found id=${data.id} exam_name="${String(data.exam_name ?? data.title ?? "").slice(0, 60)}" ` +
        `verification_status=${data.verification_status} status=${data.status} is_expired=${data.is_expired}`
      );
    }

    return data ? normalizeExamRow(data as Record<string, unknown>) : null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Exam repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}
