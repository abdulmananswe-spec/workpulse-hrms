# Architecture Overview

## System Components

```
┌─────────────────┐     ┌─────────────────┐
│   mobile-app    │     │   admin-panel   │
│  Expo / RN      │     │   Next.js 15+   │
│  (Android)      │     │   ShadCN UI     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Supabase  │
              │  Auth + DB  │
              └─────────────┘
```

## Monorepo Layout

This repository uses a **multi-package layout** (not a pnpm/turbo workspace). Each app is independently installable:

- `mobile-app/` — Employee-facing Android application
- `admin-panel/` — Internal admin web dashboard
- `database/` — Schema migrations and Supabase CLI config
- `docs/` — Architecture and process documentation

## Shared Conventions

- **TypeScript** strict mode in both apps
- **Supabase** anon key in clients; RLS enforces access at the database layer
- **Environment variables** prefixed with `EXPO_PUBLIC_` (mobile) or `NEXT_PUBLIC_` (admin)
- **Database types** generated from Supabase CLI and copied to each app's `src/types/database.ts`

## Next Implementation Steps

1. Auth flows (Supabase Auth)
2. Core tables and RLS policies
3. Attendance RPC functions
4. Feature modules per development roadmap
