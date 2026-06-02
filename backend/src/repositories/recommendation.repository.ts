import { supabase } from "../config/supabase";
import { getAllExams, getExamById, type ExamItem } from "./exam.repository";
import { getAllJobs, getJobById, type JobItem } from "./job.repository";
import { getAllSchemes, getSchemeById, type SchemeItem } from "./scheme.repository";
import { getAllScholarships, getScholarshipById, type ScholarshipItem } from "./scholarship.repository";
import { AppError } from "../utils/app-error";

export type RecommendationEntityType = "scheme" | "scholarship" | "job" | "exam";

export interface RecommendationProfile {
  state?: string | null;
  category?: string | null;
  gender?: string | null;
  education_level?: string | null;
  occupation?: string | null;
  user_type?: string | null;
  income_range?: string | null;
  dob?: string | null;
}

export interface RecommendationResult {
  id: string;
  user_id: string;
  item_id: string;
  item_type: RecommendationEntityType;
  title: string;
  description?: string;
  score: number;
  reason: string;
  viewed: boolean;
  created_at?: string;
}

export interface RecommendationRecord {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: RecommendationEntityType;
  title: string;
  description?: string;
  score: number;
  reason: string;
  viewed: boolean;
}

export interface RecommendationListResult {
  items: RecommendationResult[];
  count: number;
}

export interface RecommendationRepository {
  fetchRecommendations(userId: string, page: number, limit: number): Promise<RecommendationListResult>;
  generateRecommendationsForUser(userId: string, profile: RecommendationProfile): Promise<RecommendationResult[]>;
  markRecommendationViewed(userId: string, id: string): Promise<RecommendationResult | null>;
}

interface EligibilityRule {
  item_id: string;
  item_type: RecommendationEntityType;
  state?: string | null;
  category?: string | null;
  gender?: string | null;
  education_level?: string | null;
  occupation?: string | null;
  user_type?: string | null;
  income_range?: string | null;
  min_age?: number | null;
  max_age?: number | null;
}

function normalize(value?: string | null): string {
  return (value ?? "").toString().trim().toLowerCase();
}

function matchesField(profileValue?: string | null, recordValue?: string | null): boolean {
  if (!profileValue || !recordValue) {
    return false;
  }
  return normalize(profileValue) === normalize(recordValue);
}

function computeAge(dob?: string | null): number | null {
  if (!dob) {
    return null;
  }

  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const ageDiff = Date.now() - date.getTime();
  return Math.floor(ageDiff / 1000 / 60 / 60 / 24 / 365.25);
}

function getMatchScore(profile: RecommendationProfile, rule: EligibilityRule | null, item: Record<string, unknown>): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  const stateMatched = matchesField(profile.state, rule?.state ?? item.state as string | null);
  if (stateMatched) {
    score += 20;
    reasons.push("State matches eligibility.");
  }

  const categoryMatched = matchesField(profile.category, rule?.category ?? item.category as string | null);
  if (categoryMatched) {
    score += 15;
    reasons.push("Category matches eligibility.");
  }

  const genderMatched = matchesField(profile.gender, rule?.gender ?? item.gender as string | null);
  if (genderMatched) {
    score += 10;
    reasons.push("Gender requirement matches.");
  }

  const educationMatched = matchesField(profile.education_level, rule?.education_level ?? item.education_level as string | null);
  if (educationMatched) {
    score += 15;
    reasons.push("Education level matches eligibility.");
  }

  const occupationMatched = matchesField(profile.occupation, rule?.occupation ?? item.occupation as string | null);
  if (occupationMatched) {
    score += 10;
    reasons.push("Occupation matches eligibility.");
  }

  const userTypeMatched = matchesField(profile.user_type, rule?.user_type ?? item.user_type as string | null);
  if (userTypeMatched) {
    score += 10;
    reasons.push("User type matches eligibility.");
  }

  const incomeMatched = matchesField(profile.income_range, rule?.income_range ?? item.income_range as string | null);
  if (incomeMatched) {
    score += 10;
    reasons.push("Income range matches eligibility.");
  }

  const age = computeAge(profile.dob);
  const minAge = rule?.min_age;
  const maxAge = rule?.max_age;
  if (age !== null && typeof minAge === "number" && typeof maxAge === "number") {
    if (age >= minAge && age <= maxAge) {
      score += 10;
      reasons.push("Age falls within the required range.");
    }
  }

  if (!reasons.length) {
    reasons.push("Minimum match criteria not met for this item.");
  }

  return {
    score: Math.min(score, 100),
    reason: reasons.join(" "),
  };
}

function mapToRecommendation(
  userId: string,
  itemType: RecommendationEntityType,
  itemId: string,
  title: string,
  description: string,
  score: number,
  reason: string,
): RecommendationRecord {
  return {
    user_id: userId,
    item_id: itemId,
    item_type: itemType,
    title,
    description,
    score,
    reason,
    viewed: false,
  };
}

async function fetchEligibilityRules(): Promise<EligibilityRule[]> {
  const { data, error } = await supabase.from("eligibility_rules").select("*");
  if (error) {
    return [];
  }

  return (data ?? []) as EligibilityRule[];
}

async function upsertRecommendation(record: RecommendationRecord): Promise<RecommendationResult> {
  const { data, error } = await supabase
    .from("recommendations")
    .upsert(record, { onConflict: "user_id" })
    .select()
    .maybeSingle();

  if (error || !data) {
    throw new AppError(`Failed to save recommendation: ${error?.message ?? "Unknown error"}`, 500);
  }

  return {
    ...(data as RecommendationRecord),
    id: (data as any).id,
    user_id: record.user_id,
    item_id: record.item_id,
    item_type: record.item_type,
    title: record.title,
    description: record.description,
    score: record.score,
    reason: record.reason,
    viewed: (data as any).viewed ?? record.viewed,
    created_at: (data as any).created_at,
  };
}

async function fetchContentLists() {
  const [schemes, scholarships, jobs, exams] = await Promise.all([
    getAllSchemes({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
    getAllScholarships({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
    getAllJobs({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
    getAllExams({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
  ]);

  return {
    schemes: schemes.items,
    scholarships: scholarships.items,
    jobs: jobs.items,
    exams: exams.items,
  };
}

function mapItemToRecord(
  userId: string,
  itemType: RecommendationEntityType,
  item: SchemeItem | ScholarshipItem | JobItem | ExamItem,
  score: number,
  reason: string,
): RecommendationRecord {
  return mapToRecommendation(
    userId,
    itemType,
    item.id,
    item.title,
    (item as any).description ?? "",
    score,
    reason,
  );
}

export async function fetchRecommendations(userId: string, page: number, limit: number): Promise<RecommendationListResult> {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("recommendations")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch recommendations: ${error.message}`, 500);
  }

  return {
    items: (data ?? []) as RecommendationResult[],
    count: count ?? 0,
  };
}

export async function generateRecommendationsForUser(userId: string, profile: RecommendationProfile): Promise<RecommendationResult[]> {
  const rules = await fetchEligibilityRules();
  const contentLists = await fetchContentLists();

  const candidates: RecommendationRecord[] = [];

  for (const item of contentLists.schemes) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "scheme") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 40) {
      candidates.push(mapItemToRecord(userId, "scheme", item, score, reason));
    }
  }

  for (const item of contentLists.scholarships) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "scholarship") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 40) {
      candidates.push(mapItemToRecord(userId, "scholarship", item, score, reason));
    }
  }

  for (const item of contentLists.jobs) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "job") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 40) {
      candidates.push(mapItemToRecord(userId, "job", item, score, reason));
    }
  }

  for (const item of contentLists.exams) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "exam") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 40) {
      candidates.push(mapItemToRecord(userId, "exam", item, score, reason));
    }
  }

  const saved = await Promise.all(candidates.map(async (candidate) => upsertRecommendation(candidate)));
  return saved.sort((left, right) => right.score - left.score);
}

export async function markRecommendationViewed(userId: string, id: string): Promise<RecommendationResult | null> {
  const { data, error } = await supabase
    .from("recommendations")
    .update({ viewed: true })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to mark recommendation viewed: ${error.message}`, 500);
  }

  return data as RecommendationResult | null;
}
