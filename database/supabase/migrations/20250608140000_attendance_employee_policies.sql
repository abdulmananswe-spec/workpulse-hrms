-- Allow employees to read office locations for geofence validation
CREATE POLICY "Employees can view office locations"
  ON public.office_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'employee'::public.app_role
        AND is_active = TRUE
    )
  );

-- Allow employees to create their own attendance records
CREATE POLICY "Employees can create own attendance"
  ON public.attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

-- Allow employees to update their own attendance records (check-out)
CREATE POLICY "Employees can update own attendance"
  ON public.attendance_records
  FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());
