import { getAllSchemes, type SchemeItem } from "./scheme.repository";
import { getAllScholarships, type ScholarshipItem } from "./scholarship.repository";
import { getAllJobs, type JobItem } from "./job.repository";
import { getAllExams, type ExamItem } from "./exam.repository";
import type { ListQueryInput } from "../validators/query.validator";

export type RecommendationEntityType = "scheme" | "scholarship" | "job" | "exam";

export interface RecommendationResult {
  id: string;
  type: RecommendationEntityType;
  title: string;
  description: string;
  score: number;
  source: string;
}

export interface RecommendationProfile {
  state?: string;
  education?: string;
  occupation?: string;
  interests?: string[];
}

export interface RecommendationRepository {
  fetchRecommendations(profile: RecommendationProfile): Promise<RecommendationResult[]>;
}

function mapScheme(item: SchemeItem, score: number): RecommendationResult {
  return {
    id: item.id,
    type: "scheme",
    title: item.title,
    description: item.description,
    score,
    source: "Scheme",
  };
}

function mapScholarship(item: ScholarshipItem, score: number): RecommendationResult {
  return {
    id: item.id,
    type: "scholarship",
    title: item.title,
    description: item.description,
    score,
    source: "Scholarship",
  };
}

function mapJob(item: JobItem, score: number): RecommendationResult {
  return {
    id: item.id,
    type: "job",
    title: item.title,
    description: item.description,
    score,
    source: "Job",
  };
}

function mapExam(item: ExamItem, score: number): RecommendationResult {
  return {
    id: item.id,
    type: "exam",
    title: item.title,
    description: item.description,
    score,
    source: "Exam",
  };
}

function scoreItem(baseScore: number, profile: RecommendationProfile, keywords: string[]): number {
  let score = baseScore;

  if (profile.state && keywords.some((keyword) => keyword.toLowerCase().includes(profile.state!.toLowerCase()))) {
    score += 10;
  }

  if (profile.education && keywords.some((keyword) => keyword.toLowerCase().includes(profile.education!.toLowerCase()))) {
    score += 10;
  }

  if (profile.occupation && keywords.some((keyword) => keyword.toLowerCase().includes(profile.occupation!.toLowerCase()))) {
    score += 10;
  }

  if (profile.interests?.length) {
    const interestMatches = profile.interests.filter((interest) =>
      keywords.some((keyword) => keyword.toLowerCase().includes(interest.toLowerCase())),
    );
    score += interestMatches.length * 5;
  }

  return Math.min(score, 100);
}

// Default query to fetch all items without filtering
const defaultQuery: ListQueryInput = {
  page: 1,
  limit: 1000, // Large limit to get all items for recommendations
  sortBy: "created_at",
  sortOrder: "desc",
};

export async function fetchRecommendations(profile: RecommendationProfile): Promise<RecommendationResult[]> {
  const [schemesResult, scholarshipsResult, jobsResult, examsResult] = await Promise.all([
    getAllSchemes(defaultQuery),
    getAllScholarships(defaultQuery),
    getAllJobs(defaultQuery),
    getAllExams(defaultQuery),
  ]);

  const scoredSchemes = schemesResult.items.map((item) => {
    const keywords = [item.title, item.description, item.category, item.provider];
    return mapScheme(item, scoreItem(60, profile, keywords));
  });

  const scoredScholarships = scholarshipsResult.items.map((item) => {
    const keywords = [item.title, item.description, item.category, item.provider];
    return mapScholarship(item, scoreItem(55, profile, keywords));
  });

  const scoredJobs = jobsResult.items.map((item) => {
    const keywords = [item.title, item.description, item.department, item.qualification];
    return mapJob(item, scoreItem(50, profile, keywords));
  });

  const scoredExams = examsResult.items.map((item) => {
    const keywords = [item.title, item.description, item.level, item.examBody];
    return mapExam(item, scoreItem(45, profile, keywords));
  });

  return [...scoredSchemes, ...scoredScholarships, ...scoredJobs, ...scoredExams].sort((left, right) => right.score - left.score);
}
