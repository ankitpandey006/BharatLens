import {
  fetchRecommendations,
  generateRecommendationsForUser,
  markRecommendationViewed,
  type RecommendationListResult,
  type RecommendationProfile,
  type RecommendationResult,
} from "../repositories/recommendation.repository";

export async function getRecommendations(userId: string, page: number, limit: number): Promise<RecommendationListResult> {
  return fetchRecommendations(userId, page, limit);
}

export async function generateRecommendations(userId: string, profile: RecommendationProfile): Promise<RecommendationResult[]> {
  return generateRecommendationsForUser(userId, profile);
}

export async function viewRecommendation(userId: string, id: string): Promise<RecommendationResult | null> {
  return markRecommendationViewed(userId, id);
}
