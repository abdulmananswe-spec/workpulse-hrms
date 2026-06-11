import { createClient } from "@/lib/supabase/server";
import type { LeaveStatus, LeaveType } from "@/lib/leaves/utils";

export type LeaveRequestRow = {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LeaveStatus;
  admin_remarks: string | null;
  reviewed_at: string | null;
  created_at: string;
  employee: {
    id: string;
    full_name: string;
    email: string;
    employee_code: string | null;
    designation: string | null;
  } | null;
};

export type LeaveSummary = {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

export async function fetchLeaveRequests(
  status?: LeaveStatus,
): Promise<LeaveRequestRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("leave_requests")
    .select(
      `
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        admin_remarks,
        reviewed_at,
        created_at,
        employee:profiles!leave_requests_employee_id_fkey (
          id,
          full_name,
          email,
          employee_code,
          designation
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LeaveRequestRow[];
}

export async function fetchLeaveSummary(): Promise<LeaveSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("leave_requests").select("status");

  if (error) {
    throw new Error(error.message);
  }

  const summary: LeaveSummary = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  for (const row of data ?? []) {
    const status = row.status as LeaveStatus;
    if (status in summary) {
      summary[status] += 1;
    }
  }

  return summary;
}
