"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  hasRequiredAdminRole,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/auth/roles";
import { performFastSignOut } from "@/lib/auth/logout";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[Auth] Failed to load profile:", error.message);
    return null;
  }

  return data;
}

async function enforceAdminAccess(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Profile | null> {
  const profile = await fetchProfile(supabase, userId);

  if (!hasRequiredAdminRole(profile)) {
    await supabase.auth.signOut();
    return null;
  }

  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const nextProfile = await enforceAdminAccess(supabase, user.id);
    setProfile(nextProfile);

    if (!nextProfile) {
      setSession(null);
      setUser(null);
      setAuthError(UNAUTHORIZED_MESSAGE);
    }
  }, [supabase, user]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.warn("[Auth] Failed to restore session:", error.message);
      }

      const nextSession = data.session ?? null;
      const nextUser = nextSession?.user ?? null;

      if (nextUser) {
        const nextProfile = await enforceAdminAccess(supabase, nextUser.id);

        if (!isMounted) {
          return;
        }

        if (!nextProfile) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthError(UNAUTHORIZED_MESSAGE);
        } else {
          setSession(nextSession);
          setUser(nextUser);
          setProfile(nextProfile);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        if (!isMounted) {
          return;
        }
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN") {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        if (!isMounted) {
          return;
        }
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const nextUser = nextSession?.user ?? null;

      if (nextUser) {
        const nextProfile = await enforceAdminAccess(supabase, nextUser.id);

        if (!isMounted) {
          return;
        }

        if (!nextProfile) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthError(UNAUTHORIZED_MESSAGE);
        } else {
          setSession(nextSession);
          setUser(nextUser);
          setProfile(nextProfile);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      const nextProfile = await enforceAdminAccess(supabase, data.user.id);

      if (!nextProfile) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setAuthError(UNAUTHORIZED_MESSAGE);
        throw new Error(UNAUTHORIZED_MESSAGE);
      }

      setSession(data.session);
      setUser(data.user);
      setProfile(nextProfile);
    },
    [supabase],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      setAuthError(null);

      const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        throw error;
      }
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    await performFastSignOut(supabase);
    setSession(null);
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(session?.user && profile),
      authError,
      clearAuthError,
      signIn,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      isLoading,
      authError,
      clearAuthError,
      signIn,
      resetPassword,
      signOut,
      refreshProfile,
    ],
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
