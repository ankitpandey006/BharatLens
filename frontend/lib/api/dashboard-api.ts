/**
 * Dashboard API - fetches aggregated dashboard summary from backend
 */

import { apiClient } from "./client";

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
  recommendations: Array<{
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
  }>;
  notificationsList: Array<{
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at?: string;
  }>;
  todayUpdates: Array<{
    id: string;
    title: string;
    type: string;
    description: string;
    itemType?: string;
    itemId?: string;
  }>;
  savedItems: Array<{
    id: string;
    itemId: string;
    itemType: string;
    title: string;
    deadline?: string;
    officialUrl?: string;
    savedAt?: string;
  }>;
}

/**
 * Fetch aggregated dashboard summary data
 * Returns the full dashboard state including counts, profile, recommendations, notifications, and updates
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiClient<DashboardSummary>("/dashboard/summary");
}
