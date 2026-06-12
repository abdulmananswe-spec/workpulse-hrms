import { createClient } from "@/lib/supabase/server";

export type OrgSettings = {
  id: string;
  singleton_key: string;
  duty_start_time: string;
  duty_end_time: string;
  late_grace_minutes: number;
  company_name: string;
  timezone: string;
  default_geofence_radius: number;
  email_notifications_enabled: boolean;
  updated_at: string;
};

export async function fetchOrgSettings(): Promise<OrgSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("org_settings")
    .select("*")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      id: "",
      singleton_key: "default",
      duty_start_time: "09:00:00",
      duty_end_time: "18:00:00",
      late_grace_minutes: 15,
      company_name: "WorkPulse HRMS",
      timezone: "Asia/Karachi",
      default_geofence_radius: 150,
      email_notifications_enabled: true,
      updated_at: new Date().toISOString(),
    };
  }

  return data as unknown as OrgSettings;
}
