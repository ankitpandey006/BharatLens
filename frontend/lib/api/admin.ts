import { apiClient } from "./client";
import type { ItemType, MainContentType } from "@/types/admin";

export type AdminItemType = MainContentType;
export type VerificationStatus = "pending" | "approved" | "rejected" | "published";

export interface BackendAdminStats {
  total_users: number;
  total_schemes: number;
  total_scholarships: number;
  total_jobs: number;
  total_exams: number;
  pending_items: number;
  approved_items: number;
  rejected_items: number;
  total_saved_items: number;
  total_notifications: number;
}

export interface BackendAdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface BackendAdminSource {
  id: string;
  name?: string;
  is_verified?: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface BackendAdminUpdate {
  id: string;
  title?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface BaseBackendItem {
  id: string;
  [key: string]: unknown;
}

export interface BackendAdminContentItem extends BaseBackendItem {
  title?: string;
  raw_title?: string;
  item_type?: string;
  processing_status?: string;
  verification_status?: string;
  status?: string;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  published_by?: string | null;
  published_at?: string | null;
  expired_by?: string | null;
  expired_at?: string | null;
  is_expired?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  source_name?: string;
  source_url?: string;
  sourceName?: string;
  sourceUrl?: string;
  rawUrl?: string;
  rawContent?: string;
  raw_content?: string;
  raw_url?: string;
  collection_method?: string;
  collectionMethod?: string;
  summary?: string;
  admin_notes?: string | null;
  category?: string;
  eligibility?: string;
  benefits?: string;
  deadline?: string | null;
  state?: string;
  description?: string;
  content?: string;
  name?: string;
  official_url?: string;
  apply_url?: string;
  link?: string;
  provider?: string;
  organization?: string;
  department?: string;
  conducting_body?: string;
  conductingBody?: string;
  location?: string;
  benefit?: string;
  amount?: string | number;
  vacancies?: string | number;
  qualification?: string;
  education?: string;
  exam_date?: string;
  examDate?: string;
  last_date?: string;
  application_end?: string;
  ai_confidence?: number;
  confidence?: number;
  source_trust?: number;
  ai_notes?: string;
  metadata?: Record<string, unknown>;
  ai_output?: Record<string, unknown>;
  processed_at?: string | null;
  verification_score?: number;
  verification_notes?: string | null;
  duplicate_reason?: string | null;
  normalized_title?: string | null;
  duplicate_of_id?: string | null;
}

export async function fetchAdminStats(): Promise<BackendAdminStats> {
  return apiClient("/admin/stats");
}

export async function fetchAdminUsers(): Promise<BackendAdminUser[]> {
  return apiClient("/admin/users");
}

export async function fetchAdminSources(): Promise<BackendAdminSource[]> {
  return apiClient("/admin/sources");
}

export async function fetchAdminUpdates(): Promise<BackendAdminUpdate[]> {
  return apiClient("/admin/updates");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAdminCollectedData(page = 1, limit = 50, status?: string): Promise<any> {
  const query = new URLSearchParams();
  query.append("page", String(page));
  query.append("limit", String(limit));
  if (status) query.append("status", status);
  return apiClient(`/admin/collected-data?${query.toString()}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function approveCollectedData(id: string, admin_notes?: string, edits?: Record<string, unknown>): Promise<any> {
  const body: Record<string, unknown> = {};
  if (admin_notes !== undefined) {
    body.admin_notes = admin_notes;
  }
  if (edits && Object.keys(edits).length > 0) {
    Object.assign(body, edits);
  }
  return apiClient(`/admin/collected-data/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function rejectCollectedData(id: string, rejection_reason?: string, admin_notes?: string): Promise<any> {
  return apiClient(`/admin/collected-data/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejection_reason, admin_notes }),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function editCollectedData(id: string, updates: Record<string, unknown>): Promise<any> {
  return apiClient(`/admin/collected-data/${id}/edit`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function publishCollectedData(id: string, itemType: string, payload: Record<string, unknown>): Promise<any> {
  return apiClient(`/admin/collected-data/${id}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ itemType, payload }),
  });
}

// ── Content Updates (Admin) API ──

export async function publishContentUpdate(data: {
  item_type: string;
  item_id: string;
  update_type: string;
  title: string;
  description?: string;
  official_url?: string;
  parent_content_type?: string | null;
  parent_content_id?: string | null;
  date?: string | null;
  deadline?: string | null;
  status?: string;
  source_id?: string | null;
  collected_data_id?: string | null;
}): Promise<any> {
  return apiClient("/updates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContentUpdateStatus(id: string, status: string, admin_notes?: string): Promise<any> {
  return apiClient(`/updates/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, admin_notes }),
  });
}

export async function fetchAdminContentUpdates(page = 1, limit = 20, status?: string): Promise<any> {
  const query = new URLSearchParams();
  query.append("page", String(page));
  query.append("limit", String(limit));
  if (status) query.append("status", status);
  return apiClient(`/updates/admin/all?${query.toString()}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function unpublishCollectedData(id: string): Promise<any> {
  return apiClient(`/admin/collected-data/${id}/unpublish`, {
    method: "PATCH",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteCollectedData(id: string): Promise<any> {
  return apiClient(`/admin/collected-data/${id}/delete`, {
    method: "PATCH",
  });
}

// ── AI Processing API ──

export async function processSingleItemWithAi(id: string): Promise<any> {
  return apiClient(`/ai-processing/process/${id}`, {
    method: "POST",
  });
}

export async function processPendingItemsWithAi(limit = 3): Promise<any> {
  return apiClient(`/ai-processing/process-pending?limit=${limit}`, {
    method: "POST",
  });
}

// ─── Bulk Actions ──────────────────────────────────────────────────

export interface BulkActionResult {
  success: boolean;
  processed: number;
  successCount: number;
  failedCount: number;
  failed: Array<{ id: string; reason: string }>;
}

export async function bulkApproveCollectedData(ids: string[], reason?: string): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-approve", {
    method: "POST",
    body: JSON.stringify({ ids, reason }),
  });
}

export async function bulkRejectCollectedData(ids: string[], reason?: string): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-reject", {
    method: "POST",
    body: JSON.stringify({ ids, reason }),
  });
}

export async function bulkPublishCollectedData(ids: string[]): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-publish", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function bulkUnpublishCollectedData(ids: string[]): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-unpublish", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function bulkRestoreCollectedData(ids: string[]): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-restore", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function bulkDeleteCollectedData(ids: string[]): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function bulkProcessAiCollectedData(ids: string[]): Promise<BulkActionResult> {
  return apiClient("/admin/collected-data/bulk-process-ai", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function getAiProcessingLogs(id: string): Promise<any> {
  return apiClient(`/ai-processing/logs/${id}`);
}

export async function recheckVerification(id: string): Promise<any> {
  return apiClient(`/ai-processing/recheck/${id}`, {
    method: "POST",
  });
}

export async function fetchAdminItemsByStatus(
  status: "pending" | "approved" | "rejected" | "published",
  itemType?: AdminItemType,
): Promise<BackendAdminContentItem[]> {
  const query = new URLSearchParams();
  if (itemType) {
    query.append("itemType", itemType);
  }
  return apiClient(`/admin/${status}?${query.toString()}`);
}
