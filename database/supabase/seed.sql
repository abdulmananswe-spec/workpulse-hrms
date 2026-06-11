-- =============================================================================
-- Seed data for local development and testing
-- Default password for all test users: Password123!
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Sample branch (replaces office_locations for geofence)
-- -----------------------------------------------------------------------------
INSERT INTO public.branches (
  name,
  address,
  latitude,
  longitude,
  radius_meters,
  is_active
)
SELECT
  'Head Office',
  '123 Business Park, Main Street',
  24.8607000,
  67.0011000,
  150,
  TRUE
WHERE NOT EXISTS (
  SELECT 1
  FROM public.branches
  WHERE name = 'Head Office'
);

-- Legacy office location seed (kept for backward compatibility)
INSERT INTO public.office_locations (
  office_name,
  address,
  latitude,
  longitude,
  radius_meters
)
SELECT
  'Head Office',
  '123 Business Park, Main Street',
  24.8607000,
  67.0011000,
  150
WHERE NOT EXISTS (
  SELECT 1
  FROM public.office_locations
  WHERE office_name = 'Head Office'
);

-- -----------------------------------------------------------------------------
-- Test users (auth.users + identities + profiles)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  admin_id UUID := 'a0000000-0000-4000-8000-000000000001';
  employee_id UUID := 'a0000000-0000-4000-8000-000000000002';
  head_office_id UUID;
  admin_password TEXT := crypt('Password123!', gen_salt('bf'));
BEGIN
  SELECT id INTO head_office_id
  FROM public.branches
  WHERE name = 'Head Office'
  LIMIT 1;
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES
    (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'admin@company.com',
      admin_password,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Admin","role":"admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      employee_id,
      'authenticated',
      'authenticated',
      'employee@company.com',
      admin_password,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test Employee","role":"employee"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES
    (
      admin_id,
      admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@company.com'),
      'email',
      admin_id::text,
      NOW(),
      NOW(),
      NOW()
    ),
    (
      employee_id,
      employee_id,
      jsonb_build_object('sub', employee_id::text, 'email', 'employee@company.com'),
      'email',
      employee_id::text,
      NOW(),
      NOW(),
      NOW()
    )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    employee_code,
    phone,
    designation,
    branch_id,
    is_active
  )
  VALUES
    (
      admin_id,
      'System Admin',
      'admin@company.com',
      'admin',
      'ADM001',
      '+920000000001',
      'System Administrator',
      NULL,
      TRUE
    ),
    (
      employee_id,
      'Test Employee',
      'employee@company.com',
      'employee',
      'EMP001',
      '+920000000002',
      'Software Engineer',
      head_office_id,
      TRUE
    )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    employee_code = EXCLUDED.employee_code,
    phone = EXCLUDED.phone,
    designation = EXCLUDED.designation,
    branch_id = EXCLUDED.branch_id,
    is_active = EXCLUDED.is_active;
END $$;
