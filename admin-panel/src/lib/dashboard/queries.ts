import { createClient } from "@/lib/supabase/server";
import { fetchAdminAttendanceData } from "@/lib/attendance/queries";
import { fetchLeaveSummary } from "@/lib/leaves/queries";
import { toDateInputValue } from "@/lib/attendance/utils";

export type DashboardMetrics = {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
  pendingRequests: number;
  totalBranches: number;
  attendanceTrend: { date: string; present: number; absent: number }[];
  leaveTrend: { month: string; approved: number; rejected: number; pending: number }[];
  branchDistribution: { name: string; employees: number }[];
  recentActivities: {
    id: string;
    type: "attendance" | "leave";
    title: string;
    subtitle: string;
    time: string;
  }[];
};

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const today = toDateInputValue();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const [
    attendanceData,
    leaveSummary,
    branchesResult,
    employeesResult,
    approvedLeavesResult,
    recentAttendanceResult,
    recentLeavesResult,
    leavesForTrendResult,
    attendanceForTrendResult,
  ] = await Promise.all([
    fetchAdminAttendanceData(today),
    fetchLeaveSummary(),
    supabase.from("branches").select("id, name").eq("is_active", true),
    supabase
      .from("profiles")
      .select("id, branch_id, full_name")
      .eq("role", "employee")
      .eq("is_active", true),
    supabase
      .from("leave_requests")
      .select("id")
      .eq("status", "approved")
      .lte("start_date", today)
      .gte("end_date", today),
    supabase
      .from("attendance_records")
      .select("id, check_in_time, created_at, employee:profiles!attendance_records_employee_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leave_requests")
      .select("id, status, created_at, employee:profiles!leave_requests_employee_id_fkey(full_name), leave_type")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leave_requests")
      .select("start_date, status")
      .gte("start_date", sixMonthsAgoStr),
    supabase
      .from("attendance_records")
      .select("created_at, status")
      .gte("created_at", sevenDaysAgoStr),
  ]);

  if (branchesResult.error) throw new Error(branchesResult.error.message);
  if (employeesResult.error) throw new Error(employeesResult.error.message);
  if (approvedLeavesResult.error) throw new Error(approvedLeavesResult.error.message);
  if (recentAttendanceResult.error) throw new Error(recentAttendanceResult.error.message);
  if (recentLeavesResult.error) throw new Error(recentLeavesResult.error.message);
  if (leavesForTrendResult.error) throw new Error(leavesForTrendResult.error.message);
  if (attendanceForTrendResult.error) throw new Error(attendanceForTrendResult.error.message);

  const employees = employeesResult.data ?? [];
  const branches = branchesResult.data ?? [];
  const branchCounts = new Map<string, number>();

  for (const employee of employees) {
    if (employee.branch_id) {
      branchCounts.set(employee.branch_id, (branchCounts.get(employee.branch_id) ?? 0) + 1);
    }
  }

  const branchDistribution = branches.map((branch) => ({
    name: branch.name,
    employees: branchCounts.get(branch.id) ?? 0,
  }));

  // Build Real Attendance Trend (last 7 days)
  const attendanceForTrend = attendanceForTrendResult.data ?? [];
  const totalEmp = employees.length;

  const attendanceTrendInit = [];
  const daysMap = new Map<string, { present: number }>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateInputValue(d);
    const dateLabel = dateStr.slice(5); // e.g. "07-12"
    attendanceTrendInit.push({
      dateStr,
      date: dateLabel,
      present: 0,
      absent: 0,
    });
    daysMap.set(dateStr, { present: 0 });
  }

  for (const record of attendanceForTrend) {
    if (!record.created_at) continue;
    const recordDate = new Date(record.created_at);
    const dateStr = toDateInputValue(recordDate);
    const dayData = daysMap.get(dateStr);
    if (dayData) {
      if (record.status === "present" || record.status === "late") {
        dayData.present++;
      }
    }
  }

  const attendanceTrend = attendanceTrendInit.map(({ dateStr, date }) => {
    const dayData = daysMap.get(dateStr) || { present: 0 };
    return {
      date,
      present: dayData.present,
      absent: Math.max(0, totalEmp - dayData.present),
    };
  });

  // Build Real Leave Trend (last 6 months)
  const leavesForTrend = leavesForTrendResult.data ?? [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const leaveTrendInit = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // e.g. "2026-07"
    leaveTrendInit.push({
      key,
      month: monthNames[d.getMonth()],
      approved: 0,
      rejected: 0,
      pending: 0,
    });
  }

  for (const leave of leavesForTrend) {
    if (!leave.start_date) continue;
    const yearMonth = leave.start_date.slice(0, 7); // "YYYY-MM"
    const bucket = leaveTrendInit.find((b) => b.key === yearMonth);
    if (bucket) {
      if (leave.status === "approved") {
        bucket.approved++;
      } else if (leave.status === "rejected") {
        bucket.rejected++;
      } else if (leave.status === "pending") {
        bucket.pending++;
      }
    }
  }

  const leaveTrend = leaveTrendInit.map((item) => ({
    month: item.month,
    approved: item.approved,
    rejected: item.rejected,
    pending: item.pending,
  }));

  const recentActivities = [
    ...(recentAttendanceResult.data ?? []).map((row) => ({
      id: `attendance-${row.id}`,
      type: "attendance" as const,
      title: `${(row.employee as { full_name?: string } | null)?.full_name ?? "Employee"} checked in`,
      subtitle: row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString() : "Today",
      time: row.created_at,
    })),
    ...(recentLeavesResult.data ?? []).map((row) => ({
      id: `leave-${row.id}`,
      type: "leave" as const,
      title: `${(row.employee as { full_name?: string } | null)?.full_name ?? "Employee"} leave ${row.status}`,
      subtitle: String(row.leave_type).replaceAll("_", " "),
      time: row.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return {
    totalEmployees: attendanceData.summary.totalEmployees,
    presentToday: attendanceData.summary.totalPresent,
    absentToday: attendanceData.summary.totalAbsent,
    onLeave: approvedLeavesResult.data?.length ?? 0,
    pendingRequests: leaveSummary.pending,
    totalBranches: branches.length,
    attendanceTrend,
    leaveTrend,
    branchDistribution,
    recentActivities,
  };
}
