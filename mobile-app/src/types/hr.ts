import type { Branch, Profile } from "@/types/database";

export type ProfileWithBranch = Profile & {
  branch: Pick<
    Branch,
    "id" | "name" | "address" | "latitude" | "longitude" | "radius_meters" | "is_active"
  > | null;
};

export type LeaveType =
  | "annual"
  | "sick"
  | "casual"
  | "emergency"
  | "work_from_home";

export type LeaveBalance = {
  leave_type: LeaveType;
  total_days: number;
  used_days: number;
  remaining_days: number;
};

export type LeaveRequest = {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  admin_remarks: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type CorrectionType =
  | "missed_check_in"
  | "missed_check_out"
  | "attendance_correction";

export type CorrectionRequest = {
  id: string;
  employee_id: string;
  correction_type: CorrectionType;
  attendance_date: string;
  requested_check_in: string | null;
  requested_check_out: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type EmployeeNotification = {
  id: string;
  employee_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  published_at: string;
};

export type AttendanceStats = {
  presentDays: number;
  absentDays: number;
  leaveBalance: number;
  attendancePercentage: number;
  currentStreak: number;
  bestStreak: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: "Annual",
  sick: "Sick",
  casual: "Casual",
  emergency: "Emergency",
  work_from_home: "Work From Home",
};
