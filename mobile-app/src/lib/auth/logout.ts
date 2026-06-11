import { supabase } from "@/lib/supabase";

export async function performFastSignOut(): Promise<void> {
  await supabase.auth.signOut({ scope: "local" });

  await Promise.race([
    supabase.auth.signOut({ scope: "global" }),
    new Promise<void>((resolve) => {
      setTimeout(resolve, 800);
    }),
  ]).catch(() => undefined);
}
