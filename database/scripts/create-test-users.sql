-- =============================================================================
-- Create test users for Employee Attendance System
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Credentials after running:
--   admin@company.com    / Password123!
--   employee@company.com / Password123!
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  admin_id UUID := 'a0000000-0000-4000-8000-000000000001';
  employee_id UUID := 'a0000000-0000-4000-8000-000000000002';
  user_password TEXT := crypt('Password123!', gen_salt('bf'));
BEGIN
  -- auth.users
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
      user_password,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Admin","role":"admin"}',
      NOW(),
      NOW(),
      '', '', '', ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      employee_id,
      'authenticated',
      'authenticated',
      'employee@company.com',
      user_password,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test Employee","role":"employee"}',
      NOW(),
      NOW(),
      '', '', '', ''
    )
  ON CONFLICT (id) DO NOTHING;

  -- auth.identities (required for email login)
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
      NOW(), NOW(), NOW()
    ),
    (
      employee_id,
      employee_id,
      jsonb_build_object('sub', employee_id::text, 'email', 'employee@company.com'),
      'email',
      employee_id::text,
      NOW(), NOW(), NOW()
    )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- profiles (upsert — covers trigger-created or missing profiles)
  INSERT INTO public.profiles (
    id, full_name, email, role, employee_code, phone, is_active
  )
  VALUES
    (
      admin_id,
      'System Admin',
      'admin@company.com',
      'admin',
      'ADM001',
      '+920000000001',
      TRUE
    ),
    (
      employee_id,
      'Test Employee',
      'employee@company.com',
      'employee',
      'EMP001',
      '+920000000002',
      TRUE
    )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    employee_code = EXCLUDED.employee_code,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active;
END $$;

-- Verify
SELECT id, email, role, full_name, is_active
FROM public.profiles
WHERE email IN ('admin@company.com', 'employee@company.com');
