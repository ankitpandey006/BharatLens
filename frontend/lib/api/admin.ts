import { get, patch, ApiResponse } from "./client";
import type { AdminStats, AdminItem as UiAdminItem } from "@/types/admin";

interface AdminApiUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  profile_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AdminApiSource {
  id: string;
  name: string;
  type: string;
  url: string;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AdminApiUpdate {
  id: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface AdminApiItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  state?: string;
  status?: string;
  verification_status?: string;
  item_type?: string;
  provider?: string;
  benefit?: string;
  eligibility?: string;
  deadline?: string;
  official_url?: string;
  created_at?: string;
  updated_at?: string;
}

function safeItemType(itemType?: string): UiAdminItem["type"] {
  if (itemType === "scholarship" || itemType === "job" || itemType === "exam" || itemType === "scheme" || itemType === "update") {
    return itemType;
  }

  return "scheme";
}

function mapApiItemToUiItem(item: AdminApiItem): UiAdminItem {
  const type = safeItemType(item.item_type);
  const category = (item.category as UiAdminItem["category"]) || "general";

  return {
    id: item.id,
    title: item.title || "Untitled item",
    type,
    category,
    sourceName: item.provider || "Unknown source",
    sourceUrl: item.official_url || "",
    summary: item.description || "",
    eligibility: item.eligibility || "Not specified",
    benefits: item.benefit || "Not specified",
    deadline: item.deadline || null,
    state: item.state || "",
    status:
      item.status === "approved" || item.status === "published"
        ? item.status
        : item.status === "rejected"
        ? "rejected"
        : item.status === "pending_verification"
        ? "pending_verification"
        : "ai_processed",
    aiConfidenceScore: 70,
    sourceTrustScore: 70,
    aiNotes: item.description || "",
    adminNotes: "",
    lastUpdated: item.updated_at || new Date().toISOString(),
    publishedAt: item.status === "published" ? item.updated_at || new Date().toISOString() : null,
    tags: [category],
    matchedUsersCount: undefined,
    recommendationEligible:
      item.status === "approved" || item.status === "published",
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await get<ApiResponse<AdminStats>>("/api/admin/stats");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch admin stats");
  }

  return response.data as AdminStats;
}

export async function getAdminUsers(): Promise<AdminApiUser[]> {
  const response = await get<ApiResponse<AdminApiUser[]>>("/api/admin/users");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch admin users");
  }

  return response.data || [];
}

export async function getAdminSources(): Promise<AdminApiSource[]> {
  const response = await get<ApiResponse<AdminApiSource[]>>("/api/admin/sources");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch admin sources");
  }

  return response.data || [];
}

export async function getAdminUpdates(): Promise<AdminApiUpdate[]> {
  const response = await get<ApiResponse<AdminApiUpdate[]>>("/api/admin/updates");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch admin updates");
  }

  return response.data || [];
}

export async function getAdminItemsByStatus(
  status: string,
  itemType?: string,
): Promise<UiAdminItem[]> {
  const query = itemType ? `?itemType=${encodeURIComponent(itemType)}` : "";
  const response = await get<ApiResponse<AdminApiItem[]>>(
    `/api/admin/items/${encodeURIComponent(status)}${query}`,
  );

  if (!response.success) {
    throw new Error(response.message || `Failed to fetch admin ${status} items`);
  }

  return (response.data || []).map(mapApiItemToUiItem);
}

export async function verifyAdminSource(id: string): Promise<AdminApiSource> {
  const response = await patch<ApiResponse<AdminApiSource>>(
    `/api/admin/sources/${encodeURIComponent(id)}/verify`,
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to verify source");
  }

  return response.data as AdminApiSource;
}

export async function approveAdminItem(
  itemType: string,
  itemId: string,
): Promise<UiAdminItem> {
  const response = await patch<ApiResponse<AdminApiItem>>(
    `/api/admin/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}/approve`,
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to approve item");
  }

  return mapApiItemToUiItem(response.data as AdminApiItem);
}

export async function rejectAdminItem(
  itemType: string,
  itemId: string,
  reason: string,
): Promise<UiAdminItem> {
  const response = await patch<ApiResponse<AdminApiItem>>(
    `/api/admin/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}/reject`,
    { reason },
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to reject item");
  }

  return mapApiItemToUiItem(response.data as AdminApiItem);
}

export async function publishAdminItem(
  itemType: string,
  itemId: string,
): Promise<UiAdminItem> {
  const response = await patch<ApiResponse<AdminApiItem>>(
    `/api/admin/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}/publish`,
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to publish item");
  }

  return mapApiItemToUiItem(response.data as AdminApiItem);
}
