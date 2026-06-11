-- Employee cancel policy (separate migration: 'cancelled' enum must exist in a prior transaction)

CREATE POLICY "Employees can cancel own pending leave"
  ON public.leave_requests
  FOR UPDATE
  TO authenticated
  USING (
    employee_id = auth.uid()
    AND status = 'pending'::public.request_status
  )
  WITH CHECK (
    employee_id = auth.uid()
    AND status = 'cancelled'::public.request_status
  );
