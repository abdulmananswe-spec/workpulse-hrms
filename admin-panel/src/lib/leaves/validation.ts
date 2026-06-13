import type { SupabaseClient } from "@supabase/supabase-js";

import {
  collectAttendanceDateKeys,
  getTodayDateKey,
  validateLeaveRequest,
  type ExistingLeaveRequest,
} from "@shared/leave-validation";

const DEFAULT_TIMEZONE = "Asia/Karachi";

async function fetchOrgTimezone(client: SupabaseClient): Promise<string> {
  const { data, error } = await client
    .from("org_settings")
    .select("timezone")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.timezone?.trim() || DEFAULT_TIMEZONE;
}

function getUtcBoundsForDateRange(startDate: string, endDate: string): {
  rangeStart: string;
  rangeEnd: string;
} {
  const rangeStart = new Date(`${startDate}T00:00:00.000Z`);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - 1);

  const rangeEnd = new Date(`${endDate}T00:00:00.000Z`);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 2);

  return {
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
  };
}

export async function assertLeaveRequestIsValid(
  client: SupabaseClient,
  input: {
    employeeId: string;
    startDate: string;
    endDate: string;
    excludeLeaveId?: string;
  },
): Promise<void> {
  const timezone = await fetchOrgTimezone(client);
  const today = getTodayDateKey(timezone);
  const { rangeStart, rangeEnd } = getUtcBoundsForDateRange(
    input.startDate,
    input.endDate,
  );

  const [attendanceResult, leavesResult] = await Promise.all([
    client
      .from("attendance_records")
      .select("created_at, check_in_time, check_out_time")
      .eq("employee_id", input.employeeId)
      .gte("created_at", rangeStart)
      .lte("created_at", rangeEnd),
    client
      .from("leave_requests")
      .select("id, start_date, end_date, status")
      .eq("employee_id", input.employeeId)
      .in("status", ["pending", "approved", "rejected", "cancelled"]),
  ]);

  if (attendanceResult.error) {
    throw new Error(attendanceResult.error.message);
  }

  if (leavesResult.error) {
    throw new Error(leavesResult.error.message);
  }

  const validationError = validateLeaveRequest({
    startDate: input.startDate,
    endDate: input.endDate,
    today,
    attendanceDateKeys: collectAttendanceDateKeys(
      attendanceResult.data ?? [],
      timezone,
    ),
    existingLeaves: (leavesResult.data ?? []) as ExistingLeaveRequest[],
    excludeLeaveId: input.excludeLeaveId,
  });

  if (validationError) {
    throw new Error(validationError);
  }
}

export async function assertLeaveCanBeApproved(
  client: SupabaseClient,
  request: {
    id: string;
    employee_id: string;
    start_date: string;
    end_date: string;
  },
): Promise<void> {
  await assertLeaveRequestIsValid(client, {
    employeeId: request.employee_id,
    startDate: request.start_date,
    endDate: request.end_date,
    excludeLeaveId: request.id,
  });
}
