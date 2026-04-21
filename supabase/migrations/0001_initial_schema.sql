create extension if not exists "pgcrypto";

create table if not exists public.job_definitions (
  id text primary key,
  name text not null,
  tier integer not null check (tier in (1, 2, 3)),
  category text not null check (category in ('Sword', 'Magic', 'Bow', 'Thief', 'Trade', 'Heal')),
  sprite_url text not null,
  css_filter text not null default '',
  required_job_level integer not null default 10,
  evolved_from text null,
  base_stats jsonb not null,
  stat_multipliers jsonb not null default '{"hp": 1, "atk": 1, "def": 1, "rec": 1}'::jsonb,
  skills jsonb not null default '[]'::jsonb
);

create table if not exists public.unit_definitions (
  id text primary key,
  name text not null,
  title text not null,
  element text not null check (element in ('Fire', 'Water', 'Earth', 'Light', 'Dark')),
  rarity integer not null,
  max_level integer not null,
  job_id text not null references public.job_definitions (id),
  max_job_level integer not null default 50,
  cost integer not null,
  base_stats jsonb not null,
  sprite_url text not null,
  css_filter text not null default '',
  skills jsonb not null default '[]'::jsonb
);

create table if not exists public.item_definitions (
  id text primary key,
  name text not null,
  type text not null check (type in ('Weapon', 'Armor', 'Accessory')),
  rarity integer not null,
  description text not null,
  stats jsonb not null,
  sprite jsonb not null,
  effects jsonb not null default '[]'::jsonb
);

create table if not exists public.quest_definitions (
  id text primary key,
  world_id text not null,
  stage integer not null,
  name text not null,
  energy_cost integer not null,
  difficulty text not null,
  enemy_ids jsonb not null default '[]'::jsonb,
  rewards_preview jsonb not null default '[]'::jsonb
);

create table if not exists public.summon_banners (
  id text primary key,
  name text not null,
  cost integer not null,
  currency text not null,
  featured_unit_ids jsonb not null default '[]'::jsonb,
  description text not null,
  active boolean not null default false
);

create table if not exists public.player_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Summoner',
  level integer not null default 1,
  energy_current integer not null default 20,
  energy_max integer not null default 20,
  energy_recover_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.player_currencies (
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  code text not null,
  amount integer not null default 0,
  primary key (player_id, code)
);

create table if not exists public.player_units (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  unit_id text not null references public.unit_definitions (id),
  level integer not null default 1,
  exp integer not null default 0,
  job_id text not null references public.job_definitions (id),
  job_level integer not null default 1,
  job_exp integer not null default 0,
  locked boolean not null default false,
  equipment jsonb not null default '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb
);

create table if not exists public.player_items (
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  item_id text not null references public.item_definitions (id),
  quantity integer not null default 0,
  primary key (player_id, item_id)
);

alter table public.player_profiles enable row level security;
alter table public.player_currencies enable row level security;
alter table public.player_units enable row level security;
alter table public.player_items enable row level security;

create policy "players read own profile" on public.player_profiles for select using (auth.uid() = id);
create policy "players update own profile" on public.player_profiles for update using (auth.uid() = id);
create policy "players read own currencies" on public.player_currencies for select using (auth.uid() = player_id);
create policy "players read own units" on public.player_units for select using (auth.uid() = player_id);
create policy "players read own items" on public.player_items for select using (auth.uid() = player_id);
