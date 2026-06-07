/**
 * Content API services - fetch real data from backend
 * Each service handles a specific content type
 */

import { apiClient, type ApiResponse } from "./client";

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
  official_url?: string;
  apply_url?: string;
  source_url?: string;
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
  official_url?: string;
  apply_url?: string;
  source_url?: string;
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
  official_url?: string;
  apply_url?: string;
  source_url?: string;
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
  official_url?: string;
  apply_url?: string;
  source_url?: string;
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

function normalizeStringField(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeNumberField(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function normalizeExam(raw: unknown): Exam {
  const data = raw as Record<string, unknown>;
  return {
    id: normalizeStringField(data.id) ?? "",
    title: normalizeStringField(data.title) ?? "",
    category: normalizeStringField(data.category) ?? "",
    conductingBody:
      normalizeStringField(data.conducting_body) ??
      normalizeStringField(data.conductingBody) ??
      "",
    description: normalizeStringField(data.description),
    eligibility: normalizeStringField(data.eligibility) ?? "",
    examDate:
      normalizeStringField(data.exam_date) ??
      normalizeStringField(data.examDate) ??
      undefined,
    applicationDeadline:
      normalizeStringField(data.application_deadline) ??
      normalizeStringField(data.application_end_date) ??
      normalizeStringField(data.applicationDeadline) ??
      undefined,
    status: normalizeStringField(data.status),
    official_url: normalizeStringField(data.official_url),
    apply_url: normalizeStringField(data.apply_url),
    source_url: normalizeStringField(data.source_url),
    created_at: normalizeStringField(data.created_at),
    updated_at: normalizeStringField(data.updated_at),
  };
}

function normalizeScheme(raw: unknown): Scheme {
  const data = raw as Record<string, unknown>;
  return {
    id: normalizeStringField(data.id) ?? "",
    title: normalizeStringField(data.title) ?? "",
    category: normalizeStringField(data.category) ?? "",
    provider: normalizeStringField(data.provider) ?? "",
    description: normalizeStringField(data.description),
    eligibility: normalizeStringField(data.eligibility) ?? "",
    benefit: normalizeStringField(data.benefit) ?? "",
    deadline:
      normalizeStringField(data.deadline) ??
      normalizeStringField(data.application_end_date) ??
      normalizeStringField(data.applicationDeadline) ??
      undefined,
    status: normalizeStringField(data.status),
    state: normalizeStringField(data.state),
    official_url: normalizeStringField(data.official_url),
    apply_url: normalizeStringField(data.apply_url),
    source_url: normalizeStringField(data.source_url),
    created_at: normalizeStringField(data.created_at),
    updated_at: normalizeStringField(data.updated_at),
  };
}

function normalizeScholarship(raw: unknown): Scholarship {
  const data = raw as Record<string, unknown>;
  return {
    id: normalizeStringField(data.id) ?? "",
    title: normalizeStringField(data.title) ?? "",
    category: normalizeStringField(data.category) ?? "",
    provider: normalizeStringField(data.provider) ?? "",
    description: normalizeStringField(data.description),
    eligibility: normalizeStringField(data.eligibility) ?? "",
    amount: normalizeStringField(data.amount),
    deadline:
      normalizeStringField(data.deadline) ??
      normalizeStringField(data.application_end_date) ??
      normalizeStringField(data.applicationDeadline) ??
      undefined,
    status: normalizeStringField(data.status),
    state: normalizeStringField(data.state),
    official_url: normalizeStringField(data.official_url),
    apply_url: normalizeStringField(data.apply_url),
    source_url: normalizeStringField(data.source_url),
    created_at: normalizeStringField(data.created_at),
    updated_at: normalizeStringField(data.updated_at),
  };
}

function normalizeJob(raw: unknown): Job {
  const data = raw as Record<string, unknown>;
  return {
    id: normalizeStringField(data.id) ?? "",
    title: normalizeStringField(data.title) ?? "",
    category: normalizeStringField(data.category),
    organization: normalizeStringField(data.organization) ?? "",
    description: normalizeStringField(data.description),
    qualification: normalizeStringField(data.qualification) ?? "",
    location:
      normalizeStringField(data.location) ??
      normalizeStringField(data.state) ??
      undefined,
    vacancies: normalizeNumberField(data.vacancies),
    deadline:
      normalizeStringField(data.deadline) ??
      normalizeStringField(data.application_end_date) ??
      normalizeStringField(data.applicationDeadline) ??
      undefined,
    status: normalizeStringField(data.status),
    official_url: normalizeStringField(data.official_url),
    apply_url: normalizeStringField(data.apply_url),
    source_url: normalizeStringField(data.source_url),
    created_at: normalizeStringField(data.created_at),
    updated_at: normalizeStringField(data.updated_at),
  };
}

function normalizeSavedItem(raw: unknown): SavedItem {
  const data = raw as Record<string, unknown>;
  const itemData = data.item_data as Record<string, unknown> | undefined;
  const itemType = normalizeStringField(data.item_type) as ContentType | undefined;

  const normalizedData = itemType === "exam"
    ? normalizeExam(itemData ?? {})
    : itemType === "job"
    ? normalizeJob(itemData ?? {})
    : itemType === "scholarship"
    ? normalizeScholarship(itemData ?? {})
    : normalizeScheme(itemData ?? {});

  return {
    id: normalizeStringField(data.id) ?? "",
    item_id: normalizeStringField(data.item_id) ?? "",
    item_type: itemType ?? "scheme",
    item_data: normalizedData,
    user_id: normalizeStringField(data.user_id),
    created_at: normalizeStringField(data.created_at),
  };
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

  const response = await apiClient<ApiResponse<Scheme[]>>(
    `/schemes?${queryParams.toString()}`,
    { rawResponse: true },
  );

  const items = Array.isArray(response.data)
    ? response.data.map((item) => normalizeScheme(item as unknown))
    : [];

  return {
    items,
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchSchemeById(id: string): Promise<Scheme> {
  const raw = await apiClient<Record<string, unknown>>(`/schemes/${id}`);
  return normalizeScheme(raw);
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

  const response = await apiClient<ApiResponse<Scholarship[]>>(
    `/scholarships?${queryParams.toString()}`,
    { rawResponse: true },
  );

  const items = Array.isArray(response.data)
    ? response.data.map((item) => normalizeScholarship(item as unknown))
    : [];

  return {
    items,
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchScholarshipById(id: string): Promise<Scholarship> {
  const raw = await apiClient<Record<string, unknown>>(`/scholarships/${id}`);
  return normalizeScholarship(raw);
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

  const response = await apiClient<ApiResponse<Job[]>>(
    `/jobs?${queryParams.toString()}`,
    { rawResponse: true },
  );

  const items = Array.isArray(response.data)
    ? response.data.map((item) => normalizeJob(item as unknown))
    : [];

  return {
    items,
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchJobById(id: string): Promise<Job> {
  const raw = await apiClient<Record<string, unknown>>(`/jobs/${id}`);
  return normalizeJob(raw);
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

  const response = await apiClient<ApiResponse<Exam[]>>(
    `/exams?${queryParams.toString()}`,
    { rawResponse: true },
  );

  const items = Array.isArray(response.data)
    ? response.data.map((item) => normalizeExam(item as unknown))
    : [];

  return {
    items,
    total: response.pagination?.total || 0,
    page: response.pagination?.page || 1,
    limit: response.pagination?.limit || 10,
    totalPages: response.pagination?.totalPages || 1,
    hasNextPage: response.pagination?.hasNextPage || false,
    hasPreviousPage: response.pagination?.hasPreviousPage || false,
  };
}

export async function fetchExamById(id: string): Promise<Exam> {
  const raw = await apiClient<Record<string, unknown>>(`/exams/${id}`);
  return normalizeExam(raw);
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

  const response = await apiClient<ApiResponse<SavedItem[]>>(
    `/saved?${queryParams.toString()}`,
    { optional: params?.optional, rawResponse: true },
  );

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
    items: Array.isArray(response.data)
      ? response.data.map((item) => normalizeSavedItem(item as unknown))
      : [],
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
