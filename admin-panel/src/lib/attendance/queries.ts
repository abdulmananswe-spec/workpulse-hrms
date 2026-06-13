import { createClient } from "@/lib/supabase/server";
import {
  getDayRangeFromDateInput,
  toDateInputValue,
} from "@/lib/attendance/utils";
import type { AttendanceStatus } from "@/types/database";

export type AdminAttendanceRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  employeeAvatarUrl: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  createdAt: string;
};

export type AdminAttendanceSummary = {
  totalPresent: number;
  totalAbsent: number;
  totalCheckedIn: number;
  totalEmployees: number;
};

export async function fetchAdminAttendanceData(dateInput?: string) {
  const supabase = await createClient();
  const selectedDate = dateInput ?? toDateInputValue();
  const { start, end } = getDayRangeFromDateInput(selectedDate);

  const [{ data: employees, error: employeesError }, { data: records, error: recordsError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, employee_code, avatar_url, is_active")
        .eq("role", "employee")
        .eq("is_active", true)
        .order("full_name"),
      supabase
        .from("attendance_records")
        .select("*")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false }),
    ]);

  if (employeesError) {
    throw new Error(employeesError.message);
  }

  if (recordsError) {
    throw new Error(recordsError.message);
  }

  const employeeList = employees ?? [];
  const recordList = records ?? [];
  const recordsByEmployee = new Map<string, (typeof recordList)[number]>();

  for (const record of recordList) {
    if (!recordsByEmployee.has(record.employee_id)) {
      recordsByEmployee.set(record.employee_id, record);
    }
  }

  const rows: AdminAttendanceRow[] = employeeList.map((employee) => {
    const record = recordsByEmployee.get(employee.id);

    return {
      id: record?.id ?? employee.id,
      employeeId: employee.id,
      employeeName: employee.full_name,
      employeeCode: employee.employee_code,
      employeeAvatarUrl: employee.avatar_url,
      checkInTime: record?.check_in_time ?? null,
      checkOutTime: record?.check_out_time ?? null,
      status: record?.status ?? "absent",
      createdAt: record?.created_at ?? start,
    };
  });

  const totalEmployees = employeeList.length;
  const totalCheckedIn = rows.filter((row) => Boolean(row.checkInTime)).length;
  const totalPresent = rows.filter(
    (row) => row.status === "present" || row.status === "late",
  ).length;
  const totalAbsent = totalEmployees - totalCheckedIn;

  const summary: AdminAttendanceSummary = {
    totalPresent,
    totalAbsent,
    totalCheckedIn,
    totalEmployees,
  };

  return {
    selectedDate,
    summary,
    rows,
  };
}
