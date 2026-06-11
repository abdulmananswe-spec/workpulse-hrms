-- =============================================================================
-- Employee Attendance System — Initial Schema
-- Order: enums → tables → trigger functions → triggers → helpers → RLS → policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Enums
-- -----------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

-- -----------------------------------------------------------------------------
-- B. Tables
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'employee',
  employee_code TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.office_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  check_in_lat NUMERIC(10, 7),
  check_in_lng NUMERIC(10, 7),
  check_out_lat NUMERIC(10, 7),
  check_out_lng NUMERIC(10, 7),
  status public.attendance_status NOT NULL DEFAULT 'absent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date)
);

CREATE TABLE public.manual_attendance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  requested_check_in TIMESTAMPTZ,
  requested_check_out TIMESTAMPTZ,
  reason TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX profiles_role_idx ON public.profiles (role);
CREATE INDEX profiles_employee_code_idx ON public.profiles (employee_code);
CREATE INDEX attendance_records_employee_id_idx ON public.attendance_records (employee_id);
CREATE INDEX attendance_records_created_at_idx ON public.attendance_records (created_at);
CREATE INDEX leave_requests_employee_id_idx ON public.leave_requests (employee_id);
CREATE INDEX manual_attendance_requests_employee_id_idx
  ON public.manual_attendance_requests (employee_id);

-- -----------------------------------------------------------------------------
-- C. Trigger functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.app_role,
      'employee'::public.app_role
    )
  );

  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- D. Helper functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'::public.app_role
      AND is_active = TRUE
  );
$$;

-- -----------------------------------------------------------------------------
-- E. Enable RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_attendance_requests ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- F. RLS policies
-- -----------------------------------------------------------------------------
-- profiles
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Employees can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- office_locations
CREATE POLICY "Admins have full access to office_locations"
  ON public.office_locations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- attendance_records
CREATE POLICY "Admins have full access to attendance_records"
  ON public.attendance_records
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view own attendance"
  ON public.attendance_records
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- leave_requests
CREATE POLICY "Admins have full access to leave_requests"
  ON public.leave_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Employees can create leave requests"
  ON public.leave_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can view own leave requests"
  ON public.leave_requests
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- manual_attendance_requests
CREATE POLICY "Admins have full access to manual_attendance_requests"
  ON public.manual_attendance_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Employees can create manual attendance requests"
  ON public.manual_attendance_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can view own manual attendance requests"
  ON public.manual_attendance_requests
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());
