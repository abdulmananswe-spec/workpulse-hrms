-- Per-employee duty hours (replaces org-wide duty settings for attendance)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS duty_start_time TIME NOT NULL DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS duty_end_time TIME NOT NULL DEFAULT '17:00:00',
  ADD COLUMN IF NOT EXISTS late_grace_minutes INTEGER NOT NULL DEFAULT 15;

UPDATE public.profiles AS p
SET
  duty_start_time = COALESCE(os.duty_start_time, p.duty_start_time),
  duty_end_time = COALESCE(os.duty_end_time, p.duty_end_time),
  late_grace_minutes = COALESCE(os.late_grace_minutes, p.late_grace_minutes)
FROM (
  SELECT duty_start_time, duty_end_time, late_grace_minutes
  FROM public.org_settings
  WHERE singleton_key = 'default'
  LIMIT 1
) AS os
WHERE p.role = 'employee'::public.app_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_duty_range_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_duty_range_check CHECK (duty_end_time > duty_start_time);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_late_grace_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_late_grace_check
      CHECK (late_grace_minutes >= 0 AND late_grace_minutes <= 120);
  END IF;
END;
$$;
