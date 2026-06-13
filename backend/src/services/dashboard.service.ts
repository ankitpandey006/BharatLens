/**
 * Dashboard Service
 * Aggregates summary data from all content types for the user dashboard
 *
 * GET /api/dashboard/summary returns:
 * - counts, profile, recommendations (enriched), recentUpdates (with content_updates),
 *   notifications, savedItems
 */

import { supabase } from "../config/supabase";
import { findUserById } from "../repositories/auth.repository";
import { generateRecommendationsForUser } from "../repositories/recommendation.repository";
import type { RecommendationProfile } from "../repositories/recommendation.repository";

export interface DashboardSummary {
  counts: {
    schemes: number;
    scholarships: number;
    jobs: number;
    exams: number;
    savedItems: number;
    notifications: number;
  };
  profile: {
    completed: boolean;
    completionPercent: number;
    missingFields: string[];
  };
  recommendations: DashboardRecommendation[];
  notificationsList: DashboardNotification[];
  todayUpdates: DashboardUpdate[];
  savedItems: DashboardSavedItem[];
}

export interface DashboardRecommendation {
  id: string;
  title: string;
  itemId: string;
  itemType: string;
  match: string;
  matchScore: number;
  tag: string;
  deadline?: string;
  state?: string;
  description?: string;
  reason: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

export interface DashboardUpdate {
  id: string;
  title: string;
  type: string;
  description: string;
  itemType?: string;
  itemId?: string;
}

export interface DashboardSavedItem {
  id: string;
  itemId: string;
  itemType: string;
  title: string;
  deadline?: string;
  officialUrl?: string;
  savedAt?: string;
}

/**
 * Fetch aggregated dashboard summary for a user
 */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [
    contentCounts,
    savedCount,
    notificationCount,
    profileResult,
    recommendationsResult,
    recentNotifications,
    recentUpdates,
    recentSavedItems,
  ] = await Promise.allSettled([
    getContentCounts(),
    getSavedItemCount(userId),
    getNotificationCount(userId),
    getProfile(userId),
    getEnrichedRecommendations(userId, 5),
    getRecentNotifications(userId, 3),
    getRecentUpdatesWithContentUpdates(),
    getRecentSavedItems(userId, 3),
  ]);

  const counts = {
    schemes: extractCount(contentCounts, "schemes"),
    scholarships: extractCount(contentCounts, "scholarships"),
    jobs: extractCount(contentCounts, "jobs"),
    exams: extractCount(contentCounts, "exams"),
    savedItems: extractCount(savedCount, "default"),
    notifications: extractCount(notificationCount, "default"),
  };

  const profile = extractProfile(profileResult);
  let recommendations = extractRecommendations(recommendationsResult);
  const notificationsList = extractNotifications(recentNotifications);
  const todayUpdates = extractUpdates(recentUpdates);
  const savedItems = extractSavedItems(recentSavedItems);

  // Auto-generate recommendations if empty and profile has enough data
  if (recommendations.length === 0) {
    recommendations = await autoGenerateRecommendations(userId, profileResult);
  }

  return {
    counts,
    profile,
    recommendations,
    notificationsList,
    todayUpdates,
    savedItems,
  };
}

/**
 * Auto-generate rule-based recommendations for the user when none exist
 */
async function autoGenerateRecommendations(
  userId: string,
  profileResult: PromiseSettledResult<unknown>
): Promise<DashboardRecommendation[]> {
  if (profileResult.status === "rejected" || !profileResult.value) {
    return [];
  }

  const profile = profileResult.value as Record<string, unknown>;

  // Only auto-generate if at least 1 key profile field is filled
  const profileFields = {
    state: profile.state as string | null | undefined,
    category: profile.category as string | null | undefined,
    gender: profile.gender as string | null | undefined,
    education_level: profile.education_level as string | null | undefined,
    occupation: profile.occupation as string | null | undefined,
    user_type: profile.user_type as string | null | undefined,
    income_range: profile.income_range as string | null | undefined,
    annual_income: profile.annual_income ? Number(profile.annual_income) : null,
    dob: profile.dob as string | null | undefined,
  };

  const hasProfileData = Object.values(profileFields).some(
    (v) => v !== null && v !== undefined && v !== ""
  );

  if (!hasProfileData) {
    console.log("[Dashboard] Profile has insufficient data for auto-generating recommendations");
    return [];
  }

  console.log("[Dashboard] Auto-generating recommendations for user", userId);

  try {
    const generated = await generateRecommendationsForUser(userId, profileFields as RecommendationProfile);
    if (generated.length > 0) {
      console.log(`[Dashboard] Auto-generated ${generated.length} recommendations`);
      // Now fetch the freshly generated ones as enriched recommendations
      return getEnrichedRecommendations(userId, 5);
    }
  } catch (err) {
    console.warn("[Dashboard] Failed to auto-generate recommendations:", err);
  }

  return [];
}

// ─── Count helpers ─────────────────────────────────────────────

async function getContentCounts(): Promise<Record<string, number>> {
  const [schemes, scholarships, jobs, exams] = await Promise.all([
    countTable("schemes"),
    countTable("scholarships"),
    countTable("jobs"),
    countTable("exams"),
  ]);
  return { schemes, scholarships, jobs, exams };
}

async function countTable(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("verification_status", "published");

  if (error) {
    console.warn(`[Dashboard] Failed to count ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function getSavedItemCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("saved_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.warn("[Dashboard] Failed to count saved items:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function getNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.warn("[Dashboard] Failed to count notifications:", error.message);
    return 0;
  }
  return count ?? 0;
}

// ─── Profile ────────────────────────────────────────────────────

async function getProfile(userId: string) {
  return findUserById(userId);
}

// ─── Enriched Recommendations ───────────────────────────────────

async function getEnrichedRecommendations(userId: string, limit: number): Promise<DashboardRecommendation[]> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", userId)
    .order("match_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[Dashboard] Failed to fetch recommendations:", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) return [];

  // Enrich each recommendation with real item data from the appropriate table
  const enriched = await Promise.all(
    rows.map(async (rec) => {
      const itemType = String(rec.item_type ?? "");
      const itemId = String(rec.item_id ?? "");
      const matchScore = Number(rec.match_score ?? 0);
      const reason = String(rec.reason ?? "");

      // Fetch actual item data
      let title = "";
      let deadline: string | undefined;
      let state: string | undefined;
      let description: string | undefined;

      if (itemType && itemId) {
        const tableName =
          itemType === "scheme" ? "schemes" :
          itemType === "scholarship" ? "scholarships" :
          itemType === "job" ? "jobs" :
          itemType === "exam" ? "exams" : null;

        if (tableName) {
          const titleField = tableName === "exams" ? "exam_name,title" : "title";
          const { data: itemData } = await supabase
            .from(tableName)
            .select(`${titleField}, deadline, state, description`)
            .eq("id", itemId)
            .maybeSingle();

          if (itemData) {
            const d = itemData as unknown as Record<string, unknown>;
            title = String(d.title ?? d.exam_name ?? "");
            deadline = d.deadline ? String(d.deadline) : undefined;
            state = d.state ? String(d.state) : undefined;
            description = d.description ? String(d.description).slice(0, 150) : undefined;
          }
        }
      }

      return {
        id: String(rec.id ?? ""),
        title: title || reason || "Recommendation",
        itemId,
        itemType,
        match: `${Math.round(matchScore)}%`,
        matchScore,
        tag: itemType.charAt(0).toUpperCase() + itemType.slice(1),
        deadline,
        state,
        description,
        reason,
      };
    }),
  );

  return enriched;
}

// ─── Notifications ──────────────────────────────────────────────

async function getRecentNotifications(userId: string, limit: number) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[Dashboard] Failed to fetch notifications:", error.message);
    return [];
  }

  return (data ?? []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    message: String(item.message ?? ""),
    is_read: Boolean(item.is_read ?? false),
    created_at: item.created_at ? String(item.created_at) : undefined,
  }));
}

// ─── Recent Updates (with content_updates) ──────────────────────

async function getRecentUpdatesWithContentUpdates(): Promise<DashboardUpdate[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sinceDate = sevenDaysAgo.toISOString();

  const updates: DashboardUpdate[] = [];
  const seenTitles = new Set<string>();

  // Fetch recent items from each content table
  const [recentSchemes, recentScholarships, recentJobs, recentExams] = await Promise.all([
    fetchRecentItems("schemes", sinceDate, 3),
    fetchRecentItems("scholarships", sinceDate, 3),
    fetchRecentItems("jobs", sinceDate, 3),
    fetchRecentItems("exams", sinceDate, 3),
  ]);

  // Also fetch recent content_updates
  let contentUpdates: Array<Record<string, unknown>> = [];
  try {
    const { data } = await supabase
      .from("content_updates")
      .select("*")
      .gte("created_at", sinceDate)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) contentUpdates = data;
  } catch (err) {
    console.warn("[Dashboard] Failed to fetch content_updates:", err);
  }

  // Add content table items
  for (const item of recentSchemes) {
    const key = item.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      updates.push({ id: item.id, title: item.title, type: "Scheme", description: "New scheme added", itemType: "scheme", itemId: item.id });
    }
  }
  for (const item of recentScholarships) {
    const key = item.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      updates.push({ id: item.id, title: item.title, type: "Scholarship", description: "New scholarship added", itemType: "scholarship", itemId: item.id });
    }
  }
  for (const item of recentJobs) {
    const key = item.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      updates.push({ id: item.id, title: item.title, type: "Job", description: "New job opportunity added", itemType: "job", itemId: item.id });
    }
  }
  for (const item of recentExams) {
    const key = item.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      updates.push({ id: item.id, title: item.title, type: "Exam", description: "New exam notification added", itemType: "exam", itemId: item.id });
    }
  }

  // Add content_updates with proper badges
  for (const cu of contentUpdates) {
    const cuTitle = String(cu.title ?? "");
    const cuTypeRaw = String(cu.update_type ?? cu.item_type ?? "");
    const cuType =
      cuTypeRaw === "apply" ? "Apply Now" :
      cuTypeRaw === "admit_card" ? "Admit Card" :
      cuTypeRaw === "result" ? "Result" :
      cuTypeRaw === "answer_key" ? "Answer Key" :
      cuTypeRaw === "notification" ? "Notification" :
      cuTypeRaw.charAt(0).toUpperCase() + cuTypeRaw.slice(1);

    const key = cuTitle.toLowerCase().trim();
    if (cuTitle && !seenTitles.has(key)) {
      seenTitles.add(key);
      // Content updates reference an item via item_id and item_type
      const contentItemType = String(cu.item_type ?? "");
      const contentItemId = String(cu.item_id ?? "");
      updates.push({
        id: String(cu.id ?? ""),
        title: cuTitle,
        type: cuType,
        description: `New ${cuType} update published`,
        itemType: contentItemType || undefined,
        itemId: contentItemId || undefined,
      });
    }
  }

  // Sort by recency (approximate — content table items first, then updates)
  // Limit to top 6 total
  return updates.slice(0, 6);
}

async function fetchRecentItems(table: string, sinceDate: string, limit: number) {
  const titleField = table === "exams" ? "exam_name, title" : "title, id";
  const { data, error } = await supabase
    .from(table)
    .select(`${titleField}, created_at`)
    .gte("created_at", sinceDate)
    .eq("status", "active")
    .eq("verification_status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[Dashboard] Failed to fetch recent ${table}:`, error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ""),
    title: String(row.title ?? row.exam_name ?? ""),
    created_at: String(row.created_at ?? ""),
  }));
}

// ─── Saved Items ────────────────────────────────────────────────

async function getRecentSavedItems(userId: string, limit: number): Promise<DashboardSavedItem[]> {
  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[Dashboard] Failed to fetch saved items:", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) return [];

  // Enrich with item data
  const enriched = await Promise.all(
    rows.map(async (saved) => {
      const itemType = String(saved.item_type ?? "");
      const itemId = String(saved.item_id ?? "");
      let title = "";
      let deadline: string | undefined;
      let officialUrl: string | undefined;

      const tableName =
        itemType === "scheme" ? "schemes" :
        itemType === "scholarship" ? "scholarships" :
        itemType === "job" ? "jobs" :
        itemType === "exam" ? "exams" : null;

      if (tableName && itemId) {
        const titleField = tableName === "exams" ? "exam_name, title" : "title";
        const { data: itemData } = await supabase
          .from(tableName)
          .select(`${titleField}, deadline, official_url, apply_url`)
          .eq("id", itemId)
          .maybeSingle();

        if (itemData) {
          const d = itemData as unknown as Record<string, unknown>;
          title = String(d.title ?? d.exam_name ?? "");
          deadline = d.deadline ? String(d.deadline) : undefined;
          officialUrl = String(d.official_url ?? d.apply_url ?? "");
        }
      }

      return {
        id: String(saved.id ?? ""),
        itemId,
        itemType,
        title: title || "Untitled",
        deadline,
        officialUrl,
        savedAt: saved.saved_at ? String(saved.saved_at) : undefined,
      };
    }),
  );

  return enriched;
}

// ─── Extraction helpers ─────────────────────────────────────────

function extractCount(result: PromiseSettledResult<unknown>, key: string): number {
  if (result.status === "rejected") return 0;
  const value = result.value as Record<string, number>;
  return typeof value === "number" ? value : (value?.[key] ?? 0);
}

function extractProfile(result: PromiseSettledResult<unknown>): DashboardSummary["profile"] {
  if (result.status === "rejected" || !result.value) {
    return { completed: false, completionPercent: 0, missingFields: [] };
  }

  const profile = result.value as {
    profile_completed?: boolean;
    profile_completion_percentage?: number;
    missing_profile_fields?: string[];
  };

  return {
    completed: profile.profile_completed ?? false,
    completionPercent: profile.profile_completion_percentage ?? 0,
    missingFields: profile.missing_profile_fields ?? [],
  };
}

function extractRecommendations(result: PromiseSettledResult<unknown>): DashboardRecommendation[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardRecommendation[];
  return items ?? [];
}

function extractNotifications(result: PromiseSettledResult<unknown>): DashboardNotification[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardNotification[];
  return items ?? [];
}

function extractUpdates(result: PromiseSettledResult<unknown>): DashboardUpdate[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardUpdate[];
  return items ?? [];
}

function extractSavedItems(result: PromiseSettledResult<unknown>): DashboardSavedItem[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardSavedItem[];
  return items ?? [];
}
