export type LeaveType =
  | "annual"
  | "sick"
  | "casual"
  | "emergency"
  | "work_from_home";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: "Annual",
  sick: "Sick",
  casual: "Casual",
  emergency: "Emergency",
  work_from_home: "Work From Home",
};

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

export function formatLeaveDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return startDate;
  }
  return `${startDate} to ${endDate}`;
}
