import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase-config";
import { supabaseSecureStorage } from "@/lib/supabase-storage";
import type { Database } from "@/types/database";

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and add your credentials.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseSecureStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
