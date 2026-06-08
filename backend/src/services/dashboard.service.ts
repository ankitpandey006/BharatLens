/**
 * Dashboard Service
 * Aggregates summary data from all content types for the user dashboard
 */

import { supabase } from "../config/supabase";
import { findUserById } from "../repositories/auth.repository";
import { AppError } from "../utils/app-error";

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
}

export interface DashboardRecommendation {
  id: string;
  title: string;
  match: string;
  tag: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

export interface DashboardUpdate {
  title: string;
  type: string;
  description: string;
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
  ] = await Promise.allSettled([
    getContentCounts(),
    getSavedItemCount(userId),
    getNotificationCount(userId),
    getProfile(userId),
    getTopRecommendations(userId, 3),
    getRecentNotifications(userId, 3),
    getTodayUpdates(),
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
  const recommendations = extractRecommendations(recommendationsResult);
  const notificationsList = extractNotifications(recentNotifications);
  const todayUpdates = extractUpdates(recentUpdates);

  return {
    counts,
    profile,
    recommendations,
    notificationsList,
    todayUpdates,
  };
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

// ─── Recommendations ─────────────────────────────────────────────

async function getTopRecommendations(userId: string, limit: number) {
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

  return (data ?? []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ""),
    title: String(item.reason ?? "Recommendation"),
    match: `${Math.round(Number(item.match_score ?? 0))}%`,
    tag: String(item.item_type ?? "").charAt(0).toUpperCase() + String(item.item_type ?? "").slice(1),
  }));
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

// ─── Today's Updates ─────────────────────────────────────────────

async function getTodayUpdates(): Promise<DashboardUpdate[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sinceDate = sevenDaysAgo.toISOString();

  const updates: DashboardUpdate[] = [];

  const [recentSchemes, recentScholarships, recentJobs, recentExams] = await Promise.all([
    fetchRecentItems("schemes", sinceDate, 2),
    fetchRecentItems("scholarships", sinceDate, 2),
    fetchRecentItems("jobs", sinceDate, 2),
    fetchRecentItems("exams", sinceDate, 2),
  ]);

  recentSchemes.forEach((item) =>
    updates.push({ title: item.title, type: "Scheme", description: "New scheme added" }),
  );
  recentScholarships.forEach((item) =>
    updates.push({ title: item.title, type: "Scholarship", description: "New scholarship added" }),
  );
  recentJobs.forEach((item) =>
    updates.push({ title: item.title, type: "Job", description: "New job opportunity added" }),
  );
  recentExams.forEach((item) =>
    updates.push({ title: item.title, type: "Exam", description: "New exam notification added" }),
  );

  // Sort by recency (they're already in order from the query)
  // Limit to top 5 total
  return updates.slice(0, 5);
}

async function fetchRecentItems(table: string, sinceDate: string, limit: number) {
  const { data, error } = await supabase
    .from(table)
    .select("title, created_at")
    .gte("created_at", sinceDate)
    .eq("status", "active")
    .eq("verification_status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[Dashboard] Failed to fetch recent ${table}:`, error.message);
    return [];
  }

  return (data ?? []) as { title: string; created_at?: string }[];
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

function extractRecommendations(
  result: PromiseSettledResult<unknown>,
): DashboardRecommendation[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardRecommendation[];
  return items ?? [];
}

function extractNotifications(
  result: PromiseSettledResult<unknown>,
): DashboardNotification[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardNotification[];
  return items ?? [];
}

function extractUpdates(result: PromiseSettledResult<unknown>): DashboardUpdate[] {
  if (result.status === "rejected") return [];
  const items = result.value as DashboardUpdate[];
  return items ?? [];
}
