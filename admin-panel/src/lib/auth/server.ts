import { redirect } from "next/navigation";

import { hasRequiredAdminRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getAuthenticatedAdminProfile(): Promise<{
  userId: string;
  profile: Profile;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !hasRequiredAdminRole(profile)) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return { userId: user.id, profile };
}
