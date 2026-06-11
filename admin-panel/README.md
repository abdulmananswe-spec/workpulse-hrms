# Admin Panel

Next.js admin dashboard with TypeScript, Tailwind CSS v4, and ShadCN UI.

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting |

## Project Structure

```
admin-panel/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/
│   │   └── ui/           # ShadCN UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   ├── supabase/     # Browser and server Supabase clients
│   │   └── utils.ts      # ShadCN cn() utility
│   └── types/            # TypeScript types (incl. Supabase DB types)
├── components.json       # ShadCN configuration
└── public/               # Static assets
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `NEXT_PUBLIC_APP_URL` | Admin panel base URL |

## Adding ShadCN Components

```bash
npx shadcn@latest add card table dialog form
```

## Supabase Clients

- **Browser:** `src/lib/supabase/client.ts` — use in Client Components
- **Server:** `src/lib/supabase/server.ts` — use in Server Components and Route Handlers
