/**
 * Content API services - fetch real data from backend
 * Each service handles a specific content type
 */

import { apiClient } from "./client";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Scheme {
  id: string;
  title: string;
  category: string;
  provider: string;
  description?: string;
  eligibility: string;
  benefit: string;
  deadline?: string;
  status?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  category: string;
  provider: string;
  description?: string;
  eligibility: string;
  amount?: string;
  deadline?: string;
  status?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  category?: string;
  organization: string;
  description?: string;
  qualification: string;
  location?: string;
  vacancies?: number;
  deadline?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Exam {
  id: string;
  title: string;
  category: string;
  conductingBody: string;
  description?: string;
  eligibility: string;
  examDate?: string;
  applicationDeadline?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type ContentType = "scheme" | "scholarship" | "job" | "exam";

export interface SavedItem {
  id: string;
  item_id: string;
  item_type: ContentType;
  item_data?: Scheme | Scholarship | Job | Exam;
  user_id?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  is_read?: boolean;
  created_at?: string;
  data?: Record<string, unknown>;
}

export interface Recommendation {
  id: string;
  item_id: string;
  item_type: "scheme" | "scholarship" | "job" | "exam";
  item_data?: Scheme | Scholarship | Job | Exam;
  match_score?: number;
  reason?: string;
  created_at?: string;
}

// Schemes API
export async function fetchSchemes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<Scheme>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.state) queryParams.append("state", params.state);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient<{
    data: Scheme[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/schemes?${queryParams.toString()}`);

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchSchemeById(id: string): Promise<Scheme> {
  return apiClient(`/schemes/${id}`);
}

// Scholarships API
export async function fetchScholarships(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<Scholarship>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.state) queryParams.append("state", params.state);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient<{
    data: Scholarship[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/scholarships?${queryParams.toString()}`);

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchScholarshipById(id: string): Promise<Scholarship> {
  return apiClient(`/scholarships/${id}`);
}

// Jobs API
export async function fetchJobs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<Job>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.state) queryParams.append("state", params.state);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient<{
    data: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/jobs?${queryParams.toString()}`);

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchJobById(id: string): Promise<Job> {
  return apiClient(`/jobs/${id}`);
}

// Exams API
export async function fetchExams(params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<Exam>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.state) queryParams.append("state", params.state);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient<{
    data: Exam[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/exams?${queryParams.toString()}`);

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchExamById(id: string): Promise<Exam> {
  return apiClient(`/exams/${id}`);
}

// Saved Items API
export async function fetchSavedItems(params?: {
  page?: number;
  limit?: number;
  item_type?: "scheme" | "scholarship" | "job" | "exam";
  optional?: boolean;
}): Promise<PaginatedResponse<SavedItem>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.item_type) queryParams.append("item_type", params.item_type);

  const response = await apiClient<{
    data: SavedItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/saved?${queryParams.toString()}`, { optional: params?.optional });

  if (!response) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: params?.limit ?? 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function saveItem(
  itemId: string,
  itemType: ContentType,
): Promise<SavedItem> {
  return apiClient("/saved", {
    method: "POST",
    body: JSON.stringify({
      item_id: itemId,
      item_type: itemType,
    }),
  });
}

export async function unsaveItem(
  itemId: string,
  itemType: ContentType,
): Promise<void> {
  await apiClient(`/saved/item/${itemType}/${itemId}`, {
    method: "DELETE",
  });
}

export async function checkSavedItem(
  itemId: string,
  itemType: ContentType,
): Promise<boolean> {
  const response = await apiClient<{ saved: boolean }>(
    `/saved/${itemType}/${itemId}/check`,
  );
  return response.saved;
}

// Notifications API
export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  optional?: boolean;
}): Promise<PaginatedResponse<Notification>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const response = await apiClient<{
    data: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/notifications?${queryParams.toString()}`, { optional: params?.optional });

  if (!response) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: params?.limit ?? 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

// Recommendations API
export async function fetchRecommendations(params?: {
  page?: number;
  limit?: number;
  optional?: boolean;
}): Promise<PaginatedResponse<Recommendation>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const response = await apiClient<{
    data: Recommendation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(`/recommendations?${queryParams.toString()}`, { optional: params?.optional });

  if (!response) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: params?.limit ?? 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  return {
    items: response.data || [],
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}
export interface DashboardStatsResponse {
  total_schemes: number;
  total_scholarships: number;
  total_jobs: number;
  total_exams: number;
  total_saved_items: number;
  total_notifications: number;
}

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const [schemes, scholarships, jobs, exams, savedItems, notifications] = await Promise.all([
    fetchSchemes({ limit: 1 }),
    fetchScholarships({ limit: 1 }),
    fetchJobs({ limit: 1 }),
    fetchExams({ limit: 1 }),
    fetchSavedItems({ limit: 1, optional: true }),
    fetchNotifications({ limit: 1, optional: true }),
  ]);

  return {
    total_schemes: schemes.total,
    total_scholarships: scholarships.total,
    total_jobs: jobs.total,
    total_exams: exams.total,
    total_saved_items: savedItems.total,
    total_notifications: notifications.total,
  };
}

// Admin Stats API
export async function fetchAdminStats(): Promise<{
  total_users: number;
  total_schemes: number;
  total_scholarships: number;
  total_jobs: number;
  total_exams: number;
  pending_items: number;
  approved_items: number;
  rejected_items: number;
  published_items: number;
  total_saved_items: number;
  total_notifications: number;
}> {
  return apiClient("/admin/stats");
}
