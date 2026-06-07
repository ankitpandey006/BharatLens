/**
 * Backend auth API service
 * Handles email/password registration and login through backend
 */

import { apiClient } from "./client";

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: "user" | "admin" | "moderator";
  age?: number;
  state?: string;

  category?: string;
  dob?: string;
  education_level?: string;
  occupation?: string;
  user_type?: string;
  income_range?: string;
  annual_income?: number;
  gender?: string;
  preferred_language?: string;
  profile_completed?: boolean;
  profile_completion_percentage?: number;
  missing_profile_fields?: string[];
  created_at?: string;
  updated_at?: string;
}

const AUTH_TOKEN_KEY = "bharatlens_auth_token";

export async function registerWithBackend(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });

  if (response.access_token) {
    saveAuthToken(response.access_token);
  }

  return response;
}

export async function loginWithBackend(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.access_token) {
    saveAuthToken(response.access_token);
  }

  return response;
}

export async function logoutWithBackend(): Promise<void> {
  try {
    await apiClient("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // Continue with logout even if backend call fails
    console.error("Logout API error:", error);
  } finally {
    clearAuthToken();
  }
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiClient<UserProfile>("/auth/me", {
    method: "GET",
    cache: "no-store",
  });
}

export async function updateProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  return apiClient<UserProfile>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  return apiClient<UserProfile>(`/auth/${userId}`, {
    method: "GET",
  });
}

export function saveAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save auth token:", error);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear auth token:", error);
  }
}

export function isAuthTokenPresent(): boolean {
  return getAuthToken() !== null;
}
