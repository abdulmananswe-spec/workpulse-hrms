const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateLeaveDates(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) {
    return "Start and end dates are required.";
  }

  if (endDate < startDate) {
    return "End date must be on or after start date.";
  }

  const today = new Date().toISOString().slice(0, 10);
  if (startDate < today) {
    return "Leave cannot start in the past.";
  }

  return null;
}
