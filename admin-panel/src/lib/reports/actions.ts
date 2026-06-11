"use server";

import { requireAdminAction } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function buildWorkforceCsv() {
  await requireAdminAction();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `full_name, email, employee_code, designation, phone, is_active, branch:branches (name)`,
    )
    .eq("role", "employee")
    .order("full_name");

  if (error) throw new Error(error.message);

  const headers = ["Name", "Email", "Code", "Designation", "Phone", "Branch", "Status"];
  const csvRows = (data ?? []).map((row) => [
    row.full_name,
    row.email,
    row.employee_code ?? "",
    row.designation ?? "",
    row.phone ?? "",
    (row.branch as { name?: string } | null)?.name ?? "",
    row.is_active ? "Active" : "Inactive",
  ]);

  const content = [headers.join(","), ...csvRows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  return { filename: "workforce-report.csv", content };
}

export async function buildAttendanceCsv(startDate: string, endDate: string) {
  await requireAdminAction();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      `created_at, check_in_time, check_out_time, status, employee:profiles!attendance_records_employee_id_fkey (full_name, employee_code, email)`,
    )
    .gte("created_at", `${startDate}T00:00:00.000Z`)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const headers = ["Date", "Employee", "Code", "Email", "Check In", "Check Out", "Status"];
  const csvRows = (data ?? []).map((row) => {
    const emp = row.employee as { full_name?: string; employee_code?: string; email?: string } | null;
    return [
      new Date(row.created_at).toLocaleDateString(),
      emp?.full_name ?? "",
      emp?.employee_code ?? "",
      emp?.email ?? "",
      row.check_in_time ? new Date(row.check_in_time).toLocaleString() : "",
      row.check_out_time ? new Date(row.check_out_time).toLocaleString() : "",
      row.status,
    ];
  });

  const content = [headers.join(","), ...csvRows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  return { filename: `attendance-${startDate}-to-${endDate}.csv`, content };
}

export async function buildLeaveCsv(startDate: string, endDate: string) {
  await requireAdminAction();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      `leave_type, start_date, end_date, reason, status, admin_remarks, created_at, employee:profiles!leave_requests_employee_id_fkey (full_name, employee_code)`,
    )
    .gte("created_at", `${startDate}T00:00:00.000Z`)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const headers = ["Employee", "Code", "Type", "Start", "End", "Status", "Reason", "Admin Remarks", "Created"];
  const csvRows = (data ?? []).map((row) => {
    const emp = row.employee as { full_name?: string; employee_code?: string } | null;
    return [
      emp?.full_name ?? "",
      emp?.employee_code ?? "",
      row.leave_type,
      row.start_date,
      row.end_date,
      row.status,
      row.reason ?? "",
      row.admin_remarks ?? "",
      new Date(row.created_at).toLocaleDateString(),
    ];
  });

  const content = [headers.join(","), ...csvRows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  return { filename: `leave-${startDate}-to-${endDate}.csv`, content };
}
