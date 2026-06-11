# WorkPulse HRMS

Production-grade employee attendance and HR management platform with an Android mobile app and web admin panel.

**Developed by Abdul Manan**

## Project Structure

```
employee-attendance-system/
├── mobile-app/     # React Native (Expo) — employee mobile app
├── admin-panel/    # Next.js admin dashboard
├── database/       # Supabase migrations and local dev config
└── docs/           # Project documentation
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo, TypeScript |
| Admin | Next.js, TypeScript, Tailwind CSS, ShadCN UI |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Database | PostgreSQL via Supabase |

## Prerequisites

- Node.js 20 LTS or later
- npm 10+
- Android Studio (for Android emulator) or a physical Android device with Expo Go
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for database work)

## Quick Start

### 1. Install dependencies

```bash
cd mobile-app && npm install
cd ../admin-panel && npm install
```

### 2. Configure environment

Copy environment templates and fill in your Supabase credentials:

```bash
cp .env.example mobile-app/.env
cp .env.example admin-panel/.env.local
```

### 3. Run the apps

```bash
# Mobile (Expo)
npm run mobile

# Admin panel
npm run admin
```

## Scripts (root)

| Command | Description |
|---------|-------------|
| `npm run mobile` | Start Expo dev server |
| `npm run mobile:android` | Start Expo and open Android |
| `npm run admin` | Start Next.js dev server |
| `npm run admin:build` | Production build for admin panel |
| `npm run typecheck` | TypeScript check for both apps |
| `npm run lint` | ESLint for admin panel |

## Documentation

- [Mobile App](./mobile-app/README.md)
- [Admin Panel](./admin-panel/README.md)
- [Database](./database/README.md)

## Developer

**Abdul Manan** — architect and developer of WorkPulse HRMS.

## Copyright

© 2026 WorkPulse HRMS  
Developed by Abdul Manan  
All Rights Reserved.

## License

This project is licensed under the [MIT License](./LICENSE).

Copyright (c) 2026 Abdul Manan
