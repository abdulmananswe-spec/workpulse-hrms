-- Phase O — Mobile HR features: notifications, announcements, leave balances

CREATE TYPE public.notification_type AS ENUM (
  'leave_approval',
  'leave_rejection',
  'attendance_approval',
  'attendance_rejection',
  'announcement',
  'general'
);

CREATE TYPE public.leave_type AS ENUM (
  'annual',
  'sick',
  'casual',
  'emergency',
  'work_from_home'
);

CREATE TYPE public.announcement_priority AS ENUM ('high', 'medium', 'low');

CREATE TYPE public.correction_type AS ENUM (
  'missed_check_in',
  'missed_check_out',
  'attendance_correction'
);

ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS leave_type public.leave_type NOT NULL DEFAULT 'annual';

ALTER TABLE public.manual_attendance_requests
  ADD COLUMN IF NOT EXISTS correction_type public.correction_type NOT NULL DEFAULT 'attendance_correction';

CREATE TABLE public.employee_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority public.announcement_priority NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.employee_leave_balances (
  employee_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  leave_type public.leave_type NOT NULL,
  total_days NUMERIC(5, 1) NOT NULL DEFAULT 0,
  used_days NUMERIC(5, 1) NOT NULL DEFAULT 0,
  PRIMARY KEY (employee_id, leave_type)
);

CREATE INDEX employee_notifications_employee_id_idx
  ON public.employee_notifications (employee_id);
CREATE INDEX employee_notifications_is_read_idx
  ON public.employee_notifications (is_read);
CREATE INDEX announcements_published_at_idx
  ON public.announcements (published_at DESC);

ALTER TABLE public.employee_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to employee_notifications"
  ON public.employee_notifications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view own notifications"
  ON public.employee_notifications FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can update own notifications"
  ON public.employee_notifications FOR UPDATE TO authenticated
  USING (employee_id = auth.uid()) WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins have full access to announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view active announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins have full access to employee_leave_balances"
  ON public.employee_leave_balances FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view own leave balances"
  ON public.employee_leave_balances FOR SELECT TO authenticated
  USING (employee_id = auth.uid());

-- Default leave balances for existing employees
INSERT INTO public.employee_leave_balances (employee_id, leave_type, total_days, used_days)
SELECT p.id, lt.leave_type, lt.total_days, 0
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('annual'::public.leave_type, 18::numeric),
    ('sick'::public.leave_type, 10::numeric),
    ('casual'::public.leave_type, 7::numeric),
    ('emergency'::public.leave_type, 3::numeric),
    ('work_from_home'::public.leave_type, 12::numeric)
) AS lt(leave_type, total_days)
WHERE p.role = 'employee'::public.app_role
ON CONFLICT (employee_id, leave_type) DO NOTHING;
