import { createClient } from "@/lib/supabase/server";
import { toDateInputValue } from "@/lib/attendance/utils";

export type ReportSummary = {
  totalEmployees: number;
  activeEmployees: number;
  attendanceRecords: number;
  leaveRequests: number;
};

export async function fetchReportSummary(
  startDate: string,
  endDate: string,
): Promise<ReportSummary> {
  const supabase = await createClient();
  const rangeStart = `${startDate}T00:00:00.000Z`;
  const rangeEnd = `${endDate}T23:59:59.999Z`;

  const [employeesResult, attendanceResult, leaveResult] = await Promise.all([
    supabase.from("profiles").select("id, is_active").eq("role", "employee"),
    supabase
      .from("attendance_records")
      .select("id", { count: "exact", head: true })
      .gte("created_at", rangeStart)
      .lte("created_at", rangeEnd),
    supabase
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", rangeStart)
      .lte("created_at", rangeEnd),
  ]);

  if (employeesResult.error) throw new Error(employeesResult.error.message);
  if (attendanceResult.error) throw new Error(attendanceResult.error.message);
  if (leaveResult.error) throw new Error(leaveResult.error.message);

  const employees = employeesResult.data ?? [];

  return {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e) => e.is_active).length,
    attendanceRecords: attendanceResult.count ?? 0,
    leaveRequests: leaveResult.count ?? 0,
  };
}

export function getDefaultReportRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}
