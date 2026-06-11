import { supabase } from "@/lib/supabase";
import type { CorrectionRequest, CorrectionType } from "@/types/hr";

export async function fetchCorrectionRequests(
  employeeId: string,
): Promise<CorrectionRequest[]> {
  const { data, error } = await supabase
    .from("manual_attendance_requests")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CorrectionRequest[];
}

export async function submitCorrectionRequest(input: {
  employeeId: string;
  correctionType: CorrectionType;
  attendanceDate: string;
  requestedCheckIn?: string | null;
  requestedCheckOut?: string | null;
  reason: string;
}): Promise<void> {
  const { error } = await supabase.from("manual_attendance_requests").insert({
    employee_id: input.employeeId,
    correction_type: input.correctionType,
    attendance_date: input.attendanceDate,
    requested_check_in: input.requestedCheckIn ?? null,
    requested_check_out: input.requestedCheckOut ?? null,
    reason: input.reason,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}
