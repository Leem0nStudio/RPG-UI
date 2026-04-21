# RPG UI

Mobile-first RPG web client inspired by Brave Frontier, now restructured as a data-driven foundation with `Next.js`, `Supabase`, `Zustand`, and a starter `Phaser` runtime.

## Current state

This repository now includes the first architectural slice for the real game:

- `backend-contracts/`: shared gameplay and content schemas with `zod`
- `content/`: local seed content used as fallback while Supabase is not configured
- `core/`: pure simulation modules for elemental rules, stats, stamina, and battle previews
- `services/`: Supabase-aware content and bootstrap loading
- `store/`: app state with Zustand
- `game-runtime/`: client-only Phaser battle runtime scaffold
- `supabase/`: initial SQL migration and seed scripts

The app still uses the existing UI screens, but they now sit on top of a real bootstrap path instead of isolated view-local mock state.

## Stack

- `Next.js` for shell, routing, and DOM UI
- `Supabase` for backend, auth, content, and player persistence
- `Zustand` for client state
- `Phaser` for runtime playfield integration
- `TypeScript` for shared contracts and simulation modules

## Environment

Create `.env.local` from `.env.example` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
APP_URL=http://localhost:3000
```

If Supabase env vars are missing, the app falls back to local seeded content so the UI can still render.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Configure `.env.local`

3. Start the app:

```bash
npm run dev
```

## Deploy on Vercel

This repo is ready to be imported directly into Vercel as a `Next.js` project.

Configure these environment variables in the Vercel dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GEMINI_API_KEY
APP_URL
```

Recommended:

- set `APP_URL` to your final Vercel domain
- use the same Supabase project across Preview and Production only if that matches your content workflow
- keep service-role keys out of the browser environment

## Supabase bootstrap

Initial database files live in:

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0002_auth_bootstrap.sql`
- `supabase/seed.sql`

Apply them with your preferred Supabase workflow:

- Supabase CLI
- SQL editor in the dashboard
- migration runner in your deployment pipeline

Setup guide:

- `supabase/SETUP.md`

## Architecture notes

- Simulation rules live outside the renderer.
- Phaser is client-only and currently used as a battle runtime scaffold.
- React/DOM remains responsible for text-heavy HUD and management screens.
- The current implementation is an architectural base, not the full game loop yet.

## Next implementation targets

- authenticated Supabase bootstrap
- remote content loading for quests, banners, and units
- server-validated summon and reward flows
- full quest and battle runtime integration
- mobile-first hub and squad preparation flows
