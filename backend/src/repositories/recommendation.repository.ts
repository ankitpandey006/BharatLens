import { supabase } from "../config/supabase";
import { getAllExams, type ExamItem } from "./exam.repository";
import { getAllJobs, type JobItem } from "./job.repository";
import { getAllSchemes, type SchemeItem } from "./scheme.repository";
import { getAllScholarships, type ScholarshipItem } from "./scholarship.repository";
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
  annual_income?: number | null;
  dob?: string | null;
}

export interface RecommendationRow {
  id: string;
  user_id: string;
  item_id: string;
  item_type: RecommendationEntityType;
  reason: string;
  match_score: number;
  is_viewed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RecommendationResult {
  id: string;
  user_id: string;
  item_id: string;
  item_type: RecommendationEntityType;
  reason: string;
  score: number;
  is_viewed: boolean;
  created_at?: string;
  updated_at?: string;
  title?: string;
  description?: string;
}

export interface RecommendationRecord {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: RecommendationEntityType;
  reason: string;
  is_viewed: boolean;
  title?: string;
  description?: string;
  score: number;
}

export interface RecommendationListResult {
  items: RecommendationResult[];
  count: number;
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalize(value?: string | null): string {
  return (value ?? "").toString().trim().toLowerCase();
}

/**
 * Check if two field values match, with special handling for "All India" and "General"
 * Rules:
 * - Item "All India" matches any user state
 * - Item "General" or null category matches any user category
 * - Otherwise do case-insensitive exact match
 */
function matchesField(profileValue?: string | null, recordValue?: string | null, isState = false): boolean {
  if (!profileValue) {
    return false;
  }

  if (!recordValue) {
    // Item has no value
    if (!isState) {
      // For non-state fields, no value means no requirement = matches
      return true;
    }
    return false;
  }

  const normalized = normalize(recordValue);

  // "All India" state matches any user state
  if (isState && normalized === "all india") {
    return true;
  }

  // "General" or similar generic categories match any profile
  if (!isState && (normalized === "general" || normalized === "all")) {
    return true;
  }

  return normalize(profileValue) === normalized;
}

/**
 * Check education level compatibility
 * - "Bachelor Degree" matches "Graduate"
 * - "Master's Degree" matches "Postgraduate"
 * - Other exact matches (case-insensitive)
 */
function matchesEducation(userEducation?: string | null, itemEducation?: string | null): boolean {
  if (!userEducation || !itemEducation) {
    return false;
  }

  const userNorm = normalize(userEducation);
  const itemNorm = normalize(itemEducation);

  if (userNorm === itemNorm) {
    return true;
  }

  // Handle common mappings
  const mappings: Record<string, string[]> = {
    "bachelor degree": ["graduate", "bachelor", "graduation"],
    "master's degree": ["postgraduate", "master", "pg"],
    "master degree": ["postgraduate", "master", "pg"],
  };

  for (const [key, variants] of Object.entries(mappings)) {
    if (userNorm === key && variants.includes(itemNorm)) {
      return true;
    }
    if (itemNorm === key && variants.includes(userNorm)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if item deadline is active (null or >= today)
 */
function isDeadlineActive(deadline?: string | null): boolean {
  if (!deadline) {
    return true; // No deadline means always active
  }

  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate >= today;
  } catch {
    return true; // Invalid date format, assume active
  }
}

/**
 * Check if user annual income is eligible for item
 */
function isIncomeEligible(userIncome?: number | null, itemIncomeThreshold?: number | null): boolean {
  if (!itemIncomeThreshold) {
    return true; // No income requirement
  }

  if (!userIncome) {
    return false; // User has no income specified but item requires it
  }

  return userIncome <= itemIncomeThreshold;
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

/**
 * Calculate recommendation score based on user profile and item attributes
 * Scoring:
 * - State match: 20 points
 * - Category match: 20 points
 * - Education match: 15 points
 * - Income eligible: 20 points
 * - Gender match: 10 points
 * - Occupation match: 10 points
 * - Age eligible: 15 points
 * - Deadline active: 10 points
 * Maximum: 100 points
 * Minimum to recommend: 30 points
 */
function getMatchScore(profile: RecommendationProfile, rule: EligibilityRule | null, item: Record<string, unknown>): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // State matching (20 points)
  const itemState = (rule?.state ?? item.state) as string | null | undefined;
  if (matchesField(profile.state, itemState, true)) {
    score += 20;
    reasons.push("State matches.");
  }

  // Category matching (20 points)
  const itemCategory = (rule?.category ?? item.category) as string | null | undefined;
  if (matchesField(profile.category, itemCategory, false)) {
    score += 20;
    reasons.push("Category matches.");
  }

  // Education level matching (15 points)
  const itemEducation = (rule?.education_level ?? item.education_level ?? item.qualification) as string | null | undefined;
  if (matchesEducation(profile.education_level, itemEducation)) {
    score += 15;
    reasons.push("Education qualifies.");
  }

  // Income eligibility (20 points)
  const itemIncomeThreshold = (item.income_threshold ?? null) as number | null;
  if (isIncomeEligible(profile.annual_income, itemIncomeThreshold)) {
    score += 20;
    reasons.push("Income eligible.");
  }

  // Gender matching (10 points)
  const itemGender = (rule?.gender ?? item.gender) as string | null | undefined;
  if (matchesField(profile.gender, itemGender, false)) {
    score += 10;
    reasons.push("Gender matches.");
  }

  // Occupation matching (10 points)
  const itemOccupation = (rule?.occupation ?? item.occupation) as string | null | undefined;
  if (matchesField(profile.occupation, itemOccupation, false)) {
    score += 10;
    reasons.push("Occupation matches.");
  }

  // Age eligibility (15 points)
  const age = computeAge(profile.dob);
  const minAge = rule?.min_age;
  const maxAge = rule?.max_age;
  if (age !== null && typeof minAge === "number" && typeof maxAge === "number") {
    if (age >= minAge && age <= maxAge) {
      score += 15;
      reasons.push("Age qualified.");
    }
  }

  // Deadline active (10 points)
  const deadline = (item.deadline ?? item.application_end_date ?? item.result_date ?? null) as string | null;
  if (isDeadlineActive(deadline)) {
    score += 10;
    reasons.push("Application open.");
  }

  if (!reasons.length) {
    reasons.push("Basic match criteria met.");
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
    reason,
    is_viewed: false,
    title,
    description,
    score,
  };
}

async function fetchEligibilityRules(): Promise<EligibilityRule[]> {
  const { data, error } = await supabase.from("eligibility_rules").select("*");
  if (error) {
    console.warn("[Recommendations] Failed to fetch eligibility rules:", error.message);
    return [];
  }

  return (data ?? []) as EligibilityRule[];
}

async function deleteOldRecommendations(userId: string): Promise<void> {
  const { error } = await supabase.from("recommendations").delete().eq("user_id", userId);

  if (error) {
    console.warn("[Recommendations] Failed to delete old recommendations:", error.message);
    // Don't throw - continue with new inserts
  }
}

async function insertRecommendation(record: RecommendationRecord): Promise<RecommendationResult> {
  // Build insert record with actual schema fields only
  const insertData: Record<string, any> = {
    user_id: record.user_id,
    item_id: record.item_id,
    item_type: record.item_type,
    reason: record.reason,
    match_score: record.score ?? 0,
    is_viewed: record.is_viewed,
  };

  const { data, error } = await supabase
    .from("recommendations")
    .insert(insertData)
    .select("id, user_id, item_id, item_type, reason, match_score, is_viewed, created_at")
    .maybeSingle();

  if (error || !data) {
    throw new AppError(`Failed to save recommendation: ${error?.message ?? "Unknown error"}`, 500);
  }

  return {
    id: data.id,
    user_id: record.user_id,
    item_id: record.item_id,
    item_type: record.item_type,
    reason: record.reason,
    is_viewed: data.is_viewed ?? record.is_viewed,
    created_at: data.created_at,
    title: record.title,
    description: record.description,
    score: record.score,
  };
}


async function fetchContentLists() {
  const [schemes, scholarships, jobs, exams] = await Promise.all([
    getAllSchemes({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
    getAllScholarships({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
    getAllJobs({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
    getAllExams({ page: 1, limit: 1000, sortOrder: "desc", status: "active" }),
  ]);

  // Filter to include only approved/published items (exclude rejected or null verification_status)
  return {
    schemes: filterApprovedItems(schemes.items),
    scholarships: filterApprovedItems(scholarships.items),
    jobs: filterApprovedItems(jobs.items),
    exams: filterApprovedItems(exams.items),
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

async function fetchItemDataForRecommendation(row: RecommendationRow): Promise<RecommendationResult> {
  const base: RecommendationResult = {
    id: row.id,
    user_id: row.user_id,
    item_id: row.item_id,
    item_type: row.item_type,
    reason: row.reason,
    score: row.match_score,
    is_viewed: row.is_viewed,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  try {
    const tableName =
      row.item_type === "scheme" ? "schemes" :
      row.item_type === "scholarship" ? "scholarships" :
      row.item_type === "job" ? "jobs" :
      row.item_type === "exam" ? "exams" : null;

    if (!tableName || !row.item_id) return base;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", row.item_id)
      .maybeSingle();

    if (!error && data) {
      base.title = (data as any).title || (data as any).exam_name || "";
      base.description = (data as any).description || "";
      // Also attach full item_data for frontend consumption
      (base as any).item_data = data;
    }
  } catch (err) {
    console.warn(`[recommendations] Failed to fetch item_data for ${row.item_type}:${row.item_id}:`, err);
  }

  return base;
}

function mapRowToRecommendationResult(row: RecommendationRow): RecommendationResult {
  return {
    id: row.id,
    user_id: row.user_id,
    item_id: row.item_id,
    item_type: row.item_type,
    reason: row.reason,
    score: row.match_score,
    is_viewed: row.is_viewed,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ============================================================================
// VERIFICATION STATUS FILTERING
// ============================================================================

/**
 * Check if an item is approved for recommendations.
 * Only items with verification_status "approved" or "published" are included.
 * Items with null or "rejected" status are excluded.
 */
function isItemApproved(item: any): boolean {
  const status = item.verification_status;
  // Only "approved" and "published" are acceptable
  return status === "approved" || status === "published";
}

/**
 * Filter items to only include those that are verified/approved
 */
function filterApprovedItems<T>(items: T[]): T[] {
  return items.filter(isItemApproved);
}


// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================


export async function fetchRecommendations(userId: string, page: number, limit: number): Promise<RecommendationListResult> {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("recommendations")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("match_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch recommendations: ${error.message}`, 500);
  }

  const rows = (data ?? []) as RecommendationRow[];
  const items = await Promise.all(rows.map(fetchItemDataForRecommendation));

  return {
    items,
    count: count ?? 0,
  };
}

export async function fetchRecommendationsByItemType(
  userId: string,
  itemType: RecommendationEntityType,
  page: number,
  limit: number,
): Promise<RecommendationListResult> {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("recommendations")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .order("match_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch recommendations by type: ${error.message}`, 500);
  }

  const rows = (data ?? []) as RecommendationRow[];
  const items = await Promise.all(rows.map(fetchItemDataForRecommendation));

  return {
    items,
    count: count ?? 0,
  };
}

export async function generateRecommendationsForUser(userId: string, profile: RecommendationProfile): Promise<RecommendationResult[]> {
  console.log(`[Recommendations] Generating for user ${userId}`);
  console.log(`[Recommendations] Profile:`, {
    state: profile.state,
    category: profile.category,
    education_level: profile.education_level,
    annual_income: profile.annual_income,
  });

  // Delete old recommendations
  await deleteOldRecommendations(userId);

  const rules = await fetchEligibilityRules();
  const contentLists = await fetchContentLists();

  console.log(`[Recommendations] Fetched content:`, {
    schemes: contentLists.schemes.length,
    scholarships: contentLists.scholarships.length,
    jobs: contentLists.jobs.length,
    exams: contentLists.exams.length,
  });

  const candidates: RecommendationRecord[] = [];

  // Score all schemes
  for (const item of contentLists.schemes) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "scheme") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 30) {
      console.log(`[Recommendations] Scheme "${item.title}" scored ${score}: ${reason}`);
      candidates.push(mapItemToRecord(userId, "scheme", item, score, reason));
    }
  }

  // Score all scholarships
  for (const item of contentLists.scholarships) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "scholarship") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 30) {
      console.log(`[Recommendations] Scholarship "${item.title}" scored ${score}: ${reason}`);
      candidates.push(mapItemToRecord(userId, "scholarship", item, score, reason));
    }
  }

  // Score all jobs
  for (const item of contentLists.jobs) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "job") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 30) {
      console.log(`[Recommendations] Job "${item.title}" scored ${score}: ${reason}`);
      candidates.push(mapItemToRecord(userId, "job", item, score, reason));
    }
  }

  // Score all exams
  for (const item of contentLists.exams) {
    const rule = rules.find((ruleItem) => ruleItem.item_id === item.id && ruleItem.item_type === "exam") ?? null;
    const { score, reason } = getMatchScore(profile, rule, item as unknown as Record<string, unknown>);
    if (score >= 30) {
      console.log(`[Recommendations] Exam "${(item as any).exam_name ?? item.title}" scored ${score}: ${reason}`);
      candidates.push(mapItemToRecord(userId, "exam", item, score, reason));
    }
  }

  console.log(`[Recommendations] Generated ${candidates.length} candidate recommendations`);

  // Insert all candidates
  const saved = await Promise.all(candidates.map(async (candidate) => insertRecommendation(candidate)));
  const sorted = saved.sort((left, right) => (right.score ?? 0) - (left.score ?? 0));

  console.log(`[Recommendations] Inserted ${sorted.length} recommendations for user ${userId}`);

  return sorted;
}

export async function markRecommendationViewed(userId: string, id: string): Promise<RecommendationResult | null> {
  const { data, error } = await supabase
    .from("recommendations")
    .update({ is_viewed: true })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, user_id, item_id, item_type, reason, match_score, is_viewed, created_at, updated_at")
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to mark recommendation viewed: ${error.message}`, 500);
  }

  if (!data) {
    return null;
  }

  return mapRowToRecommendationResult(data as RecommendationRow);
}
