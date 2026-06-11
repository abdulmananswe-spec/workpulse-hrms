import * as Location from "expo-location";

import { isWithinRadius, type Coordinates } from "@/lib/geofence";
import { getEndOfDay, getStartOfDay } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import { fetchEmployeeBranch } from "@/services/profile";
import { fetchOrgSettings, resolveCheckInStatus } from "@/services/orgSettings";
import type { AttendanceRecord } from "@/types/attendance";

export const OUTSIDE_OFFICE_MESSAGE =
  "You are outside your assigned branch location.";
export const NO_BRANCH_MESSAGE =
  "No branch assigned. Contact your administrator.";
export const INACTIVE_BRANCH_MESSAGE =
  "Your assigned branch is inactive. Contact your administrator.";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  const location = await Promise.race([
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Location request timed out. Try again outdoors.")), 20_000);
    }),
  ]);

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function fetchOfficeLocations(): Promise<never[]> {
  return [];
}

async function validateBranchGeofence(
  employeeId: string,
  coordinates: Coordinates,
): Promise<void> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("branch_id")
    .eq("id", employeeId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const branch = await fetchEmployeeBranch(profile?.branch_id ?? null);

  if (!branch) {
    throw new Error(NO_BRANCH_MESSAGE);
  }

  if (!branch.is_active) {
    throw new Error(INACTIVE_BRANCH_MESSAGE);
  }

  const latitude = Number(branch.latitude);
  const longitude = Number(branch.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Branch location is invalid. Contact your administrator.");
  }

  const withinRadius = isWithinRadius(
    coordinates,
    { latitude, longitude },
    branch.radius_meters,
  );

  if (!withinRadius) {
    throw new Error(OUTSIDE_OFFICE_MESSAGE);
  }
}

export async function fetchTodayAttendance(
  employeeId: string,
): Promise<AttendanceRecord | null> {
  const start = getStartOfDay().toISOString();
  const end = getEndOfDay().toISOString();

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchAttendanceHistory(
  employeeId: string,
  limit = 30,
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function checkIn(employeeId: string): Promise<AttendanceRecord> {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error("Location permission is required to check in.");
  }

  const coordinates = await getCurrentCoordinates();
  await validateBranchGeofence(employeeId, coordinates);

  const existing = await fetchTodayAttendance(employeeId);

  if (existing?.check_in_time) {
    throw new Error("You have already checked in today.");
  }

  const now = new Date();
  const settings = await fetchOrgSettings();
  const status = resolveCheckInStatus(now, settings);

  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      employee_id: employeeId,
      check_in_time: now.toISOString(),
      check_in_lat: coordinates.latitude,
      check_in_lng: coordinates.longitude,
      status,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function checkOut(employeeId: string): Promise<AttendanceRecord> {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error("Location permission is required to check out.");
  }

  const coordinates = await getCurrentCoordinates();
  const todayRecord = await fetchTodayAttendance(employeeId);

  if (!todayRecord?.check_in_time) {
    throw new Error("You must check in before checking out.");
  }

  if (todayRecord.check_out_time) {
    throw new Error("You have already checked out today.");
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("attendance_records")
    .update({
      check_out_time: now,
      check_out_lat: coordinates.latitude,
      check_out_lng: coordinates.longitude,
    })
    .eq("id", todayRecord.id)
    .eq("employee_id", employeeId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function getTodayStatusLabel(
  record: AttendanceRecord | null,
): string {
  if (!record?.check_in_time) {
    return "Not Checked In";
  }

  if (record.check_out_time) {
    return "Checked Out";
  }

  return record.status === "late" ? "Late — Present" : "Present";
}
