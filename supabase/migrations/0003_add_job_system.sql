-- Migration 0003: Add job system (delta from existing schema)

-- 1. Create job_definitions table
CREATE TABLE IF NOT EXISTS public.job_definitions (
  id text primary key,
  name text not null,
  tier text not null check (tier in ('1', '2', '3')),
  category text not null check (category in ('Sword', 'Magic', 'Bow', 'Thief', 'Trade', 'Heal')),
  sprite_url text not null,
  css_filter text not null default '',
  required_job_level integer not null default 10,
  evolved_from text null,
  base_stats jsonb not null,
  stat_multipliers jsonb not null default '{"hp": 1, "atk": 1, "def": 1, "rec": 1}'::jsonb,
  skills jsonb not null default '[]'::jsonb
);

-- 2. Add columns to unit_definitions
ALTER TABLE public.unit_definitions ADD COLUMN IF NOT EXISTS job_id text NOT NULL DEFAULT 'job_swordman';
ALTER TABLE public.unit_definitions ADD COLUMN IF NOT EXISTS max_job_level integer NOT NULL DEFAULT 50;

-- 3. Add columns to player_units
ALTER TABLE public.player_units ADD COLUMN IF NOT EXISTS job_id text NOT NULL DEFAULT 'job_swordman';
ALTER TABLE public.player_units ADD COLUMN IF NOT EXISTS job_level integer NOT NULL DEFAULT 1;
ALTER TABLE public.player_units ADD COLUMN IF NOT EXISTS job_exp integer NOT NULL DEFAULT 0;

-- 4. Grants
GRANT SELECT ON public.job_definitions TO anon, authenticated;

-- 5. Insert jobs
INSERT INTO public.job_definitions (id, name, tier, category, sprite_url, required_job_level, evolved_from, base_stats, stat_multipliers, skills) VALUES
('job_swordman', 'Swordman', 1, 'Sword', '/assets/sprites/characters/1job/swordman_.png', 10, null, '{"hp":200,"atk":20,"def":15,"rec":5}', '{"hp":1.2,"atk":1.1,"def":1.0,"rec":0.8}', '[]'::jsonb),
('job_thief', 'Thief', 1, 'Thief', '/assets/sprites/characters/1job/thief_.png', 10, null, '{"hp":150,"atk":25,"def":8,"rec":10}', '{"hp":0.9,"atk":1.3,"def":0.7,"rec":1.0}', '[]'::jsonb),
('job_mage', 'Mage', 1, 'Magic', '/assets/sprites/characters/1job/mage_.png', 10, null, '{"hp":120,"atk":30,"def":5,"rec":25}', '{"hp":0.8,"atk":1.4,"def":0.5,"rec":1.3}', '[]'::jsonb),
('job_acolyte', 'Acolyte', 1, 'Heal', '/assets/sprites/characters/1job/acolyte_.png', 10, null, '{"hp":140,"atk":10,"def":10,"rec":30}', '{"hp":1.0,"atk":0.7,"def":0.8,"rec":1.5}', '[]'::jsonb),
('job_archer', 'Archer', 1, 'Bow', '/assets/sprites/characters/1job/archer_.png', 10, null, '{"hp":160,"atk":28,"def":8,"rec":8}', '{"hp":0.9,"atk":1.3,"def":0.6,"rec":0.9}', '[]'::jsonb),
('job_merchant', 'Merchant', 1, 'Trade', '/assets/sprites/characters/1job/merchant_.png', 10, null, '{"hp":180,"atk":15,"def":12,"rec":12}', '{"hp":1.1,"atk":0.9,"def":1.0,"rec":1.0}', '[]'::jsonb),
('job_knight', 'Knight', 2, 'Sword', '/assets/sprites/characters/2job/knight_.png', 10, 'job_swordman', '{"hp":350,"atk":35,"def":25,"rec":10}', '{"hp":1.4,"atk":1.3,"def":1.2,"rec":0.8}', '[]'::jsonb),
('job_assassin', 'Assassin', 2, 'Thief', '/assets/sprites/characters/2job/assasin_.png', 10, 'job_thief', '{"hp":250,"atk":45,"def":12,"rec":18}', '{"hp":1.0,"atk":1.6,"def":0.7,"rec":1.1}', '[]'::jsonb),
('job_wizard', 'Wizard', 2, 'Magic', '/assets/sprites/characters/2job/wizard_.png', 10, 'job_mage', '{"hp":200,"atk":55,"def":8,"rec":40}', '{"hp":0.8,"atk":1.8,"def":0.5,"rec":1.5}', '[]'::jsonb),
('job_priest', 'Priest', 2, 'Heal', '/assets/sprites/characters/2job/priest_.png', 10, 'job_acolyte', '{"hp":230,"atk":15,"def":15,"rec":50}', '{"hp":1.1,"atk":0.7,"def":0.9,"rec":1.8}', '[]'::jsonb),
('job_blacksmith', 'Blacksmith', 2, 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', 10, 'job_merchant', '{"hp":300,"atk":25,"def":20,"rec":20}', '{"hp":1.3,"atk":1.1,"def":1.2,"rec":1.1}', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Update existing units to have job_id
UPDATE public.unit_definitions SET job_id = 'job_swordman' WHERE job_id IS NULL OR job_id = '';

-- 7. Update existing player_units to have job_id (assuming they are swordmen)
UPDATE public.player_units SET job_id = 'job_swordman' WHERE job_id IS NULL OR job_id = '';
