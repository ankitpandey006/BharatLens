import {
  fetchRecommendations,
  fetchRecommendationsByItemType,
  generateRecommendationsForUser,
  markRecommendationViewed,
  type RecommendationListResult,
  type RecommendationProfile,
  type RecommendationResult,
  type RecommendationEntityType,
} from "../repositories/recommendation.repository";

export async function getRecommendations(
  userId: string,
  page: number,
  limit: number,
  profile?: RecommendationProfile | null,
): Promise<RecommendationListResult> {
  let result = await fetchRecommendations(userId, page, limit);

  // Auto-generate if empty and profile data is available
  if (result.items.length === 0 && profile) {
    const hasProfileData = Object.values(profile).some(
      (v) => v !== null && v !== undefined && v !== "",
    );
    if (hasProfileData) {
      try {
        console.log("[Recommendations] Auto-generating for user", userId);
        await generateRecommendationsForUser(userId, profile);
        result = await fetchRecommendations(userId, page, limit);
      } catch (err) {
        console.warn("[Recommendations] Auto-generation failed:", err);
      }
    }
  }

  return result;
}

export async function getRecommendationsByItemType(
  userId: string,
  itemType: RecommendationEntityType,
  page: number,
  limit: number,
): Promise<RecommendationListResult> {
  return fetchRecommendationsByItemType(userId, itemType, page, limit);
}

export async function generateRecommendations(userId: string, profile: RecommendationProfile): Promise<RecommendationResult[]> {
  return generateRecommendationsForUser(userId, profile);
}

export async function viewRecommendation(userId: string, id: string): Promise<RecommendationResult | null> {
  return markRecommendationViewed(userId, id);
}
