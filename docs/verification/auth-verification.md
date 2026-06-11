# Phase 3.5 — Authentication Verification Guide

## Quick Verify (after users exist)

```bash
npm run verify:auth
```

---

## STEP 1 — Create Test Users (REQUIRED if missing)

Live verification confirmed **both users are missing** from the remote Supabase project. The schema migration was applied, but `seed.sql` was never run.

### Option A — SQL Editor (recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **SQL Editor** → **New query**
3. Paste and run: `database/scripts/create-test-users.sql`
4. Confirm output shows both profiles with correct roles

### Option B — Supabase Dashboard (manual)

Create each user via **Authentication → Users → Add user**:

| Field | Admin | Employee |
|-------|-------|----------|
| Email | admin@company.com | employee@company.com |
| Password | Password123! | Password123! |
| Auto Confirm | Yes | Yes |
| User Metadata | `{"full_name":"System Admin","role":"admin"}` | `{"full_name":"Test Employee","role":"employee"}` |

Then run role fix SQL if profile role is wrong:

```sql
UPDATE public.profiles SET role = 'admin', employee_code = 'ADM001'
WHERE email = 'admin@company.com';

UPDATE public.profiles SET role = 'employee', employee_code = 'EMP001'
WHERE email = 'employee@company.com';
```

---

## STEP 2 — Verify Trigger

Run `database/scripts/verify-trigger.sql` in SQL Editor.

The `handle_new_user()` trigger fires **after INSERT on auth.users** and creates a matching `profiles` row. The create-test-users script also upserts profiles as a safety net.

---

## STEP 3 — Apply RLS Migration (if check-in fails)

```bash
cd database
supabase db push
```

Ensures migration `20250608140000_attendance_employee_policies.sql` is applied.

---

## Expected Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | Password123! | admin |
| employee@company.com | Password123! | employee |
