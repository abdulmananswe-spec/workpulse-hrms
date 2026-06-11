import type { AttendanceStatus } from "@/types/database";

export type AttendanceRecord = {
  id: string;
  employee_id: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  status: AttendanceStatus;
  created_at: string;
};

export type OfficeLocation = {
  id: string;
  office_name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  created_at: string;
};
