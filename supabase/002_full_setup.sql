-- FULL SETUP: Complete database schema and seed data
-- Run this AFTER 001_reset.sql

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================
-- JOB DEFINITIONS
-- ============================================
create table public.job_definitions (
  id text primary key,
  name text not null,
  tier text not null check (tier in ('1', '2', '3')),
  category text not null check (category in ('Sword', 'Magic', 'Bow', 'Thief', 'Trade', 'Heal')),
  sprite_url text,
  css_filter text,
  required_job_level integer not null default 10,
  evolved_from text null,
  base_stats jsonb not null,
  stat_multipliers jsonb not null default '{"hp": 1, "atk": 1, "def": 1, "rec": 1}'::jsonb,
  skills jsonb not null default '[]'::jsonb
);

-- ============================================
-- UNIT DEFINITIONS
-- ============================================
create table public.unit_definitions (
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
  sprite_url text,
  css_filter text,
  skills jsonb not null default '[]'::jsonb
);

-- ============================================
-- ITEM DEFINITIONS
-- ============================================
create table public.item_definitions (
  id text primary key,
  name text not null,
  type text not null check (type in ('Weapon', 'Armor', 'Accessory')),
  rarity integer not null,
  description text not null,
  stats jsonb not null,
  sprite jsonb not null,
  effects jsonb not null default '[]'::jsonb
);

-- ============================================
-- QUEST DEFINITIONS
-- ============================================
create table public.quest_definitions (
  id text primary key,
  world_id text not null,
  stage integer not null,
  name text not null,
  energy_cost integer not null,
  difficulty text not null,
  enemy_ids jsonb not null default '[]'::jsonb,
  rewards_preview jsonb not null default '[]'::jsonb
);

-- ============================================
-- SUMMON BANNERS
-- ============================================
create table public.summon_banners (
  id text primary key,
  name text not null,
  cost integer not null,
  currency text not null,
  featured_unit_ids jsonb not null default '[]'::jsonb,
  description text not null,
  active boolean not null default false
);

-- ============================================
-- ENEMY DEFINITIONS
-- ============================================
create table public.enemy_definitions (
  id text primary key,
  name text not null,
  title text,
  element text not null check (element in ('Fire', 'Water', 'Earth', 'Light', 'Dark')),
  rarity integer not null default 1,
  max_level integer not null default 50,
  base_stats jsonb not null,
  sprite_url text,
  css_filter text,
  skills jsonb not null default '[]'::jsonb,
  ai_type text not null default 'aggressive' check (ai_type in ('aggressive', 'defensive', 'balanced', 'boss')),
  exp_reward integer not null default 10,
  zel_reward integer not null default 50,
  item_drops jsonb not null default '[]'::jsonb
);

create index idx_enemy_definitions_element on public.enemy_definitions (element);
create index idx_enemy_definitions_rarity on public.enemy_definitions (rarity desc);

-- ============================================
-- PLAYER TABLES
-- ============================================
create table public.player_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Summoner',
  level integer not null default 1,
  energy_current integer not null default 20,
  energy_max integer not null default 20,
  energy_recover_at timestamptz null,
  created_at timestamptz not null default now()
);

create table public.player_currencies (
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  code text not null,
  amount integer not null default 0,
  primary key (player_id, code)
);

create table public.player_units (
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

create table public.player_items (
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  item_id text not null references public.item_definitions (id),
  quantity integer not null default 0,
  primary key (player_id, item_id)
);

-- ============================================
-- PLAYER QUEST PROGRESS
-- ============================================
create table public.player_quest_progress (
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  quest_id text not null references public.quest_definitions (id) on delete cascade,
  completed boolean not null default false,
  attempts integer not null default 0,
  best_difficulty text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (player_id, quest_id)
);

create or replace function public.update_quest_progress_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_player_quest_progress_timestamp
before update on public.player_quest_progress
for each row execute function public.update_quest_progress_timestamp();

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.player_profiles enable row level security;
alter table public.player_currencies enable row level security;
alter table public.player_units enable row level security;
alter table public.player_items enable row level security;
alter table public.enemy_definitions enable row level security;
alter table public.player_quest_progress enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.job_definitions to anon, authenticated;
grant select on public.unit_definitions to anon, authenticated;
grant select on public.item_definitions to anon, authenticated;
grant select on public.quest_definitions to anon, authenticated;
grant select on public.summon_banners to anon, authenticated;
grant select on public.enemy_definitions to anon, authenticated;

grant select, insert, update on public.player_profiles to authenticated;
grant select, insert, update on public.player_currencies to authenticated;
grant select, insert, update on public.player_units to authenticated;
grant select, insert, update on public.player_items to authenticated;

create policy "players read own profile" on public.player_profiles for select using (auth.uid() = id);
create policy "players update own profile" on public.player_profiles for update using (auth.uid() = id);
create policy "players insert own profile" on public.player_profiles for insert with check (auth.uid() = id);

create policy "players read own currencies" on public.player_currencies for select using (auth.uid() = player_id);
create policy "players insert own currencies" on public.player_currencies for insert with check (auth.uid() = player_id);
create policy "players update own currencies" on public.player_currencies for update using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "players read own units" on public.player_units for select using (auth.uid() = player_id);
create policy "players insert own units" on public.player_units for insert with check (auth.uid() = player_id);
create policy "players update own units" on public.player_units for update using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "players read own items" on public.player_items for select using (auth.uid() = player_id);
create policy "players insert own items" on public.player_items for insert with check (auth.uid() = player_id);
create policy "players update own items" on public.player_items for update using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "anyone read enemies" on public.enemy_definitions for select using (true);

create policy "players manage own quest progress" on public.player_quest_progress for all using (auth.uid() = player_id);

-- ============================================
-- AUTO-CREATE PLAYER TRIGGER
-- ============================================
create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_profiles (id, display_name, level, energy_current, energy_max, energy_recover_at)
  values (new.id, 'Summoner', 1, 20, 20, null)
  on conflict (id) do nothing;

  insert into public.player_currencies (player_id, code, amount)
  values
    (new.id, 'gems', 25),
    (new.id, 'zel', 6420),
    (new.id, 'karma', 1606)
  on conflict (player_id, code) do nothing;

  insert into public.player_units (id, player_id, unit_id, level, exp, job_id, job_level, job_exp, locked, equipment)
  values
    (gen_random_uuid(), new.id, 'u_sergio', 1, 0, 'job_swordman', 1, 0, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_vargas', 12, 120, 'job_swordman', 5, 50, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_lance', 25, 800, 'job_thief', 10, 200, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_magress', 30, 4500, 'job_knight', 15, 1000, true, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb)
  on conflict do nothing;

  insert into public.player_items (player_id, item_id, quantity)
  values
    (new.id, 'w_brave_sword', 1),
    (new.id, 'w_flame_dagger', 1),
    (new.id, 'a_knight_shield', 1),
    (new.id, 'a_aura_plate', 1),
    (new.id, 'ac_hero_ring', 1),
    (new.id, 'ac_recovery_amulet', 2)
  on conflict (player_id, item_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_player();

-- ============================================
-- SEED DATA: JOBS
-- ============================================
insert into public.job_definitions (id, name, tier, category, sprite_url, css_filter, required_job_level, evolved_from, base_stats, stat_multipliers, skills) values
('job_swordman', 'Swordman', '1', 'Sword', '/assets/sprites/characters/1job/swordman_.png', '', 10, null, '{"hp":200,"atk":20,"def":15,"rec":5}', '{"hp":1.2,"atk":1.1,"def":1.0,"rec":0.8}', '[]'),
('job_thief', 'Thief', '1', 'Thief', '/assets/sprites/characters/1job/thief_.png', '', 10, null, '{"hp":150,"atk":25,"def":8,"rec":10}', '{"hp":0.9,"atk":1.3,"def":0.7,"rec":1.0}', '[]'),
('job_mage', 'Mage', '1', 'Magic', '/assets/sprites/characters/1job/mage_.png', '', 10, null, '{"hp":120,"atk":30,"def":5,"rec":25}', '{"hp":0.8,"atk":1.4,"def":0.5,"rec":1.3}', '[]'),
('job_acolyte', 'Acolyte', '1', 'Heal', '/assets/sprites/characters/1job/acolyte_.png', '', 10, null, '{"hp":140,"atk":10,"def":10,"rec":30}', '{"hp":1.0,"atk":0.7,"def":0.8,"rec":1.5}', '[]'),
('job_archer', 'Archer', '1', 'Bow', '/assets/sprites/characters/1job/archer_.png', '', 10, null, '{"hp":160,"atk":28,"def":8,"rec":8}', '{"hp":0.9,"atk":1.3,"def":0.6,"rec":0.9}', '[]'),
('job_merchant', 'Merchant', '1', 'Trade', '/assets/sprites/characters/1job/merchant_.png', '', 10, null, '{"hp":180,"atk":15,"def":12,"rec":12}', '{"hp":1.1,"atk":0.9,"def":1.0,"rec":1.0}', '[]'),
('job_knight', 'Knight', '2', 'Sword', '/assets/sprites/characters/2job/knight_.png', '', 10, 'job_swordman', '{"hp":350,"atk":35,"def":25,"rec":10}', '{"hp":1.4,"atk":1.3,"def":1.2,"rec":0.8}', '[]'),
('job_assassin', 'Assassin', '2', 'Thief', '/assets/sprites/characters/2job/assasin_.png', '', 10, 'job_thief', '{"hp":250,"atk":45,"def":12,"rec":18}', '{"hp":1.0,"atk":1.6,"def":0.7,"rec":1.1}', '[]'),
('job_wizard', 'Wizard', '2', 'Magic', '/assets/sprites/characters/2job/wizard_.png', '', 10, 'job_mage', '{"hp":200,"atk":55,"def":8,"rec":40}', '{"hp":0.8,"atk":1.8,"def":0.5,"rec":1.5}', '[]'),
('job_priest', 'Priest', '2', 'Heal', '/assets/sprites/characters/2job/priest_.png', '', 10, 'job_acolyte', '{"hp":230,"atk":15,"def":15,"rec":50}', '{"hp":1.1,"atk":0.7,"def":0.9,"rec":1.8}', '[]'),
('job_blacksmith', 'Blacksmith', '2', 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', '', 10, 'job_merchant', '{"hp":300,"atk":25,"def":20,"rec":20}', '{"hp":1.3,"atk":1.1,"def":1.2,"rec":1.1}', '[]')
on conflict (id) do nothing;

-- ============================================
-- SEED DATA: UNITS
-- ============================================
insert into public.unit_definitions (id, name, title, element, rarity, max_level, job_id, max_job_level, cost, base_stats, skills) values
('u_sergio', 'Knight Sergio', 'ROGUE TIDE', 'Water', 3, 40, 'job_swordman', 50, 5, '{"hp":2050,"atk":600,"def":600,"rec":580}', '[{"id":"ls_sergio","type":"LEADER SKILL","title":"Tidal Command","description":"10% boost to Atk Power of Water units","iconType":"Flag"},{"id":"bb_sergio","type":"BRAVE BURST","title":"Aqua Slash","description":"5 combo Water attack on a single enemy","cost":18,"iconType":"Sparkles"}]'),
('u_vargas', 'Vargas', 'EMBER VANGUARD', 'Fire', 4, 40, 'job_swordman', 50, 8, '{"hp":2400,"atk":850,"def":550,"rec":400}', '[{"id":"ls_vargas","type":"LEADER SKILL","title":"Flame March","description":"15% boost to Atk Power of Fire units","iconType":"Flag"}]'),
('u_lance', 'Lance', 'STONE PIKEMAN', 'Earth', 3, 40, 'job_thief', 50, 6, '{"hp":3100,"atk":550,"def":800,"rec":350}', '[{"id":"ls_lance","type":"LEADER SKILL","title":"Earthen Wall","description":"10% boost to HP of Earth units","iconType":"Flag"}]'),
('u_magress', 'Magress', 'SHADOW AEGIS', 'Dark', 5, 60, 'job_knight', 50, 12, '{"hp":4200,"atk":900,"def":950,"rec":200}', '[{"id":"ls_magress","type":"LEADER SKILL","title":"Dark Aegis","description":"15% boost to Def of Dark units","iconType":"Flag"},{"id":"ex_magress","type":"EXTRA SKILL","title":"Shadow Veil","description":"20% boost to all parameters","iconType":"Sword"}]'),
('u_elys', 'Elys', 'SOLAR SAINT', 'Light', 6, 80, 'job_knight', 50, 15, '{"hp":4500,"atk":1200,"def":800,"rec":600}', '[{"id":"ls_elys","type":"LEADER SKILL","title":"Solar Blessing","description":"25% boost to Atk and 10% boost to HP of Light units","iconType":"Flag"}]')
on conflict (id) do nothing;

-- ============================================
-- SEED DATA: ITEMS
-- ============================================
insert into public.item_definitions (id, name, type, rarity, description, stats, sprite, effects) values
('w_brave_sword', 'Brave Sword', 'Weapon', 3, 'A standard sword assigned to brave warriors.', '{"hp":0,"atk":120,"def":0,"rec":0}', '{"col":2,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["10% chance to ignore enemy DEF"]'),
('w_flame_dagger', 'Flame Dagger', 'Weapon', 3, 'A dagger imbued with fire.', '{"hp":0,"atk":100,"def":0,"rec":0}', '{"col":3,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["5% chance to burn enemy"]'),
('a_knight_shield', 'Knight Shield', 'Armor', 3, 'A sturdy iron shield.', '{"hp":200,"atk":0,"def":150,"rec":0}', '{"col":4,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["Reduces damage taken by 5%"]'),
('a_aura_plate', 'Aura Plate', 'Armor', 4, 'Armor with protective aura.', '{"hp":300,"atk":0,"def":200,"rec":50}', '{"col":5,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["10% damage reduction"]'),
('ac_hero_ring', 'Hero Ring', 'Accessory', 3, 'A ring of brave heroes.', '{"hp":50,"atk":30,"def":30,"rec":30}', '{"col":6,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["5% all stats"]'),
('ac_recovery_amulet', 'Recovery Amulet', 'Accessory', 2, 'Amulet that helps recovery.', '{"hp":30,"atk":0,"def":0,"rec":50}', '{"col":7,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["10% REC boost"]')
on conflict (id) do nothing;

-- ============================================
-- SEED DATA: ENEMIES
-- ============================================
insert into public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) values
-- Fire enemies
('enemy_salamander', 'Salamander', 'Flame Lizard', 'Fire', 2, 30, '{"hp": 800, "atk": 85, "def": 45, "rec": 35}', null, 'sepia(0.5) saturate(2) hue-rotate(-50deg)', 'aggressive', 15, 80, '[{"item_id": "item_fire_essence", "chance": 0.3, "quantity": 1}]'),
('enemy_ifrit', 'Ifrit', 'Flame Spirit', 'Fire', 4, 50, '{"hp": 1800, "atk": 160, "def": 80, "rec": 55}', null, 'sepia(0.5) saturate(2.5) hue-rotate(-50deg) brightness(1.2)', 'aggressive', 35, 180, '[{"item_id": "item_fire_essence", "chance": 0.5, "quantity": 2}]'),
-- Water enemies
('enemy_sea_serpent', 'Sea Serpent', 'Ocean Serpent', 'Water', 2, 30, '{"hp": 900, "atk": 65, "def": 55, "rec": 50}', null, 'sepia(0) hue-rotate(0deg)', 'balanced', 15, 85, '[{"item_id": "item_water_essence", "chance": 0.3, "quantity": 1}]'),
('enemy_siren', 'Siren', 'Ocean Song', 'Water', 4, 50, '{"hp": 1600, "atk": 140, "def": 95, "rec": 90}', null, 'sepia(0) hue-rotate(0deg) brightness(1.1)', 'defensive', 35, 175, '[{"item_id": "item_water_essence", "chance": 0.5, "quantity": 2}]'),
-- Earth enemies
('enemy_golem', 'Stone Golem', 'Earth Guardian', 'Earth', 3, 40, '{"hp": 1500, "atk": 70, "def": 90, "rec": 30}', null, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'defensive', 25, 120, '[{"item_id": "item_earth_essence", "chance": 0.35, "quantity": 1}]'),
('enemy_titan', 'Titan', 'Earth Giant', 'Earth', 5, 60, '{"hp": 3000, "atk": 140, "def": 160, "rec": 50}', null, 'sepia(0.5) saturate(2) hue-rotate(80deg) brightness(1.3)', 'boss', 50, 250, '[{"item_id": "item_earth_essence", "chance": 0.7, "quantity": 3}]'),
-- Light enemies
('enemy_spark', 'Spark Sprite', 'Light Wisp', 'Light', 2, 30, '{"hp": 600, "atk": 95, "def": 35, "rec": 70}', null, 'sepia(0.1) saturate(1.2) hue-rotate(10deg) brightness(1.2)', 'aggressive', 12, 70, '[{"item_id": "item_light_essence", "chance": 0.25, "quantity": 1}]'),
('enemy_angel', 'Fallen Angel', 'Dark Light', 'Light', 4, 50, '{"hp": 1400, "atk": 180, "def": 70, "rec": 100}', null, 'sepia(0.1) saturate(1.5) hue-rotate(10deg) brightness(1.4)', 'balanced', 30, 160, '[{"item_id": "item_light_essence", "chance": 0.45, "quantity": 2}]'),
-- Dark enemies
('enemy_shadow', 'Shadow Beast', 'Dark Hunter', 'Dark', 2, 30, '{"hp": 700, "atk": 100, "def": 40, "rec": 40}', null, 'sepia(0.8) hue-rotate(220deg) saturate(0.5)', 'aggressive', 15, 75, '[{"item_id": "item_dark_essence", "chance": 0.3, "quantity": 1}]'),
('enemy_demon', 'Lesser Demon', 'Hell Spawn', 'Dark', 5, 60, '{"hp": 2200, "atk": 200, "def": 100, "rec": 65}', null, 'sepia(0.8) hue-rotate(220deg) saturate(0.8) brightness(0.9)', 'boss', 45, 220, '[{"item_id": "item_dark_essence", "chance": 0.6, "quantity": 3}]')
on conflict (id) do nothing;

-- ============================================
-- SEED DATA: QUESTS
-- ============================================
insert into public.quest_definitions (id, world_id, stage, name, energy_cost, difficulty, enemy_ids, rewards_preview) values
('quest_tutorial_1', 'prontera', 1, 'First Steps', 5, 'Normal', '["enemy_salamander"]', '["15 EXP", "80 Zel"]'),
('quest_tutorial_2', 'prontera', 2, 'Gather the Herbs', 8, 'Normal', '["enemy_salamander", "enemy_sea_serpent"]', '["30 EXP", "150 Zel"]'),
('quest_tutorial_3', 'prontera', 3, 'Slay the Threat', 10, 'Normal', '["enemy_golem"]', '["50 EXP", "200 Zel"]'),
('quest_tutorial_4', 'prontera', 4, 'Prove Your Worth', 12, 'Hard', '["enemy_ifrit", "enemy_spark"]', '["80 EXP", "300 Zel"]'),
('quest_tutorial_5', 'prontera', 5, 'Clear the Dungeon', 15, 'Hard', '["enemy_golem", "enemy_ifrit", "enemy_shadow"]', '["120 EXP", "500 Zel"]'),
('quest_tutorial_6', 'prontera', 6, 'Face the Guardian', 20, 'Heroic', '["enemy_titan"]', '["200 EXP", "800 Zel", "3★ Unit"]')
on conflict (id) do nothing;

-- ============================================
-- SEED DATA: BANNERS
-- ============================================
insert into public.summon_banners (id, name, cost, currency, featured_unit_ids, description, active) values
('banner_origin_light', 'Origin of Light', 5, 'gems', '["u_elys","u_magress"]', 'Light and Dark featured rate-up banner with a guaranteed 4* or higher on multi.', true)
on conflict (id) do nothing;