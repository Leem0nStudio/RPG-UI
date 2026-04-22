-- Check and fix grants, insert missing data

-- Verify enemies exist (if not, insert them)
INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) values
  ('enemy_slime', 'Slime', 'Gelatinous Blob', 'Water', 1, 10, '{"hp": 80, "atk": 15, "def": 5, "rec": 5}', null, 'sepia(0) hue-rotate(0deg)', 'defensive', 10, 20, '[]'),
  ('enemy_goblin', 'Goblin', 'Forest Scavenger', 'Earth', 2, 15, '{"hp": 150, "atk": 35, "def": 10, "rec": 8}', null, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'aggressive', 25, 50, '[]'),
  ('enemy_wolf', 'Wolf', 'Wild Beast', 'Earth', 2, 20, '{"hp": 200, "atk": 45, "def": 12, "rec": 10}', null, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'aggressive', 40, 80, '[]'),
  ('enemy_bat', 'Bat', 'Cave Dweller', 'Dark', 3, 25, '{"hp": 180, "atk": 55, "def": 8, "rec": 15}', null, 'sepia(0.8) hue-rotate(220deg) saturate(0.5)', 'balanced', 60, 120, '[]')
ON CONFLICT (id) DO NOTHING;

-- Add missing quests with matching enemies
INSERT INTO public.quest_definitions (id, world_id, stage, name, energy_cost, difficulty, enemy_ids, rewards_preview) values
  ('quest_tutorial_1', 'prontera', 1, 'First Steps', 5, 'Normal', '["enemy_salamander"]', '["15 EXP", "80 Zel"]'),
  ('quest_forest_1', 'prontera', 2, 'Forest Ambush', 5, 'Normal', '["enemy_goblin"]', '["25 EXP", "50 Zel"]'),
  ('quest_forest_2', 'prontera', 3, 'Wolf Pack', 7, 'Normal', '["enemy_wolf"]', '["40 EXP", "80 Zel"]'),
  ('quest_cave_1', 'prontera', 4, 'Dark Cave', 10, 'Hard', '["enemy_bat"]', '["60 EXP", "120 Zel"]')
ON CONFLICT (id) DO NOTHING;

-- Make sure anonymous can read summon_banners
GRANT SELECT ON public.summon_banners TO anon;
GRANT SELECT ON public.summon_banners TO authenticated;

-- Verify data
SELECT 'jobs' as table_name, COUNT(*) as count FROM public.job_definitions
UNION ALL
SELECT 'units', COUNT(*) FROM public.unit_definitions
UNION ALL
SELECT 'items', COUNT(*) FROM public.item_definitions
UNION ALL
SELECT 'enemies', COUNT(*) FROM public.enemy_definitions
UNION ALL
SELECT 'quests', COUNT(*) FROM public.quest_definitions
UNION ALL
SELECT 'banners', COUNT(*) FROM public.summon_banners;