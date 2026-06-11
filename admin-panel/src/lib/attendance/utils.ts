export function calculateDistance(
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number },
): number {
  const EARTH_RADIUS_METERS = 6_371_000;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);
  const deltaLat = toRadians(pointB.latitude - pointA.latitude);
  const deltaLng = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function getDayRangeFromDateInput(dateInput: string): {
  start: string;
  end: string;
} {
  const [year, month, day] = dateInput.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatTime(value: string | Date | null): string {
  if (!value) {
    return "—";
  }

  const date = toDate(value);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

export function formatDateTime(value: string | Date | null): string {
  if (!value) {
    return "—";
  }

  const date = toDate(value);
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}, ${formatTime(date)}`;
}

export function workingHoursBetween(
  checkIn: string | null,
  checkOut: string | null,
): string {
  if (!checkIn || !checkOut) {
    return "—";
  }

  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  const diffHours = Math.max(0, end - start) / (1000 * 60 * 60);
  const hours = Math.floor(diffHours);
  const minutes = Math.round((diffHours - hours) * 60);

  return `${hours}h ${minutes}m`;
}
