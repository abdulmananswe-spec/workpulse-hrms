import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;

/** Clears session locally first, then revokes globally with a short timeout. */
export async function performFastSignOut(supabase: AppSupabaseClient): Promise<void> {
  await supabase.auth.signOut({ scope: "local" });

  await Promise.race([
    supabase.auth.signOut({ scope: "global" }),
    new Promise<void>((resolve) => {
      setTimeout(resolve, 800);
    }),
  ]).catch(() => undefined);
}

export function redirectToLogin(options?: { signedOut?: boolean }) {
  const url = options?.signedOut ? "/login?signedOut=1" : "/login";
  window.location.replace(url);
}
