-- Admin notifications + extended org settings

CREATE TYPE public.admin_notification_type AS ENUM (
  'employee',
  'leave',
  'attendance',
  'branch',
  'announcement',
  'system'
);

CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type public.admin_notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX admin_notifications_admin_id_idx
  ON public.admin_notifications (admin_id);
CREATE INDEX admin_notifications_is_read_idx
  ON public.admin_notifications (is_read);
CREATE INDEX admin_notifications_created_at_idx
  ON public.admin_notifications (created_at DESC);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin notifications"
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (
    public.is_admin()
    AND (admin_id IS NULL OR admin_id = auth.uid())
  );

CREATE POLICY "Admins can update own admin notifications"
  ON public.admin_notifications FOR UPDATE TO authenticated
  USING (public.is_admin() AND (admin_id IS NULL OR admin_id = auth.uid()))
  WITH CHECK (public.is_admin() AND (admin_id IS NULL OR admin_id = auth.uid()));

CREATE POLICY "Admins can insert admin notifications"
  ON public.admin_notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

ALTER TABLE public.org_settings
  ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'WorkPulse HRMS',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
  ADD COLUMN IF NOT EXISTS default_geofence_radius INTEGER NOT NULL DEFAULT 150,
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.org_settings
  ADD CONSTRAINT org_settings_geofence_check
  CHECK (default_geofence_radius >= 10 AND default_geofence_radius <= 5000);
