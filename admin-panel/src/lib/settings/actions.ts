"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { getAuthenticatedAdminProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type CompanySettingsInput = {
  company_name: string;
  timezone: string;
  default_geofence_radius: number;
  email_notifications_enabled: boolean;
};

export async function updateCompanySettingsAction(input: CompanySettingsInput): Promise<void> {
  await requireAdminAction();
  const { profile } = await getAuthenticatedAdminProfile();
  const supabase = await createClient();

  const radius = Math.max(10, Math.min(5000, Math.round(input.default_geofence_radius)));

  const { error } = await supabase
    .from("org_settings")
    .update({
      company_name: input.company_name.trim() || "WorkPulse HRMS",
      timezone: input.timezone.trim() || "Asia/Karachi",
      default_geofence_radius: radius,
      email_notifications_enabled: input.email_notifications_enabled,
      updated_by: profile.id,
    })
    .eq("singleton_key", "default");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/settings");
}
