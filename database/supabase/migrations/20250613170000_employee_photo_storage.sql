-- Employee profile photos — admin-managed storage (mobile app is read-only)
-- Path pattern: employees/{employeeId}/profile.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employees',
  'employees',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Employee photos are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'employees');

CREATE POLICY "Admins can upload employee photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employees'
    AND public.is_admin()
  );

CREATE POLICY "Admins can update employee photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'employees'
    AND public.is_admin()
  );

CREATE POLICY "Admins can delete employee photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND public.is_admin()
  );
