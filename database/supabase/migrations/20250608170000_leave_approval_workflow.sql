-- Leave approval workflow: enum value, remarks columns, indexes
-- Note: RLS policy referencing 'cancelled' is in the next migration because
-- PostgreSQL forbids using a newly-added enum value in the same transaction.

ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS admin_remarks TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leave_requests_status_idx ON public.leave_requests (status);
CREATE INDEX IF NOT EXISTS leave_requests_created_at_idx ON public.leave_requests (created_at DESC);

-- Admins can insert notifications for employees (approve/reject alerts)
CREATE POLICY "Admins can create employee notifications"
  ON public.employee_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());
