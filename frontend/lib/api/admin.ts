import { apiClient } from "./client";

export type AdminItemType = "scheme" | "scholarship" | "job" | "exam";

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

export interface BackendAdminContentItem {
  id: string;
  title?: string;
  item_type?: AdminItemType;
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
  category?: string;
  [key: string]: unknown;
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
