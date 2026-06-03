"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getAuthToken, clearAuthToken, clearUserProfile, getUserProfile } from "@/lib/auth/storage";

type AuthContextType = {
  authLoading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  userProfile: Record<string, unknown> | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_LOADING_TIMEOUT_MS = 500;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Check if there's a valid auth token in localStorage
    const checkAuth = () => {
      if (!mounted.current) return;
      
      const token = getAuthToken();
      const profile = getUserProfile();
      setIsAuthenticated(!!token);
      setUserProfile(profile);
      setAuthLoading(false);
    };

    // Check immediately
    checkAuth();

    // Also check when storage changes (e.g., logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bharatlens_auth_token" || e.key === "bharatlens_user_profile") {
        checkAuth();
      }
    };

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      mounted.current = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!mounted.current) return;

    setIsSigningOut(true);
    try {
      // Clear auth tokens and profile
      clearAuthToken();
      clearUserProfile();
      setIsAuthenticated(false);
      setUserProfile(null);
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      authLoading,
      isAuthenticated,
      isSigningOut,
      userProfile,
      signOut,
    }),
    [authLoading, isAuthenticated, isSigningOut, userProfile, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
