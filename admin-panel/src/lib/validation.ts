const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) {
    return "Start and end dates are required.";
  }

  if (endDate < startDate) {
    return "End date must be on or after start date.";
  }

  return null;
}
