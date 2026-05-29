import { exams } from "./exams";
import { jobs } from "./jobs";
import { scholarships } from "./scholarships";
import { schemes } from "./schemes";
import { userProfiles } from "./userProfiles";
import { users } from "./users";

export type RecommendationType = "scheme" | "scholarship" | "job" | "exam";
export type RecommendationStatus = "active" | "pending" | "approved" | "rejected";

export interface Recommendation {
  id: string;
  user_id: string;
  recommendation_type: RecommendationType;
  entity_id: string;
  match_score: number;
  reason: string;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

const recommendationPool = {
  scheme: schemes.slice(0, 20),
  scholarship: scholarships.slice(0, 20),
  job: jobs.slice(0, 20),
  exam: exams.slice(0, 20),
};

export const recommendations: Recommendation[] = users.flatMap((user, index) => {
  const profile = userProfiles[index];
  const types: RecommendationType[] = ["scheme", "scholarship", "job", "exam"];

  return types.map((type, offset) => {
    const item = recommendationPool[type][(index + offset * 3) % recommendationPool[type].length];
    const baseScore = 60 + ((index * 7 + offset * 9) % 41);
    const status: RecommendationStatus = baseScore < 65 ? "pending" : baseScore > 95 ? "approved" : "active";

    return {
      id: `rec-${String(index + 1).padStart(2, "0")}-${type}`,
      user_id: user.id,
      recommendation_type: type,
      entity_id: item.id,
      match_score: baseScore,
      reason: `Matches ${profile.category} ${profile.user_type.replace("_", " ")} profile from ${profile.state} with ${profile.education_level} background.`,
      status: index % 19 === 0 && offset === 2 ? "rejected" : status,
      created_at: now,
      updated_at: now,
    };
  });
});

export const getRecommendationsForUser = (userId: string): Recommendation[] =>
  recommendations.filter((recommendation) => recommendation.user_id === userId);

export const getTopRecommendations = (userId: string, limit = 5): Recommendation[] =>
  getRecommendationsForUser(userId)
    .filter((item) => item.status !== "rejected")
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);

export const recommendationSearchExample = (query: string): Recommendation[] => {
  const term = query.toLowerCase();
  return recommendations.filter((rec) => rec.reason.toLowerCase().includes(term));
};
