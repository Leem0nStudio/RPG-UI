-- Migration 0005: Complete Ragnarok Online job system
-- Structure: Jobs define classes, Units reference jobs by jobId

-- 1. Insert all Ragnarok Online jobs (if not exists)
INSERT INTO public.job_definitions (id, name, tier, category, sprite_url, css_filter, required_job_level, evolved_from, base_stats, stat_multipliers, skills) VALUES
-- === 1st Class (Tier 1) ===
('job_swordman', 'Swordman', '1', 'Sword', '/assets/sprites/characters/1job/swordman_.png', '', 10, NULL, '{"hp":200,"atk":20,"def":15,"rec":5}', '{"hp":1.2,"atk":1.1,"def":1.0,"rec":0.8}', '[]'),
('job_archer', 'Archer', '1', 'Bow', '/assets/sprites/characters/1job/archer_.png', '', 10, NULL, '{"hp":160,"atk":28,"def":8,"rec":8}', '{"hp":0.9,"atk":1.3,"def":0.6,"rec":0.9}', '[]'),
('job_mage', 'Mage', '1', 'Magic', '/assets/sprites/characters/1job/mage_.png', '', 10, NULL, '{"hp":120,"atk":30,"def":5,"rec":25}', '{"hp":0.8,"atk":1.4,"def":0.5,"rec":1.3}', '[]'),
('job_thief', 'Thief', '1', 'Thief', '/assets/sprites/characters/1job/thief_.png', '', 10, NULL, '{"hp":150,"atk":25,"def":8,"rec":10}', '{"hp":0.9,"atk":1.3,"def":0.7,"rec":1.0}', '[]'),
('job_merchant', 'Merchant', '1', 'Trade', '/assets/sprites/characters/1job/merchant_.png', '', 10, NULL, '{"hp":180,"atk":15,"def":12,"rec":12}', '{"hp":1.1,"atk":0.9,"def":1.0,"rec":1.0}', '[]'),
('job_acolyte', 'Acolyte', '1', 'Heal', '/assets/sprites/characters/1job/acolyte_.png', '', 10, NULL, '{"hp":140,"atk":10,"def":10,"rec":30}', '{"hp":1.0,"atk":0.7,"def":0.8,"rec":1.5}', '[]'),

-- === 2nd Class (Tier 2) ===
('job_knight', 'Knight', '2', 'Sword', '/assets/sprites/characters/2job/knight_.png', '', 10, 'job_swordman', '{"hp":350,"atk":35,"def":25,"rec":10}', '{"hp":1.4,"atk":1.3,"def":1.2,"rec":0.8}', '[]'),
('job_crusader', 'Crusader', '2', 'Sword', '/assets/sprites/characters/1job/swordman_.png', 'sepia(0.3) brightness(0.9)', 10, 'job_swordman', '{"hp":380,"atk":28,"def":30,"rec":15}', '{"hp":1.5,"atk":1.1,"def":1.4,"rec":0.9}', '[]'),
('job_hunter', 'Hunter', '2', 'Bow', '/assets/sprites/characters/1job/archer_.png', 'saturate(1.2)', 10, 'job_archer', '{"hp":280,"atk":45,"def":12,"rec":15}', '{"hp":1.0,"atk":1.5,"def":0.7,"rec":1.0}', '[]'),
('job_bard', 'Bard', '2', 'Bow', '/assets/sprites/characters/1job/archer_.png', 'hue-rotate(180deg) saturate(0.8)', 10, 'job_archer', '{"hp":220,"atk":35,"def":10,"rec":25}', '{"hp":0.9,"atk":1.3,"def":0.6,"rec":1.3}', '[]'),
('job_wizard', 'Wizard', '2', 'Magic', '/assets/sprites/characters/2job/wizard_.png', '', 10, 'job_mage', '{"hp":200,"atk":55,"def":8,"rec":40}', '{"hp":0.8,"atk":1.8,"def":0.5,"rec":1.5}', '[]'),
('job_sage', 'Sage', '2', 'Magic', '/assets/sprites/characters/2job/wizard_.png', 'hue-rotate(30deg) brightness(1.1)', 10, 'job_mage', '{"hp":190,"atk":45,"def":12,"rec":50}', '{"hp":0.85,"atk":1.5,"def":0.7,"rec":1.7}', '[]'),
('job_assassin', 'Assassin', '2', 'Thief', '/assets/sprites/characters/2job/assasin_.png', '', 10, 'job_thief', '{"hp":250,"atk":45,"def":12,"rec":18}', '{"hp":1.0,"atk":1.6,"def":0.7,"rec":1.1}', '[]'),
('job_rogue', 'Rogue', '2', 'Thief', '/assets/sprites/characters/1job/thief_.png', 'brightness(0.8) saturate(1.3)', 10, 'job_thief', '{"hp":230,"atk":40,"def":15,"rec":20}', '{"hp":0.95,"atk":1.5,"def":0.8,"rec":1.2}', '[]'),
('job_blacksmith', 'Blacksmith', '2', 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', '', 10, 'job_merchant', '{"hp":300,"atk":25,"def":20,"rec":20}', '{"hp":1.3,"atk":1.1,"def":1.2,"rec":1.1}', '[]'),
('job_alchemist', 'Alchemist', '2', 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', 'hue-rotate(90deg) saturate(0.7)', 10, 'job_merchant', '{"hp":280,"atk":20,"def":18,"rec":25}', '{"hp":1.25,"atk":0.9,"def":1.1,"rec":1.3}', '[]'),
('job_priest', 'Priest', '2', 'Heal', '/assets/sprites/characters/2job/priest_.png', '', 10, 'job_acolyte', '{"hp":230,"atk":15,"def":15,"rec":50}', '{"hp":1.1,"atk":0.7,"def":0.9,"rec":1.8}', '[]'),
('job_monk', 'Monk', '2', 'Heal', '/assets/sprites/characters/2job/priest_.png', 'sepia(0.2) saturate(1.2)', 10, 'job_acolyte', '{"hp":280,"atk":30,"def":15,"rec":30}', '{"hp":1.2,"atk":1.2,"def":0.9,"rec":1.2}', '[]'),

-- === Transcendent (Tier 3) ===
('job_lord_knight', 'Lord Knight', '3', 'Sword', '/assets/sprites/characters/2job/knight_.png', 'brightness(1.2) saturate(1.1)', 10, 'job_knight', '{"hp":450,"atk":50,"def":35,"rec":15}', '{"hp":1.6,"atk":1.5,"def":1.4,"rec":0.9}', '[]'),
('job_paladin', 'Paladin', '3', 'Sword', '/assets/sprites/characters/2job/knight_.png', 'sepia(0.4) brightness(1.1)', 10, 'job_crusader', '{"hp":480,"atk":40,"def":42,"rec":20}', '{"hp":1.7,"atk":1.3,"def":1.6,"rec":1.0}', '[]'),
('job_sniper', 'Sniper', '3', 'Bow', '/assets/sprites/characters/1job/archer_.png', 'saturate(1.5) brightness(1.1)', 10, 'job_hunter', '{"hp":350,"atk":60,"def":18,"rec":20}', '{"hp":1.1,"atk":1.7,"def":0.8,"rec":1.1}', '[]'),
('job_clown', 'Clown', '3', 'Bow', '/assets/sprites/characters/1job/archer_.png', 'hue-rotate(200deg) saturate(1.2)', 10, 'job_bard', '{"hp":280,"atk":48,"def":15,"rec":35}', '{"hp":1.0,"atk":1.5,"def":0.7,"rec":1.5}', '[]'),
('job_high_wizard', 'High Wizard', '3', 'Magic', '/assets/sprites/characters/2job/wizard_.png', 'brightness(1.2)', 10, 'job_wizard', '{"hp":260,"atk":75,"def":12,"rec":55}', '{"hp":0.9,"atk":2.0,"def":0.6,"rec":1.7}', '[]'),
('job_professor', 'Professor', '3', 'Magic', '/assets/sprites/characters/2job/wizard_.png', 'hue-rotate(40deg) brightness(1.05)', 10, 'job_sage', '{"hp":250,"atk":60,"def":18,"rec":65}', '{"hp":0.95,"atk":1.7,"def":0.8,"rec":1.9}', '[]'),
('job_assassin_cross', 'Assassin Cross', '3', 'Thief', '/assets/sprites/characters/2job/assasin_.png', 'brightness(1.1) saturate(1.2)', 10, 'job_assassin', '{"hp":320,"atk":60,"def":18,"rec":25}', '{"hp":1.1,"atk":1.8,"def":0.8,"rec":1.2}', '[]'),
('job_stalker', 'Stalker', '3', 'Thief', '/assets/sprites/characters/1job/thief_.png', 'brightness(0.7) saturate(1.5)', 10, 'job_rogue', '{"hp":300,"atk":55,"def":20,"rec":28}', '{"hp":1.05,"atk":1.7,"def":0.9,"rec":1.3}', '[]'),
('job_whitesmith', 'Whitesmith', '3', 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', 'brightness(1.15)', 10, 'job_blacksmith', '{"hp":380,"atk":35,"def":28,"rec":28}', '{"hp":1.5,"atk":1.3,"def":1.4,"rec":1.2}', '[]'),
('job_creator', 'Creator', '3', 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', 'hue-rotate(100deg) saturate(0.8)', 10, 'job_alchemist', '{"hp":360,"atk":28,"def":25,"rec":35}', '{"hp":1.4,"atk":1.0,"def":1.3,"rec":1.5}', '[]'),
('job_high_priest', 'High Priest', '3', 'Heal', '/assets/sprites/characters/2job/priest_.png', 'brightness(1.15)', 10, 'job_priest', '{"hp":300,"atk":22,"def":22,"rec":65}', '{"hp":1.2,"atk":0.8,"def":1.0,"rec":2.0}', '[]'),
('job_champion', 'Champion', '3', 'Heal', '/assets/sprites/characters/2job/priest_.png', 'sepia(0.3) saturate(1.3)', 10, 'job_monk', '{"hp":360,"atk":42,"def":22,"rec":42}', '{"hp":1.35,"atk":1.4,"def":1.0,"rec":1.4}', '[]')
ON CONFLICT (id) DO NOTHING;

-- 2. Add indexes for fast lookups and data integrity
CREATE INDEX IF NOT EXISTS idx_job_definitions_category ON public.job_definitions(category);
CREATE INDEX IF NOT EXISTS idx_job_definitions_tier ON public.job_definitions(tier);
CREATE INDEX IF NOT EXISTS idx_job_definitions_evolved_from ON public.job_definitions(evolved_from);

CREATE INDEX IF NOT EXISTS idx_unit_definitions_job_id ON public.unit_definitions(job_id);
CREATE INDEX IF NOT EXISTS idx_unit_definitions_element ON public.unit_definitions(element);
CREATE INDEX IF NOT EXISTS idx_unit_definitions_rarity ON public.unit_definitions(rarity);

CREATE INDEX IF NOT EXISTS idx_player_units_job_id ON public.player_units(job_id);
CREATE INDEX IF NOT EXISTS idx_player_units_unit_id ON public.player_units(unit_id);
