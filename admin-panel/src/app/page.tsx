import { redirect } from "next/navigation";

import { hasRequiredAdminRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!hasRequiredAdminRole(profile)) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  redirect("/dashboard");
}
