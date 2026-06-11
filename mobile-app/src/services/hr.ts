import { supabase } from "@/lib/supabase";
import type {
  AttendanceStats,
  Achievement,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
} from "@/types/hr";
import type { AttendanceRecord } from "@/types/attendance";
import { toDateKey } from "@/lib/format";

function getMonthRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString(), daysInMonth: end.getDate() };
}

function calculateStreaks(records: AttendanceRecord[]) {
  const presentDates = new Set(
    records
      .filter((r) => r.check_in_time)
      .map((r) => toDateKey(new Date(r.created_at))),
  );

  let bestStreak = 0;
  let currentStreak = 0;

  const sorted = [...presentDates].sort();
  for (let i = 0; i < sorted.length; i += 1) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  let activeStreak = 0;

  if (presentDates.has(today) || presentDates.has(yesterday)) {
    activeStreak = 1;
    let cursor = presentDates.has(today) ? new Date() : new Date(Date.now() - 86400000);
    while (presentDates.has(toDateKey(cursor))) {
      activeStreak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    activeStreak = Math.max(1, activeStreak - 1);
  }

  return { currentStreak: activeStreak, bestStreak: Math.max(bestStreak, activeStreak) };
}

export async function fetchMonthlyAttendance(
  employeeId: string,
  reference = new Date(),
): Promise<AttendanceRecord[]> {
  const { start, end } = getMonthRange(reference);
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAttendanceStats(
  employeeId: string,
): Promise<AttendanceStats> {
  const [monthRecords, allRecords, balances] = await Promise.all([
    fetchMonthlyAttendance(employeeId),
    supabase
      .from("attendance_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false })
      .limit(90),
    supabase.from("employee_leave_balances").select("*").eq("employee_id", employeeId),
  ]);

  if (allRecords.error) throw new Error(allRecords.error.message);
  if (balances.error) throw new Error(balances.error.message);

  const presentDays = monthRecords.filter((r) => r.check_in_time).length;
  const { daysInMonth } = getMonthRange();
  const absentDays = Math.max(0, daysInMonth - presentDays);
  const leaveBalance = (balances.data ?? []).reduce((sum, row) => {
    return sum + (Number(row.total_days) - Number(row.used_days));
  }, 0);
  const attendancePercentage = daysInMonth
    ? Math.round((presentDays / daysInMonth) * 100)
    : 0;
  const streaks = calculateStreaks(allRecords.data ?? []);

  return {
    presentDays,
    absentDays,
    leaveBalance,
    attendancePercentage,
    ...streaks,
  };
}

export async function fetchLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
  const { data, error } = await supabase
    .from("employee_leave_balances")
    .select("*")
    .eq("employee_id", employeeId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    leave_type: row.leave_type as LeaveType,
    total_days: Number(row.total_days),
    used_days: Number(row.used_days),
    remaining_days: Number(row.total_days) - Number(row.used_days),
  }));
}

export async function fetchLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as LeaveRequest[];
}

export async function submitLeaveRequest(input: {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<void> {
  const { error } = await supabase.from("leave_requests").insert({
    employee_id: input.employeeId,
    leave_type: input.leaveType,
    start_date: input.startDate,
    end_date: input.endDate,
    reason: input.reason,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}

export async function cancelLeaveRequest(
  employeeId: string,
  leaveRequestId: string,
): Promise<void> {
  const { error } = await supabase
    .from("leave_requests")
    .update({ status: "cancelled" })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}

export function buildAchievements(stats: AttendanceStats): Achievement[] {
  return [
    {
      id: "perfect-attendance",
      title: "Perfect Attendance",
      description: "100% attendance this month",
      unlocked: stats.attendancePercentage >= 100,
      icon: "trophy",
    },
    {
      id: "on-time-champion",
      title: "On-Time Champion",
      description: "5-day attendance streak",
      unlocked: stats.currentStreak >= 5,
      icon: "flash",
    },
    {
      id: "monthly-star",
      title: "Monthly Star",
      description: "90%+ attendance this month",
      unlocked: stats.attendancePercentage >= 90,
      icon: "star",
    },
  ];
}
