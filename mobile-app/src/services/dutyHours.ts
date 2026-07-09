import { supabase } from "@/lib/supabase";
import {
  DEFAULT_DUTY_HOURS,
  type DutyHours,
  formatDutyTime,
  resolveCheckInStatus,
  validateCheckInWindow,
} from "@shared/duty-hours";

export type { DutyHours };
export { DEFAULT_DUTY_HOURS, formatDutyTime, resolveCheckInStatus, validateCheckInWindow };

export async function fetchEmployeeDutyHours(
  employeeId: string,
): Promise<DutyHours> {
  const { data, error } = await supabase
    .from("profiles")
    .select("duty_start_time, duty_end_time, late_grace_minutes")
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    console.warn("[DutyHours] Using defaults:", error.message);
    return DEFAULT_DUTY_HOURS;
  }

  if (!data?.duty_start_time || !data?.duty_end_time) {
    return DEFAULT_DUTY_HOURS;
  }

  return {
    duty_start_time: data.duty_start_time,
    duty_end_time: data.duty_end_time,
    late_grace_minutes: data.late_grace_minutes ?? DEFAULT_DUTY_HOURS.late_grace_minutes,
  };
}
