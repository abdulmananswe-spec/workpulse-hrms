# Database

Supabase PostgreSQL schema, migrations, RLS policies, and seed data.

## Schema Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to `auth.users` |
| `office_locations` | Office geofence locations |
| `attendance_records` | Employee check-in/out records |
| `leave_requests` | Leave applications |
| `manual_attendance_requests` | Manual attendance corrections |

## Enums

| Enum | Values |
|------|--------|
| `app_role` | `admin`, `employee` |
| `attendance_status` | `present`, `absent`, `late` |
| `request_status` | `pending`, `approved`, `rejected` |

## Apply Migrations (Remote)

```bash
cd database
supabase login
supabase link --project-ref ihtrttpqglviwkbyrrav
supabase db push
```

## Local Development

```bash
cd database
supabase start
supabase db reset   # applies migrations + seed.sql
```

## Seed Test Users

| Email | Role | Password |
|-------|------|----------|
| admin@company.com | admin | Password123! |
| employee@company.com | employee | Password123! |

Sample office: **Head Office**

> Seed users are created via `supabase/seed.sql` during `supabase db reset` (local). For remote projects, run migrations first, then create users via Supabase Dashboard or run the seed SQL in the SQL editor.

## Generate TypeScript Types

```bash
cd database
supabase gen types typescript --linked > ../admin-panel/src/types/database.ts
supabase gen types typescript --linked > ../mobile-app/src/types/database.ts
```

## Security

- RLS is enabled on all tables.
- `is_admin()` helper enforces admin access.
- Employees can only access their own data per policy rules.
