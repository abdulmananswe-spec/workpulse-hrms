-- Verify handle_new_user trigger exists and test profile auto-creation
-- Run AFTER create-test-users.sql

-- 1. Confirm trigger is attached
SELECT
  tgname AS trigger_name,
  relname AS table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth'
  AND relname = 'users'
  AND tgname = 'on_auth_user_created';

-- 2. Confirm handle_new_user function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. Verify existing test profiles
SELECT id, email, role, full_name, created_at
FROM public.profiles
WHERE email IN ('admin@company.com', 'employee@company.com')
ORDER BY email;

-- 4. Trigger test (optional — creates a temporary user, then removes it)
-- Uncomment to run a live trigger test:
--
-- DO $$
-- DECLARE
--   test_id UUID := gen_random_uuid();
-- BEGIN
--   INSERT INTO auth.users (
--     instance_id, id, aud, role, email,
--     encrypted_password, email_confirmed_at,
--     raw_app_meta_data, raw_user_meta_data,
--     created_at, updated_at,
--     confirmation_token, email_change, email_change_token_new, recovery_token
--   ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     test_id, 'authenticated', 'authenticated',
--     'trigger-test-' || test_id::text || '@company.com',
--     crypt('Password123!', gen_salt('bf')), NOW(),
--     '{"provider":"email","providers":["email"]}',
--     '{"full_name":"Trigger Test","role":"employee"}',
--     NOW(), NOW(), '', '', '', ''
--   );
--
--   IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = test_id) THEN
--     RAISE EXCEPTION 'handle_new_user trigger FAILED — no profile created';
--   END IF;
--
--   DELETE FROM public.profiles WHERE id = test_id;
--   DELETE FROM auth.users WHERE id = test_id;
--   RAISE NOTICE 'handle_new_user trigger PASS';
-- END $$;
