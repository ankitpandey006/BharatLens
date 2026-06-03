import { get, ApiResponse } from "./client";

export interface Scheme {
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

export interface SchemesResponse {
  data: Scheme[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch all schemes
 */
export async function getSchemes(query?: Record<string, any>): Promise<Scheme[]> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const path = `/api/schemes${queryString ? `?${queryString}` : ""}`;

  const response = await get<ApiResponse<Scheme[]>>(path);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch schemes");
  }

  return response.data || [];
}

/**
 * Fetch a single scheme by ID
 */
export async function getSchemeById(id: string): Promise<Scheme> {
  const response = await get<ApiResponse<Scheme>>(`/api/schemes/${id}`);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch scheme");
  }

  return response.data as Scheme;
}
