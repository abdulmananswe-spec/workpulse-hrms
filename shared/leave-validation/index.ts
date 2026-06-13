export const LEAVE_VALIDATION_ERRORS = {
  DATES_REQUIRED: "Start and end dates are required.",
  END_BEFORE_START: "End date must be on or after start date.",
  PAST_DATE: "Leave can only be requested for today or future dates.",
  ATTENDANCE_EXISTS:
    "Attendance has already been recorded for this date. Leave cannot be requested.",
  OVERLAPPING_LEAVE:
    "You already have a leave request that overlaps with these dates.",
} as const;

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ExistingLeaveRequest = {
  id: string;
  start_date: string;
  end_date: string;
  status: LeaveRequestStatus;
};

export type AttendanceRecordForLeaveValidation = {
  created_at: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
};

export function toDateKeyInTimezone(
  isoTimestamp: string,
  timezone: string,
): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(isoTimestamp),
  );
}

export function getTodayDateKey(
  timezone: string,
  now: Date = new Date(),
): string {
  return toDateKeyInTimezone(now.toISOString(), timezone);
}

export function enumerateDateKeys(startDate: string, endDate: string): string[] {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

  const cursor = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const keys: string[] = [];

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    keys.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA <= endB && startB <= endA;
}

export function collectAttendanceDateKeys(
  records: AttendanceRecordForLeaveValidation[],
  timezone: string,
): Set<string> {
  const keys = new Set<string>();

  for (const record of records) {
    if (record.check_in_time || record.check_out_time || record.created_at) {
      keys.add(toDateKeyInTimezone(record.created_at, timezone));
    }
  }

  return keys;
}

export function validateLeaveRequest(input: {
  startDate: string;
  endDate: string;
  today: string;
  attendanceDateKeys: Iterable<string>;
  existingLeaves: ExistingLeaveRequest[];
  excludeLeaveId?: string;
}): string | null {
  const { startDate, endDate, today, attendanceDateKeys, existingLeaves } =
    input;

  if (!startDate || !endDate) {
    return LEAVE_VALIDATION_ERRORS.DATES_REQUIRED;
  }

  if (endDate < startDate) {
    return LEAVE_VALIDATION_ERRORS.END_BEFORE_START;
  }

  if (startDate < today) {
    return LEAVE_VALIDATION_ERRORS.PAST_DATE;
  }

  const attendanceDates = new Set(attendanceDateKeys);
  for (const dateKey of enumerateDateKeys(startDate, endDate)) {
    if (attendanceDates.has(dateKey)) {
      return LEAVE_VALIDATION_ERRORS.ATTENDANCE_EXISTS;
    }
  }

  for (const leave of existingLeaves) {
    if (leave.status !== "pending" && leave.status !== "approved") {
      continue;
    }

    if (input.excludeLeaveId && leave.id === input.excludeLeaveId) {
      continue;
    }

    if (datesOverlap(startDate, endDate, leave.start_date, leave.end_date)) {
      return LEAVE_VALIDATION_ERRORS.OVERLAPPING_LEAVE;
    }
  }

  return null;
}
