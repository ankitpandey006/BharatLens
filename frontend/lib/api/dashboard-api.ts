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
    match: string;
    tag: string;
  }>;
  notificationsList: Array<{
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at?: string;
  }>;
  todayUpdates: Array<{
    title: string;
    type: string;
    description: string;
  }>;
}

/**
 * Fetch aggregated dashboard summary data
 * Returns the full dashboard state including counts, profile, recommendations, notifications, and updates
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiClient<DashboardSummary>("/dashboard/summary");
}
