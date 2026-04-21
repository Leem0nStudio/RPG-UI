# Agents

## Dev commands

```
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
npm run clean  # next clean (removes .next/)
```

No `typecheck` script — TypeScript is enforced during builds (`next.config.ts: typescript.ignoreBuildErrors: false`).

## Architecture

```
app/page.tsx              -- Main entry, bootstraps game, routes views
store/game-store.ts       -- Zustand store, owns all client state
services/content-service.ts -- Loads content (Supabase -> local fallback)
services/player-service.ts -- Loads player profile (Supabase -> local fallback)
core/                     -- Pure simulation (stats, elemental, battle, stamina)
backend-contracts/game.ts -- Zod schemas, shared type definitions
content/game-content.ts  -- Local seed data (used when Supabase unavailable)
game-runtime/             -- Phaser runtime (client-only, dynamic import)
```

The `core/` modules are the authoritative game rules. Do not guess battle formulas or stat scaling — read them from `core/stats.ts`, `core/battle.ts`, `core/elemental.ts`.

## Data flow

1. `bootstrapGame()` in the store calls `loadGameContent()` and `loadPlayerBootstrap()` in parallel.
2. Both services fall back to local `bootstrapData` from `content/game-content.ts` if Supabase is unavailable or queries fail.
3. The Supabase client (`services/supabase/client.ts`) returns `null` if env vars are missing — this triggers the fallback silently.

## Supabase schema order

Apply migrations in this order:
1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/0002_auth_bootstrap.sql`

Anonymous sign-in is enabled. On first sign-in, the trigger auto-creates player profile, currencies, units, and items.

## Phaser

Phaser is loaded dynamically inside `useEffect` — never in a server component. Dynamic import path: `@/game-runtime/phaser/BattlePreviewScene`.

## HMR

HMR can be disabled via `DISABLE_HMR=true` env var. When set, webpack `watchOptions` ignores all files.

## CSS

Tailwind CSS v4 with `@tailwindcss/postcss` plugin (v4 uses `@import "tailwindcss"` in CSS, not a JS config file). Do not edit `tailwind.config.js` — it does not exist.

## Key conventions

- All components use `"use client"` directive.
- Stats: `scaleBaseStats()` uses different growth curves per stat (HP: 0.85, ATK: 0.82, DEF: 0.78, REC: 0.7).
- Damage formula: `max(1, atk - def * 0.55) * elementMultiplier`.
- No test framework is configured. Do not write tests unless one is added.