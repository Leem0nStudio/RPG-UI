-- Enemy definitions for battle encounters
create table if not exists public.enemy_definitions (
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

-- Index for enemy lookups by element/difficulty
create index if not exists idx_enemy_definitions_element on public.enemy_definitions (element);
create index if not exists idx_enemy_definitions_rarity on public.enemy_definitions (rarity desc);

-- Player quest progress tracking
create table if not exists public.player_quest_progress (
  player_id uuid not null references public.player_profiles (id) on delete cascade,
  quest_id text not null references public.quest_definitions (id) on delete cascade,
  completed boolean not null default false,
  attempts integer not null default 0,
  best_difficulty text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (player_id, quest_id)
);

-- Trigger to update updated_at
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

-- Seed data: Common enemies for different elements
insert into public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) values
  -- Fire element enemies
  ('enemy_salamander', 'Salamander', 'Flame Lizard', 'Fire', 2, 30, '{"hp": 800, "atk": 85, "def": 45, "rec": 35}', null, 'sepia(0.5) saturate(2) hue-rotate(-50deg)', 'aggressive', 15, 80, '[{"item_id": "item_fire_essence", "chance": 0.3, "quantity": 1}]'),
  ('enemy_ifrit', 'Ifrit', 'Flame Spirit', 'Fire', 4, 50, '{"hp": 1800, "atk": 160, "def": 80, "rec": 55}', null, 'sepia(0.5) saturate(2.5) hue-rotate(-50deg) brightness(1.2)', 'aggressive', 35, 180, '[{"item_id": "item_fire_essence", "chance": 0.5, "quantity": 2}]'),
  
  -- Water element enemies
  ('enemy_sea_serpent', 'Sea Serpent', 'Ocean Serpent', 'Water', 2, 30, '{"hp": 900, "atk": 65, "def": 55, "rec": 50}', null, 'sepia(0) hue-rotate(0deg)', 'balanced', 15, 85, '[{"item_id": "item_water_essence", "chance": 0.3, "quantity": 1}]'),
  ('enemy_siren', 'Siren', 'Ocean Song', 'Water', 4, 50, '{"hp": 1600, "atk": 140, "def": 95, "rec": 90}', null, 'sepia(0) hue-rotate(0deg) brightness(1.1)', 'defensive', 35, 175, '[{"item_id": "item_water_essence", "chance": 0.5, "quantity": 2}]'),
  
  -- Earth element enemies
  ('enemy_golem', 'Stone Golem', 'Earth Guardian', 'Earth', 3, 40, '{"hp": 1500, "atk": 70, "def": 90, "rec": 30}', null, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'defensive', 25, 120, '[{"item_id": "item_earth_essence", "chance": 0.35, "quantity": 1}]'),
  ('enemy_titan', 'Titan', 'Earth Giant', 'Earth', 5, 60, '{"hp": 3000, "atk": 140, "def": 160, "rec": 50}', null, 'sepia(0.5) saturate(2) hue-rotate(80deg) brightness(1.3)', 'boss', 50, 250, '[{"item_id": "item_earth_essence", "chance": 0.7, "quantity": 3}]'),
  
  -- Light element enemies
  ('enemy_spark', 'Spark Sprite', 'Light Wisp', 'Light', 2, 30, '{"hp": 600, "atk": 95, "def": 35, "rec": 70}', null, 'sepia(0.1) saturate(1.2) hue-rotate(10deg) brightness(1.2)', 'aggressive', 12, 70, '[{"item_id": "item_light_essence", "chance": 0.25, "quantity": 1}]'),
  ('enemy_angel', 'Fallen Angel', 'Dark Light', 'Light', 4, 50, '{"hp": 1400, "atk": 180, "def": 70, "rec": 100}', null, 'sepia(0.1) saturate(1.5) hue-rotate(10deg) brightness(1.4)', 'balanced', 30, 160, '[{"item_id": "item_light_essence", "chance": 0.45, "quantity": 2}]'),
  
  -- Dark element enemies
  ('enemy_shadow', 'Shadow Beast', 'Dark Hunter', 'Dark', 2, 30, '{"hp": 700, "atk": 100, "def": 40, "rec": 40}', null, 'sepia(0.8) hue-rotate(220deg) saturate(0.5)', 'aggressive', 15, 75, '[{"item_id": "item_dark_essence", "chance": 0.3, "quantity": 1}]'),
  ('enemy_demon', 'Lesser Demon', 'Hell Spawn', 'Dark', 5, 60, '{"hp": 2200, "atk": 200, "def": 100, "rec": 65}', null, 'sepia(0.8) hue-rotate(220deg) saturate(0.8) brightness(0.9)', 'boss', 45, 220, '[{"item_id": "item_dark_essence", "chance": 0.6, "quantity": 3}]')
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  element = excluded.element,
  rarity = excluded.rarity,
  max_level = excluded.max_level,
  base_stats = excluded.base_stats,
  sprite_url = excluded.sprite_url,
  css_filter = excluded.css_filter,
  ai_type = excluded.ai_type,
  exp_reward = excluded.exp_reward,
  zel_reward = excluded.zel_reward,
  item_drops = excluded.item_drops;

-- Seed data: Tutorial quests
insert into public.quest_definitions (id, world_id, stage, name, energy_cost, difficulty, enemy_ids, rewards_preview) values
  ('quest_tutorial_1', 'prontera', 1, 'First Steps', 5, 'Normal', '["enemy_salamander"]', '["15 EXP", "80 Zel"]'),
  ('quest_tutorial_2', 'prontera', 2, 'Gather the Herbs', 8, 'Normal', '["enemy_salamander", "enemy_sea_serpent"]', '["30 EXP", "150 Zel"]'),
  ('quest_tutorial_3', 'prontera', 3, 'Slay the Threat', 10, 'Normal', '["enemy_golem"]', '["50 EXP", "200 Zel"]'),
  ('quest_tutorial_4', 'prontera', 4, 'Prove Your Worth', 12, 'Hard', '["enemy_ifrit", "enemy_spark"]', '["80 EXP", "300 Zel"]'),
  ('quest_tutorial_5', 'prontera', 5, 'Clear the Dungeon', 15, 'Hard', '["enemy_golem", "enemy_ifrit", "enemy_shadow"]', '["120 EXP", "500 Zel"]'),
  ('quest_tutorial_6', 'prontera', 6, 'Face the Guardian', 20, 'Heroic', '["enemy_titan"]', '["200 EXP", "800 Zel", "3★ Unit"]')
on conflict (id) do update set
  world_id = excluded.world_id,
  stage = excluded.stage,
  name = excluded.name,
  energy_cost = excluded.energy_cost,
  difficulty = excluded.difficulty,
  enemy_ids = excluded.enemy_ids,
  rewards_preview = excluded.rewards_preview;

-- Add RLS policies for new tables
alter table public.enemy_definitions enable row level security;
create policy "anyone read enemies" on public.enemy_definitions for select using (true);

alter table public.player_quest_progress enable row level security;
create policy "players manage own quest progress" on public.player_quest_progress for all using (auth.uid() = player_id);