-- Repair: ensure org_settings columns from 20250608200000 exist.
-- Idempotent — safe if columns/constraint already present.

ALTER TABLE public.org_settings
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS default_geofence_radius INTEGER,
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN;

UPDATE public.org_settings
SET
  company_name = COALESCE(company_name, 'WorkPulse HRMS'),
  timezone = COALESCE(timezone, 'Asia/Karachi'),
  default_geofence_radius = COALESCE(default_geofence_radius, 150),
  email_notifications_enabled = COALESCE(email_notifications_enabled, TRUE)
WHERE company_name IS NULL
   OR timezone IS NULL
   OR default_geofence_radius IS NULL
   OR email_notifications_enabled IS NULL;

ALTER TABLE public.org_settings
  ALTER COLUMN company_name SET DEFAULT 'WorkPulse HRMS',
  ALTER COLUMN timezone SET DEFAULT 'Asia/Karachi',
  ALTER COLUMN default_geofence_radius SET DEFAULT 150,
  ALTER COLUMN email_notifications_enabled SET DEFAULT TRUE;

ALTER TABLE public.org_settings
  ALTER COLUMN company_name SET NOT NULL,
  ALTER COLUMN timezone SET NOT NULL,
  ALTER COLUMN default_geofence_radius SET NOT NULL,
  ALTER COLUMN email_notifications_enabled SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'org_settings_geofence_check'
      AND conrelid = 'public.org_settings'::regclass
  ) THEN
    ALTER TABLE public.org_settings
      ADD CONSTRAINT org_settings_geofence_check
      CHECK (default_geofence_radius >= 10 AND default_geofence_radius <= 5000);
  END IF;
END $$;
