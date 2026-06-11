import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase-config";

export type SupabaseConnectionStatus = {
  configured: boolean;
  connected: boolean;
  url: string | null;
  keyLoaded: boolean;
  error: string | null;
};

export async function verifySupabaseConnection(
  client: SupabaseClient,
): Promise<SupabaseConnectionStatus> {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return {
      configured: false,
      connected: false,
      url: url || null,
      keyLoaded: Boolean(anonKey),
      error: "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  try {
    const { error } = await client.auth.getSession();

    if (error) {
      return {
        configured: true,
        connected: false,
        url,
        keyLoaded: true,
        error: error.message,
      };
    }

    return {
      configured: true,
      connected: true,
      url,
      keyLoaded: true,
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      url,
      keyLoaded: true,
      error: error instanceof Error ? error.message : "Unknown connection error",
    };
  }
}
