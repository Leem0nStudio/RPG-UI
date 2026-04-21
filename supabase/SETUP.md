# Supabase Setup

This project is ready to use Supabase for remote content and automatic player bootstrap on first sign-in.

## 1. Create the project

- Create a new Supabase project
- Copy:
  - `Project URL`
  - `anon public key`

Use them in:

- local `.env.local`
- Vercel project environment variables

## 2. Enable anonymous auth

In the Supabase dashboard:

- go to `Authentication`
- open `Providers`
- enable `Anonymous Sign-Ins`

The frontend uses anonymous auth so the first deploy can create a player profile without requiring a login screen yet.

## 3. Run SQL

Apply these files in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/0002_auth_bootstrap.sql`

You can run them in the SQL editor or through the Supabase CLI.

## 4. What gets created automatically

On first anonymous sign-in, the trigger in `0002_auth_bootstrap.sql` creates:

- `player_profiles`
- starter currencies
- starter units
- starter items

That means the deployed app can load:

- remote content from Supabase
- a real player profile
- a real starter roster
- a real starter inventory

without custom admin setup per player.

## 5. Vercel environment variables

Set these in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_URL=
GEMINI_API_KEY=
```

## 6. Current runtime behavior

- if Supabase env vars are present, the app loads content from Supabase
- if no session exists, it attempts anonymous auth
- if remote bootstrap fails, it falls back to local seed data so the UI still works

## 7. Recommended next backend steps

- add `player_quest_progress`
- add `player_mission_progress`
- move summon/fusion into edge functions
- add server-authoritative reward resolution
