import { post, patch, get, ApiResponse } from "./client";
import { setAuthToken, setRefreshToken, setUserProfile } from "@/lib/auth/storage";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  age?: number | null;
  state?: string | null;
  district?: string | null;
  category?: string | null;
  dob?: string | null;
  education_level?: string | null;
  occupation?: string | null;
  user_type?: string | null;
  income_range?: string | null;
  annual_income?: number | null;
  gender?: string | null;
  preferred_language?: string;
  profile_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  age?: number;
  state?: string;
  district?: string;
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
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<User> {
  const response = await post<ApiResponse<{ user: User }>>("/api/auth/register", {
    full_name: data.full_name,
    email: data.email,
    password: data.password,
  });

  if (!response.success) {
    throw new Error(response.message || "Registration failed");
  }

  return login({ email: data.email, password: data.password });
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<User> {
  const response = await post<ApiResponse<LoginResponse>>("/api/auth/login", {
    email: data.email,
    password: data.password,
  });

  if (!response.success) {
    throw new Error(response.message || "Login failed");
  }

  const loginData = response.data as LoginResponse;
  setAuthToken(loginData.access_token);
  setRefreshToken(loginData.refresh_token);
  setUserProfile(loginData.user as unknown as Record<string, unknown>);

  return loginData.user;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await post<ApiResponse<null>>("/api/auth/logout");
  } catch (error) {
    // Ignore logout error and clear local auth state anyway.
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await get<ApiResponse<User>>("/api/auth/me");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch user");
  }

  return response.data as User;
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await patch<ApiResponse<User>>("/api/auth/profile", data);

  if (!response.success) {
    throw new Error(response.message || "Failed to update profile");
  }

  return response.data as User;
}
