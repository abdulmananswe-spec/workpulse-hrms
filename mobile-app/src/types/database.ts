export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "employee";
export type AttendanceStatus = "present" | "absent" | "late";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: AppRole;
          employee_code: string | null;
          phone: string | null;
          avatar_url: string | null;
          designation: string | null;
          branch_id: string | null;
          is_active: boolean;
          duty_start_time: string;
          duty_end_time: string;
          late_grace_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          role?: AppRole;
          employee_code?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          designation?: string | null;
          branch_id?: string | null;
          is_active?: boolean;
          duty_start_time?: string;
          duty_end_time?: string;
          late_grace_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: AppRole;
          employee_code?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          designation?: string | null;
          branch_id?: string | null;
          is_active?: boolean;
          duty_start_time?: string;
          duty_end_time?: string;
          late_grace_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      branches: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          latitude: number;
          longitude: number;
          radius_meters: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          latitude: number;
          longitude: number;
          radius_meters?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          latitude?: number;
          longitude?: number;
          radius_meters?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      office_locations: {
        Row: {
          id: string;
          office_name: string;
          address: string | null;
          latitude: number;
          longitude: number;
          radius_meters: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          office_name: string;
          address?: string | null;
          latitude: number;
          longitude: number;
          radius_meters?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          office_name?: string;
          address?: string | null;
          latitude?: number;
          longitude?: number;
          radius_meters?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
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
        Insert: {
          id?: string;
          employee_id: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          check_in_lat?: number | null;
          check_in_lng?: number | null;
          check_out_lat?: number | null;
          check_out_lng?: number | null;
          status?: AttendanceStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          check_in_lat?: number | null;
          check_in_lng?: number | null;
          check_out_lat?: number | null;
          check_out_lng?: number | null;
          status?: AttendanceStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      leave_requests: {
        Row: {
          id: string;
          employee_id: string;
          leave_type: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          status: RequestStatus;
          admin_remarks: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          leave_type?: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
          status?: RequestStatus;
          admin_remarks?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          leave_type?: string;
          start_date?: string;
          end_date?: string;
          reason?: string | null;
          status?: RequestStatus;
          admin_remarks?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      org_settings: {
        Row: {
          id: string;
          singleton_key: string;
          duty_start_time: string;
          duty_end_time: string;
          late_grace_minutes: number;
          timezone: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          singleton_key?: string;
          duty_start_time?: string;
          duty_end_time?: string;
          late_grace_minutes?: number;
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          singleton_key?: string;
          duty_start_time?: string;
          duty_end_time?: string;
          late_grace_minutes?: number;
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      manual_attendance_requests: {
        Row: {
          id: string;
          employee_id: string;
          correction_type: string;
          attendance_date: string;
          requested_check_in: string | null;
          requested_check_out: string | null;
          reason: string | null;
          status: RequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          correction_type?: string;
          attendance_date: string;
          requested_check_in?: string | null;
          requested_check_out?: string | null;
          reason?: string | null;
          status?: RequestStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          correction_type?: string;
          attendance_date?: string;
          requested_check_in?: string | null;
          requested_check_out?: string | null;
          reason?: string | null;
          status?: RequestStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "manual_attendance_requests_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_notifications: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          body: string;
          type: string;
          is_read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          body: string;
          type?: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          body?: string;
          type?: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          priority: string;
          is_active: boolean;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          priority?: string;
          is_active?: boolean;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          priority?: string;
          is_active?: boolean;
          published_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      employee_leave_balances: {
        Row: {
          employee_id: string;
          leave_type: string;
          total_days: number;
          used_days: number;
        };
        Insert: {
          employee_id: string;
          leave_type: string;
          total_days?: number;
          used_days?: number;
        };
        Update: {
          employee_id?: string;
          leave_type?: string;
          total_days?: number;
          used_days?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      attendance_status: AttendanceStatus;
      request_status: RequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
