import { get, ApiResponse } from "./client";

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  state?: string;
  category: string;
  provider: string;
  benefit: string;
  eligibility: string;
  deadline: string;
  official_url?: string;
  status: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all scholarships
 */
export async function getScholarships(query?: Record<string, any>): Promise<Scholarship[]> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const path = `/api/scholarships${queryString ? `?${queryString}` : ""}`;

  const response = await get<ApiResponse<Scholarship[]>>(path);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch scholarships");
  }

  return response.data || [];
}

/**
 * Fetch a single scholarship by ID
 */
export async function getScholarshipById(id: string): Promise<Scholarship> {
  const response = await get<ApiResponse<Scholarship>>(`/api/scholarships/${id}`);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch scholarship");
  }

  return response.data as Scholarship;
}
