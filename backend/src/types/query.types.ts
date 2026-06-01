/**
 * Query Types for Listing APIs
 * Defines interfaces for pagination, filtering, sorting, and search
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface FilterParams {
  state?: string;
  category?: string;
  status?: string;
}

export interface SearchParams {
  search?: string;
}

export interface ListQuery extends PaginationParams, Partial<SortParams>, Partial<FilterParams>, Partial<SearchParams> {}

export interface ListResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type AllowedSortColumns = "created_at" | "updated_at" | "deadline" | "title";
export type AllowedFilterColumns = "state" | "category" | "status";
