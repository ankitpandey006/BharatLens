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

type AuthContextType = {
  authLoading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const loadSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted.current) {
          return;
        }

        if (error) {
          console.error("Auth session restore failed:", error.message);

          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error("Failed to clear broken auth state:", signOutError);
          }

          setSession(null);
          return;
        }

        setSession(initialSession);
      } catch (error) {
        console.error("Auth session restore failed:", error);
        setSession(null);
      } finally {
        if (mounted.current) {
          setAuthLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted.current) {
        return;
      }

      setSession(newSession);
      setAuthLoading(false);
    });

    void loadSession();

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSession(null);
    setAuthLoading(false);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Failed to sign out:", error.message);
      }
    } finally {
      if (mounted.current) {
        setIsSigningOut(false);
      }
    }
  }, [isSigningOut, supabase]);

  const value = useMemo(
    () => ({
      authLoading,
      isAuthenticated: Boolean(session?.user),
      isSigningOut,
      session,
      user: session?.user ?? null,
      signOut,
    }),
    [authLoading, isSigningOut, session, signOut]
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
