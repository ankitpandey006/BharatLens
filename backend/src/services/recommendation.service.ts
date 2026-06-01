import { fetchRecommendations, type RecommendationProfile, type RecommendationResult } from "../repositories/recommendation.repository";

export async function getRecommendations(profile: RecommendationProfile): Promise<RecommendationResult[]> {
  return fetchRecommendations(profile);
}
