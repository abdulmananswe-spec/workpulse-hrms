import {
  LEAVE_VALIDATION_ERRORS,
  validateLeaveRequest,
} from "@shared/leave-validation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateLeaveDates(startDate: string, endDate: string): string | null {
  const today = new Date().toISOString().slice(0, 10);

  return validateLeaveRequest({
    startDate,
    endDate,
    today,
    attendanceDateKeys: [],
    existingLeaves: [],
  });
}

export { LEAVE_VALIDATION_ERRORS };
