/**
 * Clear Supabase auth keys from browser storage after sign-out.
 * Helps avoid stale PKCE / session state causing bad_oauth_state.
 */
export function clearSupabaseAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const storages: Storage[] = [window.localStorage, window.sessionStorage];

  for (const storage of storages) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);

      if (!key) {
        continue;
      }

      if (key.startsWith("sb-") || key.includes("supabase.auth")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  }
}

// ============================================================================
// BACKEND AUTH TOKEN MANAGEMENT
// ============================================================================

export const AUTH_TOKEN_KEY = "bharatlens_auth_token";
const REFRESH_TOKEN_KEY = "bharatlens_refresh_token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Get the stored authentication token.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store authentication token in localStorage and cookie.
 * localStorage is used by frontend API client.
 * cookie is used by Next.js proxy for route protection.
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  setCookie(AUTH_TOKEN_KEY, token, COOKIE_MAX_AGE_SECONDS);
}

/**
 * Get the stored refresh token.
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store refresh token in localStorage.
 */
export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Clear auth tokens from localStorage and cookie.
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);

  deleteCookie(AUTH_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);

  clearSupabaseAuthStorage();
}

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

const USER_PROFILE_KEY = "bharatlens_user_profile";

/**
 * Store user profile data.
 */
export function setUserProfile(profile: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Get stored user profile data.
 */
export function getUserProfile(): Record<string, unknown> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(USER_PROFILE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Record<string, unknown>;
  } catch {
    clearUserProfile();
    return null;
  }
}

/**
 * Clear user profile data.
 */
export function clearUserProfile(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_PROFILE_KEY);
}

/**
 * Clear complete auth state.
 */
export function clearAuthState(): void {
  clearAuthToken();
  clearUserProfile();
}