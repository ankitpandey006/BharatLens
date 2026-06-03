import { get, post, patch, RecommendationsListResponse, ApiResponse } from "./client";

export interface Recommendation {
  id: string;
  user_id: string;
  item_id: string;
  item_type: "scheme" | "scholarship" | "job" | "exam";
  reason: string;
  score: number;
  is_viewed: boolean;
  created_at?: string;
  updated_at?: string;
  title?: string;
  description?: string;
}

/**
 * Fetch recommendations for current user
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  const response = await get<RecommendationsListResponse>("/api/recommendations");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch recommendations");
  }

  return response.data?.items || [];
}

/**
 * Generate recommendations for current user
 */
export async function generateRecommendations(): Promise<Recommendation[]> {
  const response = await post<RecommendationsListResponse>(
    "/api/recommendations/generate"
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to generate recommendations");
  }

  return response.data?.items || [];
}

/**
 * Get recommendations by type
 */
export async function getRecommendationsByType(
  itemType: "scheme" | "scholarship" | "job" | "exam"
): Promise<Recommendation[]> {
  const response = await get<RecommendationsListResponse>(
    `/api/recommendations/${itemType}`
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch recommendations");
  }

  return response.data?.items || [];
}

/**
 * Mark a recommendation as viewed
 */
export async function markRecommendationViewed(id: string): Promise<Recommendation> {
  const response = await patch<ApiResponse<Recommendation>>(
    `/api/recommendations/${id}/viewed`
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to mark recommendation as viewed");
  }

  return response.data as Recommendation;
}
