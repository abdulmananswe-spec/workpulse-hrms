import { supabase } from "@/lib/supabase";
import { getDayRangeFromDateInput } from "@/lib/date";
import {
  collectAttendanceDateKeys,
  getTodayDateKey,
  validateLeaveRequest,
  type ExistingLeaveRequest,
} from "@shared/leave-validation";
const DEFAULT_TIMEZONE = "Asia/Karachi";

async function fetchOrgTimezone(): Promise<string> {
  const { data, error } = await supabase
    .from("org_settings")
    .select("timezone")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    console.warn("[LeaveValidation] Using default timezone:", error.message);
    return DEFAULT_TIMEZONE;
  }

  return data?.timezone?.trim() || DEFAULT_TIMEZONE;
}

function getUtcBoundsForDateRange(startDate: string, endDate: string): {
  rangeStart: string;
  rangeEnd: string;
} {
  const { start: localStart } = getDayRangeFromDateInput(startDate);
  const { end: localEnd } = getDayRangeFromDateInput(endDate);
  const rangeStart = new Date(localStart);
  rangeStart.setDate(rangeStart.getDate() - 1);
  const rangeEnd = new Date(localEnd);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  return {
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
  };
}

export async function validateLeaveRequestForEmployee(input: {
  employeeId: string;
  startDate: string;
  endDate: string;
}): Promise<string | null> {
  const timezone = await fetchOrgTimezone();
  const today = getTodayDateKey(timezone);
  const { rangeStart, rangeEnd } = getUtcBoundsForDateRange(
    input.startDate,
    input.endDate,
  );

  const [attendanceResult, leavesResult] = await Promise.all([
    supabase
      .from("attendance_records")
      .select("created_at, check_in_time, check_out_time")
      .eq("employee_id", input.employeeId)
      .gte("created_at", rangeStart)
      .lte("created_at", rangeEnd),
    supabase
      .from("leave_requests")
      .select("id, start_date, end_date, status")
      .eq("employee_id", input.employeeId),
  ]);

  if (attendanceResult.error) {
    throw new Error(attendanceResult.error.message);
  }

  if (leavesResult.error) {
    throw new Error(leavesResult.error.message);
  }

  return validateLeaveRequest({
    startDate: input.startDate,
    endDate: input.endDate,
    today,
    attendanceDateKeys: collectAttendanceDateKeys(
      attendanceResult.data ?? [],
      timezone,
    ),
    existingLeaves: (leavesResult.data ?? []) as ExistingLeaveRequest[],
  });
}
