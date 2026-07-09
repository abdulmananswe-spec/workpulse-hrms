// Org-wide duty hours were moved to per-employee profiles.
export {
  DEFAULT_DUTY_HOURS,
  formatDutyTime,
  resolveCheckInStatus,
  validateCheckInWindow,
  fetchEmployeeDutyHours,
  type DutyHours,
} from "@/services/dutyHours";
