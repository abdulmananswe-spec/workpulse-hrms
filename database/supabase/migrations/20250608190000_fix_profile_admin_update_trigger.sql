-- Fix profile update trigger: service-role admin actions were treated as employee self-updates
-- and reverted designation, branch_id, employee_code, is_active, email.

CREATE OR REPLACE FUNCTION public.enforce_employee_profile_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Service role (admin server actions) and authenticated admins may update all fields
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  NEW.role := OLD.role;
  NEW.email := OLD.email;
  NEW.employee_code := OLD.employee_code;
  NEW.branch_id := OLD.branch_id;
  NEW.designation := OLD.designation;
  NEW.is_active := OLD.is_active;

  RETURN NEW;
END;
$$;
