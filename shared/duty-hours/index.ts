export type DutyHours = {
  duty_start_time: string;
  duty_end_time: string;
  late_grace_minutes: number;
};

export const DEFAULT_DUTY_HOURS: DutyHours = {
  duty_start_time: "08:00:00",
  duty_end_time: "17:00:00",
  late_grace_minutes: 15,
};

export function normalizeTimeInput(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

export function toTimeInputValue(value: string): string {
  return value.slice(0, 5);
}

export function formatDutyTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function resolveCheckInStatus(
  checkInTime: Date,
  duty: DutyHours,
): "present" | "late" {
  const dutyStartMinutes = parseTimeToMinutes(duty.duty_start_time);
  const checkInMinutes = getMinutesSinceMidnight(checkInTime);
  const graceMinutes = Math.max(0, duty.late_grace_minutes);

  return checkInMinutes > dutyStartMinutes + graceMinutes ? "late" : "present";
}

export function validateCheckInWindow(
  now: Date,
  duty: DutyHours,
): string | null {
  const currentMinutes = getMinutesSinceMidnight(now);
  const startMinutes = parseTimeToMinutes(duty.duty_start_time);
  const endMinutes = parseTimeToMinutes(duty.duty_end_time);

  if (currentMinutes < startMinutes) {
    return `Check-in opens at ${formatDutyTime(duty.duty_start_time)}.`;
  }

  if (currentMinutes > endMinutes) {
    return `Check-in is closed. Your duty hours end at ${formatDutyTime(duty.duty_end_time)}.`;
  }

  return null;
}

export function normalizeDutyHoursInput(input: {
  duty_start_time: string;
  duty_end_time: string;
  late_grace_minutes: number;
}): DutyHours {
  const dutyStart = normalizeTimeInput(input.duty_start_time);
  const dutyEnd = normalizeTimeInput(input.duty_end_time);
  const grace = Math.max(0, Math.min(120, Math.round(input.late_grace_minutes)));

  if (dutyEnd <= dutyStart) {
    throw new Error("Duty end time must be after duty start time.");
  }

  return {
    duty_start_time: dutyStart,
    duty_end_time: dutyEnd,
    late_grace_minutes: grace,
  };
}
