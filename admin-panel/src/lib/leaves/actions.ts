"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { calculateLeaveDays, LEAVE_TYPE_LABELS, type LeaveType } from "@/lib/leaves/utils";
import { createAdminNotification } from "@/lib/notifications/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedAdminProfile } from "@/lib/auth/server";

async function notifyEmployee(input: {
  employeeId: string;
  type: "leave_approval" | "leave_rejection";
  title: string;
  body: string;
  leaveRequestId: string;
}) {
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("employee_notifications").insert({
    employee_id: input.employeeId,
    title: input.title,
    body: input.body,
    type: input.type,
    metadata: { leave_request_id: input.leaveRequestId },
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function updateLeaveBalanceOnApproval(
  employeeId: string,
  leaveType: LeaveType,
  days: number,
) {
  const adminClient = createAdminClient();

  const { data: balance, error: fetchError } = await adminClient
    .from("employee_leave_balances")
    .select("total_days, used_days")
    .eq("employee_id", employeeId)
    .eq("leave_type", leaveType)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!balance) {
    return;
  }

  const usedDays = Number(balance.used_days) + days;
  const { error: updateError } = await adminClient
    .from("employee_leave_balances")
    .update({ used_days: usedDays })
    .eq("employee_id", employeeId)
    .eq("leave_type", leaveType);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

function revalidateLeavePages() {
  revalidatePath("/dashboard/leaves");
}

export async function approveLeaveAction(
  leaveRequestId: string,
  adminRemarks?: string,
): Promise<void> {
  await requireAdminAction();
  const { profile: adminProfile } = await getAuthenticatedAdminProfile();
  const adminClient = createAdminClient();

  const { data: request, error: fetchError } = await adminClient
    .from("leave_requests")
    .select("*")
    .eq("id", leaveRequestId)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!request) {
    throw new Error("Leave request not found or already processed.");
  }

  const remarks = adminRemarks?.trim() || null;
  const now = new Date().toISOString();

  const { error: updateError } = await adminClient
    .from("leave_requests")
    .update({
      status: "approved",
      admin_remarks: remarks,
      reviewed_at: now,
      reviewed_by: adminProfile.id,
    })
    .eq("id", leaveRequestId)
    .eq("status", "pending");

  if (updateError) {
    throw new Error(updateError.message);
  }

  const leaveType = request.leave_type as LeaveType;
  const days = calculateLeaveDays(request.start_date, request.end_date);
  await updateLeaveBalanceOnApproval(request.employee_id, leaveType, days);

  const typeLabel = LEAVE_TYPE_LABELS[leaveType];
  await notifyEmployee({
    employeeId: request.employee_id,
    type: "leave_approval",
    title: "Leave Request Approved",
    body: remarks
      ? `Your ${typeLabel} leave (${request.start_date} to ${request.end_date}) was approved. Remarks: ${remarks}`
      : `Your ${typeLabel} leave (${request.start_date} to ${request.end_date}) was approved.`,
    leaveRequestId,
  });

  await createAdminNotification({
    title: "Leave approved",
    message: `${typeLabel} leave (${request.start_date} to ${request.end_date}) was approved.`,
    type: "leave",
    metadata: { leave_request_id: leaveRequestId },
  });

  revalidateLeavePages();
}

export async function rejectLeaveAction(
  leaveRequestId: string,
  adminRemarks: string,
): Promise<void> {
  await requireAdminAction();

  const remarks = adminRemarks.trim();
  if (!remarks) {
    throw new Error("Remarks are required when rejecting a leave request.");
  }

  const adminClient = createAdminClient();
  const { profile: adminProfile } = await getAuthenticatedAdminProfile();

  const { data: request, error: fetchError } = await adminClient
    .from("leave_requests")
    .select("*")
    .eq("id", leaveRequestId)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!request) {
    throw new Error("Leave request not found or already processed.");
  }

  const now = new Date().toISOString();

  const { error: updateError } = await adminClient
    .from("leave_requests")
    .update({
      status: "rejected",
      admin_remarks: remarks,
      reviewed_at: now,
      reviewed_by: adminProfile.id,
    })
    .eq("id", leaveRequestId)
    .eq("status", "pending");

  if (updateError) {
    throw new Error(updateError.message);
  }

  const leaveType = request.leave_type as LeaveType;
  const typeLabel = LEAVE_TYPE_LABELS[leaveType];

  await notifyEmployee({
    employeeId: request.employee_id,
    type: "leave_rejection",
    title: "Leave Request Rejected",
    body: `Your ${typeLabel} leave (${request.start_date} to ${request.end_date}) was rejected. Remarks: ${remarks}`,
    leaveRequestId,
  });

  await createAdminNotification({
    title: "Leave rejected",
    message: `${typeLabel} leave (${request.start_date} to ${request.end_date}) was rejected.`,
    type: "leave",
    metadata: { leave_request_id: leaveRequestId },
  });

  revalidateLeavePages();
}
