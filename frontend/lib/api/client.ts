/**
 * Centralized API client for BharatLens backend
 * - Automatically injects auth token from Supabase session
 * - Handles API response format: {success, message, data}
 * - Two modes: required (throws on 401) and optional (returns null on 401)
 * - Provides typed responses
 */

import { createClient } from "@/lib/supabase/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const AUTH_TOKEN_KEY = "bharatlens_auth_token";

/**
 * Get current auth token from Supabase session (primary)
 * Falls back to localStorage if session unavailable
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;

    if (token) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } catch {
        // ignore localStorage write failures
      }
      return token;
    }
  } catch {
    // Ignore errors from Supabase session read.
  }

  try {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }
  } catch {
    // ignore localStorage errors
  }

  return null;
}

/**
 * Verify session is still valid by calling /api/auth/me
 * Only logout if backend confirms invalid session
 */
async function verifySessionValid(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const token = await getAuthToken();
    if (!token) return false;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:5001/api";
    const response = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Handle logout - clears token and redirects to login
 * Only called after verifying session is actually invalid
 */
function handleSessionExpired(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore localStorage errors
  }

  try {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}`;
  } catch {
    window.location.href = "/login";
  }
}

interface ApiClientOptions extends RequestInit {
  optional?: boolean;
  rawResponse?: boolean;
}

export async function apiClient<T = unknown>(
  path: string,
  options?: ApiClientOptions,
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5001/api";
  const isOptional = options?.optional ?? false;
  const returnRaw = options?.rawResponse ?? false;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Remove control flags from fetch options
  const fetchOptions: RequestInit = { ...options };
  delete (fetchOptions as Record<string, unknown>).optional;
  delete (fetchOptions as Record<string, unknown>).rawResponse;

  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(`[API] Fetching ${fetchOptions.method ?? "GET"} ${baseUrl}${path}`, {
      optional: isOptional,
      rawResponse: returnRaw,
    });
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...fetchOptions,
      headers,
    });

    const rawBody = await response.text();
    let responseData: ApiResponse<T> = {
      success: response.ok,
      message: response.statusText || "Unknown API response",
    } as ApiResponse<T>;

    if (rawBody) {
      try {
        responseData = JSON.parse(rawBody) as ApiResponse<T>;
      } catch {
        responseData = {
          success: response.ok,
          message: response.statusText || "Unable to parse API response",
        } as ApiResponse<T>;
      }
    }

    if (process.env.NODE_ENV === "development") {
      const itemCount = Array.isArray(responseData.data)
        ? responseData.data.length
        : undefined;
      console.debug(`[API] Received ${path}`, {
        ok: response.ok,
        success: responseData.success,
        itemCount,
        pagination: responseData.pagination,
      });
    }

    // Handle 401 - Unauthorized
    if (response.status === 401) {
      if (isOptional) {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[API] Optional endpoint ${path} returned 401, returning empty fallback`);
        }
        return undefined as T;
      }

      const sessionValid = await verifySessionValid();
      if (!sessionValid) {
        handleSessionExpired();
      }

      throw new Error(
        responseData.message || "Session expired. Please login again.",
      );
    }

    if (!response.ok || responseData.success === false) {
      const errorMsg = responseData.message || `API request failed: ${response.status}`;
      if (process.env.NODE_ENV === "development") {
        console.error(`[API] ${path} failed:`, errorMsg, {
          status: response.status,
          success: responseData.success,
        });
      }
      throw new Error(errorMsg);
    }

    if (returnRaw) {
      return responseData as unknown as T;
    }

    return responseData.data as T;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[API] ${path} error:`, error instanceof Error ? error.message : error);
    }

    if (isOptional) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[API] Optional endpoint ${path} failed, returning undefined`, {
          error: error instanceof Error ? error.message : error,
        });
      }
      return undefined as T;
    }

    throw error;
  }
}
