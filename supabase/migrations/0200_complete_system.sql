-- ============================================
-- RPG UI COMPLETE SYSTEM MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- SECTION 1: Core Tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.job_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('0', '1', '2', '3')),
  category text NOT NULL CHECK (category IN ('Base', 'Sword', 'Magic', 'Bow', 'Thief', 'Trade', 'Heal')),
  parent_job_id text,
  sprite_url text,
  css_filter text DEFAULT '',
  required_job_level integer DEFAULT 10,
  evolved_from text,
  base_stats jsonb NOT NULL DEFAULT '{"hp":100,"atk":10,"def":10,"rec":10,"matk":10,"mdef":10,"agi":10}',
  stat_multipliers jsonb DEFAULT '{"hp":1,"atk":1,"def":1,"rec":1,"matk":1,"mdef":1,"agi":1}',
  stat_bonuses jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"rec":0,"matk":0,"mdef":0,"agi":0}',
  allowed_weapons jsonb DEFAULT '[]',
  skills_unlocked jsonb DEFAULT '[]',
  passive_effects jsonb DEFAULT '[]',
  evolution_requirements jsonb DEFAULT '{"level":20,"job_level":10,"zel_cost":500}',
  branch_options jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS public.unit_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  element text NOT NULL CHECK (element IN ('Fire', 'Water', 'Earth', 'Light', 'Dark')),
  rarity integer NOT NULL,
  max_level integer NOT NULL,
  job_id text REFERENCES public.job_definitions(id),
  max_job_level integer DEFAULT 50,
  cost integer NOT NULL,
  base_stats jsonb NOT NULL,
  sprite_url text,
  css_filter text,
  skills jsonb DEFAULT '[]',
  growth_rates jsonb DEFAULT '{"hp":0.85,"atk":0.82,"def":0.78,"rec":0.7,"matk":0.8,"mdef":0.75,"agi":0.72}',
  affinity text DEFAULT 'physical',
  trait text DEFAULT 'strong'
);

CREATE TABLE IF NOT EXISTS public.item_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Weapon', 'Armor', 'Accessory')),
  rarity integer NOT NULL,
  description text NOT NULL,
  stats jsonb NOT NULL,
  sprite jsonb NOT NULL,
  effects jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS public.quest_definitions (
  id text PRIMARY KEY,
  world_id text NOT NULL,
  stage integer NOT NULL,
  name text NOT NULL,
  energy_cost integer NOT NULL,
  difficulty text NOT NULL,
  enemy_ids jsonb DEFAULT '[]',
  rewards_preview jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS public.enemy_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  element text NOT NULL CHECK (element IN ('Fire', 'Water', 'Earth', 'Light', 'Dark', 'Neutral')),
  base_stats jsonb NOT NULL,
  skills jsonb DEFAULT '[]',
  drops jsonb DEFAULT '[]',
  exp_reward integer DEFAULT 0,
  zel_reward integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.summon_banners (
  id text PRIMARY KEY,
  name text NOT NULL,
  cost integer NOT NULL,
  currency text DEFAULT 'gems',
  featured_unit_ids jsonb DEFAULT '[]',
  description text,
  active boolean DEFAULT false
);

-- SECTION 2: Player Tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.player_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT 'Summoner',
  level integer DEFAULT 1,
  energy_current integer DEFAULT 20,
  energy_max integer DEFAULT 20,
  energy_recover_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.player_currencies (
  player_id uuid NOT NULL REFERENCES public.player_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  amount integer DEFAULT 0,
  PRIMARY KEY (player_id, code)
);

CREATE TABLE IF NOT EXISTS public.player_units (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id text NOT NULL,
  unit_id text NOT NULL,
  job_id text DEFAULT 'novice',
  level integer DEFAULT 1,
  exp integer DEFAULT 0,
  equipment jsonb DEFAULT '{"Weapon":null,"Armor":null,"Accessory":null}',
  unlocked_jobs jsonb DEFAULT '["novice"]',
  equipped_cards text[] DEFAULT '{}',
  equipped_skills text[] DEFAULT '{}',
  growth_rates jsonb,
  affinity text,
  trait text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, instance_id)
);

CREATE TABLE IF NOT EXISTS public.player_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  quantity integer DEFAULT 1,
  equipped_unit_id uuid REFERENCES public.player_units(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, item_id)
);

-- SECTION 3: Gacha System Tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.player_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  quantity integer DEFAULT 1,
  equipped_unit_id uuid REFERENCES public.player_units(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.player_weapons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weapon_id text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  equipped_unit_id uuid REFERENCES public.player_units(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.player_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  unlocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.player_job_cores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  variant_id text,
  obtained_at timestamptz DEFAULT now(),
  UNIQUE(player_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.player_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id text NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, material_id)
);

CREATE TABLE IF NOT EXISTS public.gacha_pulls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id text NOT NULL,
  rarity_pulled text NOT NULL,
  pity_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- SECTION 4: Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_job_definitions_category ON public.job_definitions(category);
CREATE INDEX IF NOT EXISTS idx_job_definitions_tier ON public.job_definitions(tier);
CREATE INDEX IF NOT EXISTS idx_job_definitions_parent ON public.job_definitions(parent_job_id);
CREATE INDEX IF NOT EXISTS idx_unit_definitions_job_id ON public.unit_definitions(job_id);
CREATE INDEX IF NOT EXISTS idx_unit_definitions_element ON public.unit_definitions(element);
CREATE INDEX IF NOT EXISTS idx_unit_definitions_rarity ON public.unit_definitions(rarity);
CREATE INDEX IF NOT EXISTS idx_quest_definitions_world ON public.quest_definitions(world_id, stage);
CREATE INDEX IF NOT EXISTS idx_player_units_player ON public.player_units(player_id);
CREATE INDEX IF NOT EXISTS idx_player_items_player ON public.player_items(player_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_player ON public.player_cards(player_id);
CREATE INDEX IF NOT EXISTS idx_player_skills_player ON public.player_skills(player_id);
CREATE INDEX IF NOT EXISTS idx_gacha_pulls_player ON public.gacha_pulls(player_id);

-- SECTION 5: Row Level Security
-- ============================================

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_job_cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gacha_pulls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view own profile" ON public.player_profiles;
CREATE POLICY "Players can view own profile" ON public.player_profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Players can manage own currencies" ON public.player_currencies;
CREATE POLICY "Players can manage own currencies" ON public.player_currencies FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players can manage own units" ON public.player_units;
CREATE POLICY "Players can manage own units" ON public.player_units FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players can manage own items" ON public.player_items;
CREATE POLICY "Players can manage own items" ON public.player_items FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own cards" ON public.player_cards;
CREATE POLICY "Players own cards" ON public.player_cards FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own weapons" ON public.player_weapons;
CREATE POLICY "Players own weapons" ON public.player_weapons FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own skills" ON public.player_skills;
CREATE POLICY "Players own skills" ON public.player_skills FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own job cores" ON public.player_job_cores;
CREATE POLICY "Players own job cores" ON public.player_job_cores FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own materials" ON public.player_materials;
CREATE POLICY "Players own materials" ON public.player_materials FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own pulls" ON public.gacha_pulls;
CREATE POLICY "Players own pulls" ON public.gacha_pulls FOR ALL USING (auth.uid() = player_id);

-- SECTION 6: Seed Jobs (if empty) - Using DO block for jsonb cast
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.job_definitions WHERE id = 'novice') THEN
    INSERT INTO public.job_definitions (id, name, tier, category, parent_job_id, sprite_url, css_filter, required_job_level, base_stats, stat_multipliers, stat_bonuses, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements, branch_options) VALUES
    ('novice', 'Novice', '0', 'Base', NULL, '/assets/sprites/novice.png', '', 1, 
     '{"hp":100,"atk":10,"def":10,"rec":10,"matk":10,"mdef":10,"agi":10}'::jsonb, 
     '{"hp":1,"atk":1,"def":1,"rec":1,"matk":1,"mdef":1,"agi":1}'::jsonb,
     '{"hp":0,"atk":0,"def":0,"rec":0,"matk":0,"mdef":0,"agi":0}'::jsonb,
     '["none"]'::jsonb, '["basic_attack"]'::jsonb, '[]'::jsonb, 
     '{"level":10,"job_level":1,"zel_cost":0}'::jsonb, 
     '["swordman","mage","archer","acolyte","thief","merchant"]'::jsonb),
    
    ('swordman', 'Swordman', '1', 'Sword', 'novice', '/assets/sprites/swordman.png', '', 10, 
     '{"hp":200,"atk":20,"def":15,"rec":5,"matk":5,"mdef":5,"agi":9}'::jsonb, 
     '{"hp":1.2,"atk":1.3,"def":1.1,"rec":0.8,"matk":0.5,"mdef":0.5,"agi":0.9}'::jsonb,
     '{"hp":20,"atk":5,"def":3,"rec":0,"matk":0,"mdef":0,"agi":0}'::jsonb,
     '["sword","blade"]'::jsonb, '["bash","magnum_break"]'::jsonb, '["sword_mastery"]'::jsonb,
     '{"level":20,"job_level":10,"zel_cost":500}'::jsonb, 
     '["knight","crusader"]'::jsonb),
    
    ('mage', 'Mage', '1', 'Magic', 'novice', '/assets/sprites/mage.png', '', 10, 
     '{"hp":120,"atk":5,"def":6,"rec":12,"matk":14,"mdef":12,"agi":7}'::jsonb, 
     '{"hp":0.8,"atk":0.5,"def":0.6,"rec":1.2,"matk":1.4,"mdef":1.2,"agi":0.7}'::jsonb,
     '{"hp":0,"atk":0,"def":0,"rec":5,"matk":8,"mdef":5,"agi":0}'::jsonb,
     '["staff","wand"]'::jsonb, '["fire_bolt","ice_bolt"]'::jsonb, '["magic_intensity"]'::jsonb,
     '{"level":20,"job_level":10,"zel_cost":500}'::jsonb, 
     '["wizard","sage"]'::jsonb),
    
    ('archer', 'Archer', '1', 'Bow', 'novice', '/assets/sprites/archer.png', '', 10, 
     '{"hp":160,"atk":24,"def":7,"rec":8,"matk":6,"mdef":6,"agi":13}'::jsonb, 
     '{"hp":0.9,"atk":1.2,"def":0.7,"rec":0.8,"matk":0.6,"mdef":0.6,"agi":1.3}'::jsonb,
     '{"hp":0,"atk":4,"def":0,"rec":0,"matk":0,"mdef":0,"agi":5}'::jsonb,
     '["bow"]'::jsonb, '["aimed_shot","double_strafe"]'::jsonb, '["sharp_eye"]'::jsonb,
     '{"level":20,"job_level":10,"zel_cost":500}'::jsonb, 
     '["hunter","bard"]'::jsonb),
    
    ('acolyte', 'Acolyte', '1', 'Heal', 'novice', '/assets/sprites/acolyte.png', '', 10, 
     '{"hp":140,"atk":7,"def":8,"rec":14,"matk":11,"mdef":12,"agi":8}'::jsonb, 
     '{"hp":1.0,"atk":0.7,"def":0.8,"rec":1.4,"matk":1.1,"mdef":1.2,"agi":0.8}'::jsonb,
     '{"hp":5,"atk":0,"def":0,"rec":8,"matk":5,"mdef":5,"agi":0}'::jsonb,
     '["mace"]'::jsonb, '["heal","holy_bolt"]'::jsonb, '["divine_protection"]'::jsonb,
     '{"level":20,"job_level":10,"zel_cost":500}'::jsonb, 
     '["priest","monk"]'::jsonb),
    
    ('thief', 'Thief', '1', 'Thief', 'novice', '/assets/sprites/thief.png', '', 10, 
     '{"hp":150,"atk":24,"def":7,"rec":9,"matk":6,"mdef":6,"agi":12}'::jsonb, 
     '{"hp":0.9,"atk":1.2,"def":0.7,"rec":0.9,"matk":0.6,"mdef":0.6,"agi":1.2}'::jsonb,
     '{"hp":0,"atk":4,"def":0,"rec":0,"matk":0,"mdef":0,"agi":4}'::jsonb,
     '["dagger","katar"]'::jsonb, '["steal","backstab"]'::jsonb, '["enrich"]'::jsonb,
     '{"level":20,"job_level":10,"zel_cost":500}'::jsonb, 
     '["assassin","rogue"]'::jsonb),
    
    ('merchant', 'Merchant', '1', 'Trade', 'novice', '/assets/sprites/merchant.png', '', 10, 
     '{"hp":180,"atk":10,"def":10,"rec":10,"matk":8,"mdef":8,"agi":9}'::jsonb, 
     '{"hp":1.1,"atk":1.0,"def":1.0,"rec":1.0,"matk":0.8,"mdef":0.8,"agi":0.9}'::jsonb,
     '{"hp":10,"atk":2,"def":2,"rec":3,"matk":0,"mdef":0,"agi":0}'::jsonb,
     '["axe"]'::jsonb, '["mammonite","discount"]'::jsonb, '["overpass"]'::jsonb,
     '{"level":20,"job_level":10,"zel_cost":500}'::jsonb, 
     '["blacksmith","alchemist"]'::jsonb);
  END IF;
END $$;

-- Tier 2 Jobs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.job_definitions WHERE id = 'knight') THEN
    INSERT INTO public.job_definitions (id, name, tier, category, parent_job_id, sprite_url, css_filter, required_job_level, base_stats, stat_multipliers, stat_bonuses, allowed_weapons, skills_unlocked, passive_effects, evolution_requirements, branch_options) VALUES
    ('knight', 'Knight', '2', 'Sword', 'swordman', '/assets/sprites/knight.png', '', 30, 
     '{"hp":280,"atk":30,"def":26,"rec":7,"matk":4,"mdef":5,"agi":8}'::jsonb, 
     '{"hp":1.4,"atk":1.5,"def":1.3,"rec":0.7,"matk":0.4,"mdef":0.5,"agi":0.8}'::jsonb,
     '{"hp":50,"atk":15,"def":10,"rec":0,"matk":0,"mdef":0,"agi":0}'::jsonb,
     '["sword","blade","spear"]'::jsonb, '["berserk","brandish"]'::jsonb, '["heavy_strike"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('crusader', 'Crusader', '2', 'Sword', 'swordman', '/assets/sprites/crusader.png', '', 30, 
     '{"hp":300,"atk":24,"def":28,"rec":9,"matk":4,"mdef":6,"agi":8}'::jsonb, 
     '{"hp":1.5,"atk":1.2,"def":1.4,"rec":0.9,"matk":0.4,"mdef":0.6,"agi":0.8}'::jsonb,
     '{"hp":60,"atk":10,"def":12,"rec":0,"matk":0,"mdef":0,"agi":0}'::jsonb,
     '["sword","spear"]'::jsonb, '["holy_cross","pressure"]'::jsonb, '["faith"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('wizard', 'Wizard', '2', 'Magic', 'mage', '/assets/sprites/wizard.png', '', 30, 
     '{"hp":140,"atk":4,"def":5,"rec":14,"matk":17,"mdef":14,"agi":6}'::jsonb, 
     '{"hp":0.7,"atk":0.4,"def":0.5,"rec":1.4,"matk":1.7,"mdef":1.4,"agi":0.6}'::jsonb,
     '{"hp":0,"atk":0,"def":0,"rec":10,"matk":20,"mdef":12,"agi":0}'::jsonb,
     '["staff","wand"]'::jsonb, '["meteor","storm_bolt"]'::jsonb, '["arcane_mastery"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('sage', 'Sage', '2', 'Magic', 'mage', '/assets/sprites/sage.png', '', 30, 
     '{"hp":160,"atk":5,"def":7,"rec":15,"matk":15,"mdef":15,"agi":7}'::jsonb, 
     '{"hp":0.8,"atk":0.5,"def":0.7,"rec":1.5,"matk":1.5,"mdef":1.5,"agi":0.7}'::jsonb,
     '{"hp":5,"atk":0,"def":0,"rec":12,"matk":15,"mdef":15,"agi":0}'::jsonb,
     '["staff","wand"]'::jsonb, '["earth_spike","deluge"]'::jsonb, '["wisdom"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('hunter', 'Hunter', '2', 'Bow', 'archer', '/assets/sprites/hunter.png', '', 30, 
     '{"hp":200,"atk":30,"def":8,"rec":7,"matk":5,"mdef":5,"agi":15}'::jsonb, 
     '{"hp":1.0,"atk":1.5,"def":0.8,"rec":0.7,"matk":0.5,"mdef":0.5,"agi":1.5}'::jsonb,
     '{"hp":10,"atk":12,"def":0,"rec":0,"matk":0,"mdef":0,"agi":12}'::jsonb,
     '["bow"]'::jsonb, '["arrow_bomb","clash"]'::jsonb, '["predator"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('bard', 'Bard', '2', 'Bow', 'archer', '/assets/sprites/bard.png', '', 30, 
     '{"hp":180,"atk":24,"def":7,"rec":10,"matk":8,"mdef":8,"agi":14}'::jsonb, 
     '{"hp":0.9,"atk":1.2,"def":0.7,"rec":1.0,"matk":0.8,"mdef":0.8,"agi":1.4}'::jsonb,
     '{"hp":0,"atk":8,"def":0,"rec":3,"matk":3,"mdef":3,"agi":10}'::jsonb,
     '["bow"]'::jsonb, '["mocking","imm_overture"]'::jsonb, '["melody"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('priest', 'Priest', '2', 'Heal', 'acolyte', '/assets/sprites/priest.png', '', 30, 
     '{"hp":220,"atk":6,"def":9,"rec":16,"matk":13,"mdef":15,"agi":8}'::jsonb, 
     '{"hp":1.1,"atk":0.6,"def":0.9,"rec":1.6,"matk":1.3,"mdef":1.5,"agi":0.8}'::jsonb,
     '{"hp":15,"atk":0,"def":0,"rec":15,"matk":8,"mdef":12,"agi":0}'::jsonb,
     '["mace"]'::jsonb, '["heal","resurrection"]'::jsonb, '["sanctuary"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('monk', 'Monk', '2', 'Heal', 'acolyte', '/assets/sprites/monk.png', '', 30, 
     '{"hp":260,"atk":24,"def":11,"rec":13,"matk":8,"mdef":10,"agi":10}'::jsonb, 
     '{"hp":1.3,"atk":1.2,"def":1.1,"rec":1.3,"matk":0.8,"mdef":1.0,"agi":1.0}'::jsonb,
     '{"hp":30,"atk":8,"def":5,"rec":10,"matk":0,"mdef":0,"agi":5}'::jsonb,
     '["fist"]'::jsonb, '["floating_dump","glacier_fist"]'::jsonb, '["chi"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('assassin', 'Assassin', '2', 'Thief', 'thief', '/assets/sprites/assassin.png', '', 30, 
     '{"hp":180,"atk":30,"def":6,"rec":8,"matk":5,"mdef":5,"agi":16}'::jsonb, 
     '{"hp":0.9,"atk":1.5,"def":0.6,"rec":0.8,"matk":0.5,"mdef":0.5,"agi":1.6}'::jsonb,
     '{"hp":0,"atk":14,"def":0,"rec":0,"matk":0,"mdef":0,"agi":12}'::jsonb,
     '["dagger","katar"]'::jsonb, '["cross_impact","shadow_dash"]'::jsonb, '["assassinate"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('rogue', 'Rogue', '2', 'Thief', 'thief', '/assets/sprites/rogue.png', '', 30, 
     '{"hp":200,"atk":26,"def":8,"rec":10,"matk":6,"mdef":7,"agi":14}'::jsonb, 
     '{"hp":1.0,"atk":1.3,"def":0.8,"rec":1.0,"matk":0.6,"mdef":0.7,"agi":1.4}'::jsonb,
     '{"hp":8,"atk":10,"def":2,"rec":2,"matk":0,"mdef":0,"agi":10}'::jsonb,
     '["dagger","katar"]'::jsonb, '["back_dash","em_voice"]'::jsonb, '["tricky"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('blacksmith', 'Blacksmith', '2', 'Trade', 'merchant', '/assets/sprites/blacksmith.png', '', 30, 
     '{"hp":280,"atk":24,"def":26,"rec":10,"matk":6,"mdef":8,"agi":7}'::jsonb, 
     '{"hp":1.4,"atk":1.2,"def":1.3,"rec":1.0,"matk":0.6,"mdef":0.8,"agi":0.7}'::jsonb,
     '{"hp":45,"atk":8,"def":8,"rec":5,"matk":0,"mdef":0,"agi":0}'::jsonb,
     '["axe","hammer"]'::jsonb, '["hammer_fall","weapon_perfect"]'::jsonb, '["smithing"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb),
    
    ('alchemist', 'Alchemist', '2', 'Trade', 'merchant', '/assets/sprites/alchemist.png', '', 30, 
     '{"hp":220,"atk":18,"def":10,"rec":13,"matk":13,"mdef":12,"agi":8}'::jsonb, 
     '{"hp":1.1,"atk":0.9,"def":1.0,"rec":1.3,"matk":1.3,"mdef":1.2,"agi":0.8}'::jsonb,
     '{"hp":15,"atk":2,"def":3,"rec":8,"matk":10,"mdef":8,"agi":0}'::jsonb,
     '["axe","staff"]'::jsonb, '["aque_elixir","acid_eruption"]'::jsonb, '["potion_mast"]'::jsonb,
     '{"level":50,"job_level":30,"zel_cost":2000}'::jsonb, '[]'::jsonb);
  END IF;
END $$;

-- SECTION 7: Seed Items
-- ============================================

INSERT INTO public.item_definitions (id, name, type, rarity, description, stats, sprite)
VALUES 
  ('w_iron_sword', 'Iron Sword', 'Weapon', 1, 'A basic iron sword', '{"atk":5,"def":0}'::jsonb, '{"icon":"sword","color":"#888888"}'::jsonb),
  ('w_steel_sword', 'Steel Sword', 'Weapon', 2, 'A sturdy steel sword', '{"atk":12,"def":2}'::jsonb, '{"icon":"sword","color":"#c0c0c0"}'::jsonb),
  ('w_flame_sword', 'Flame Sword', 'Weapon', 3, 'A sword imbued with fire', '{"atk":25,"def":5,"element":"Fire"}'::jsonb, '{"icon":"sword","color":"#ff5500"}'::jsonb),
  ('a_wood_shield', 'Wood Shield', 'Armor', 1, 'Basic wooden shield', '{"hp":20,"def":3}'::jsonb, '{"icon":"shield","color":"#8b4513"}'::jsonb),
  ('a_iron_armor', 'Iron Armor', 'Armor', 2, 'Heavy iron armor', '{"hp":50,"def":10}'::jsonb, '{"icon":"armor","color":"#808080"}'::jsonb),
  ('ac_power_ring', 'Power Ring', 'Accessory', 1, 'Increases ATK', '{"atk":3}'::jsonb, '{"icon":"ring","color":"#ffd700"}'::jsonb),
  ('ac_sage_ring', 'Sage Ring', 'Accessory', 2, 'Increases MATK', '{"matk":8}'::jsonb, '{"icon":"ring","color":"#9932cc"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- SECTION 8: Trigger for new players
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_player()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_profiles (id, display_name, level)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Summoner'), 1);
  
  INSERT INTO public.player_currencies (player_id, code, amount)
  VALUES 
    (NEW.id, 'gems', 25),
    (NEW.id, 'zel', 1000),
    (NEW.id, 'karma', 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_player();

-- Verification
-- ============================================

SELECT 'job_definitions' as table_name, count(*) as row_count FROM public.job_definitions
UNION ALL SELECT 'item_definitions', count(*) FROM public.item_definitions
UNION ALL SELECT 'player_profiles', count(*) FROM public.player_profiles;