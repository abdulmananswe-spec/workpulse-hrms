-- Leave request business rules: attendance conflict, past dates, overlapping leave

CREATE OR REPLACE FUNCTION public.get_org_timezone()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT timezone FROM public.org_settings WHERE singleton_key = 'default' LIMIT 1),
    'Asia/Karachi'
  );
$$;

CREATE OR REPLACE FUNCTION public.validate_leave_request_dates(
  p_employee_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_leave_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_timezone TEXT;
  v_today DATE;
BEGIN
  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Start and end dates are required.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must be on or after start date.'
      USING ERRCODE = 'check_violation';
  END IF;

  v_timezone := public.get_org_timezone();
  v_today := (NOW() AT TIME ZONE v_timezone)::DATE;

  IF p_start_date < v_today THEN
    RAISE EXCEPTION 'Leave can only be requested for today or future dates.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.attendance_records AS ar
    WHERE ar.employee_id = p_employee_id
      AND (ar.created_at AT TIME ZONE v_timezone)::DATE >= p_start_date
      AND (ar.created_at AT TIME ZONE v_timezone)::DATE <= p_end_date
  ) THEN
    RAISE EXCEPTION
      'Attendance has already been recorded for this date. Leave cannot be requested.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.leave_requests AS lr
    WHERE lr.employee_id = p_employee_id
      AND lr.status IN ('pending'::public.request_status, 'approved'::public.request_status)
      AND (p_exclude_leave_id IS NULL OR lr.id <> p_exclude_leave_id)
      AND lr.start_date <= p_end_date
      AND lr.end_date >= p_start_date
  ) THEN
    RAISE EXCEPTION
      'You already have a leave request that overlaps with these dates.'
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_leave_request_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.validate_leave_request_dates(
      NEW.employee_id,
      NEW.start_date,
      NEW.end_date
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.status = 'approved'::public.request_status
     AND OLD.status = 'pending'::public.request_status THEN
    PERFORM public.validate_leave_request_dates(
      NEW.employee_id,
      NEW.start_date,
      NEW.end_date,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leave_requests_enforce_rules ON public.leave_requests;

CREATE TRIGGER leave_requests_enforce_rules
  BEFORE INSERT OR UPDATE OF status, start_date, end_date
  ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_leave_request_rules();
