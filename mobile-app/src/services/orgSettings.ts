import { supabase } from "@/lib/supabase";

export type OrgSettings = {
  duty_start_time: string;
  duty_end_time: string;
  late_grace_minutes: number;
};

const DEFAULT_SETTINGS: OrgSettings = {
  duty_start_time: "09:00:00",
  duty_end_time: "18:00:00",
  late_grace_minutes: 15,
};

export async function fetchOrgSettings(): Promise<OrgSettings> {
  const { data, error } = await supabase
    .from("org_settings")
    .select("duty_start_time, duty_end_time, late_grace_minutes")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    console.warn("[OrgSettings] Using defaults:", error.message);
    return DEFAULT_SETTINGS;
  }

  return data ?? DEFAULT_SETTINGS;
}

export function formatDutyTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function resolveCheckInStatus(
  checkInTime: Date,
  settings: OrgSettings,
): "present" | "late" {
  const [startHour, startMinute] = settings.duty_start_time.split(":").map(Number);
  const dutyStart = new Date(checkInTime);
  dutyStart.setHours(startHour, startMinute, 0, 0);

  const graceMs = settings.late_grace_minutes * 60 * 1000;
  return checkInTime.getTime() > dutyStart.getTime() + graceMs ? "late" : "present";
}
