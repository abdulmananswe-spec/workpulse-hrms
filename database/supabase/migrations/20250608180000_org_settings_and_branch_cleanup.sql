-- Organization duty hours + cleanup invalid/test branches

CREATE TABLE public.org_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key TEXT NOT NULL UNIQUE DEFAULT 'default',
  duty_start_time TIME NOT NULL DEFAULT '09:00:00',
  duty_end_time TIME NOT NULL DEFAULT '18:00:00',
  late_grace_minutes INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  CONSTRAINT org_settings_late_grace_check CHECK (late_grace_minutes >= 0 AND late_grace_minutes <= 120),
  CONSTRAINT org_settings_duty_range_check CHECK (duty_end_time > duty_start_time)
);

INSERT INTO public.org_settings (singleton_key)
VALUES ('default')
ON CONFLICT (singleton_key) DO NOTHING;

CREATE TRIGGER org_settings_set_updated_at
  BEFORE UPDATE ON public.org_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read org settings"
  ON public.org_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update org settings"
  ON public.org_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Remove test/invalid branch records (URLs mistaken as branch names, test offices)
DELETE FROM public.branches
WHERE name ILIKE 'test office%'
   OR name ILIKE '%test office%'
   OR name ~* '^https?://';
