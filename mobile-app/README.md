# Mobile App (Android)

React Native employee app built with Expo and TypeScript. **Android only.**

## Prerequisites

- Node.js 20+
- Android Studio with an emulator, or a physical Android device with [Expo Go](https://expo.dev/go)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start Expo and open on Android |
| `npm run typecheck` | Run TypeScript without emitting |

## Project Structure

```
mobile-app/
├── src/
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Supabase client and utilities
│   ├── services/     # API / data layer
│   ├── stores/       # Zustand stores (future)
│   └── types/        # TypeScript types (incl. Supabase DB types)
├── assets/           # Images, icons, fonts
├── App.tsx           # Root component
└── app.json          # Expo configuration
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |

## Run on Android

```bash
npm run android
```

Or start the dev server and scan the QR code with Expo Go on your Android device:

```bash
npm start
```
