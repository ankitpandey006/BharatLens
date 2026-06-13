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
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { redirectToLoginAfterSignOut } from "@/lib/auth/urls";
import { clearAuthToken, saveAuthToken } from "@/lib/api/auth-api";

type AuthContextType = {
  authLoading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_LOADING_TIMEOUT_MS = 800;

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const mounted = useRef(true);
  const signingOutRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let loadingSettled = false;

    const finishLoading = () => {
      if (!mounted.current || loadingSettled) {
        return;
      }
      loadingSettled = true;
      setAuthLoading(false);
    };

    const timeoutId = window.setTimeout(finishLoading, AUTH_LOADING_TIMEOUT_MS);

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted.current || signingOutRef.current) {
        return;
      }

      setSession(initialSession);
      if (initialSession?.access_token) {
        saveAuthToken(initialSession.access_token);
      }
      if (initialSession) {
        finishLoading();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted.current || signingOutRef.current) {
        return;
      }

      // Ignore TOKEN_REFRESHED — it fires silently in the background
      // every ~hour when Supabase auto-refreshes the session.
      // The session reference changes but the user hasn't actually moved.
      // Updating state here causes a cascade of re-renders that flickers the UI.
      if (event === "TOKEN_REFRESHED") {
        // If newSession is null, the refresh genuinely failed — sign out.
        if (!newSession) {
          try {
            await supabase.auth.signOut();
          } catch {
            // Clearing local state is enough if sign-out fails.
          }
          clearAuthToken();
          setSession(null);
        }
        finishLoading();
        return;
      }

      if (event === "SIGNED_OUT") {
        clearAuthToken();
        setSession(null);
        finishLoading();
        return;
      }

      // For other events (SIGNED_IN, USER_UPDATED, etc.), check if the
      // user actually changed before updating state to avoid unnecessary renders.
      const existingUserId = session?.user?.id;
      const newUserId = newSession?.user?.id;
      if (newUserId && existingUserId === newUserId) {
        // Same user — just ensure the token is saved and finish loading.
        if (newSession?.access_token) {
          saveAuthToken(newSession.access_token);
        }
        finishLoading();
        return;
      }

      if (newSession?.access_token) {
        saveAuthToken(newSession.access_token);
      }
      setSession(newSession);
      finishLoading();
    });

    return () => {
      mounted.current = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (signingOutRef.current) {
      return;
    }

    signingOutRef.current = true;
    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      clearAuthToken();
      setSession(null);
      setAuthLoading(false);
      redirectToLoginAfterSignOut();
    }
  }, [supabase]);

  const value = useMemo(
    () => ({
      authLoading,
      isAuthenticated: Boolean(session?.user),
      isSigningOut,
      session,
      user: session?.user ?? null,
      signOut,
    }),
    [authLoading, isSigningOut, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
