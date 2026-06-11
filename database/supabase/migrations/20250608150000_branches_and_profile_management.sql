-- =============================================================================
-- Phase 4 — Branches, employee profile fields, avatar storage, geofence RLS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Branches table
-- -----------------------------------------------------------------------------
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX branches_is_active_idx ON public.branches (is_active);

-- Migrate existing office locations into branches
INSERT INTO public.branches (name, address, latitude, longitude, radius_meters, is_active)
SELECT
  office_name,
  address,
  latitude,
  longitude,
  radius_meters,
  TRUE
FROM public.office_locations;

-- -----------------------------------------------------------------------------
-- B. Profile extensions
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches (id) ON DELETE SET NULL;

CREATE INDEX profiles_branch_id_idx ON public.profiles (branch_id);

-- Assign default branch to existing employees
UPDATE public.profiles p
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  ORDER BY b.created_at
  LIMIT 1
)
WHERE p.role = 'employee'::public.app_role
  AND p.branch_id IS NULL;

-- -----------------------------------------------------------------------------
-- C. Restrict employee self-updates to safe fields
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_employee_profile_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.email := OLD.email;
    NEW.employee_code := OLD.employee_code;
    NEW.branch_id := OLD.branch_id;
    NEW.designation := OLD.designation;
    NEW.is_active := OLD.is_active;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_enforce_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_employee_profile_self_update();

-- -----------------------------------------------------------------------------
-- D. RLS — branches
-- -----------------------------------------------------------------------------
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to branches"
  ON public.branches
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Employees can view assigned branch"
  ON public.branches
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT branch_id
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'employee'::public.app_role
        AND is_active = TRUE
    )
    AND is_active = TRUE
  );

-- -----------------------------------------------------------------------------
-- E. Avatar storage bucket
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
