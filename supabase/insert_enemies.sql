-- Direct insert of ALL enemies needed for quests
-- Run this to ensure enemies exist

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_salamander', 'Salamander', 'Flame Lizard', 'Fire', 2, 30, '{"hp": 800, "atk": 85, "def": 45, "rec": 35}', NULL, 'sepia(0.5) saturate(2) hue-rotate(-50deg)', 'aggressive', 15, 80, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_salamander');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_sea_serpent', 'Sea Serpent', 'Ocean Serpent', 'Water', 2, 30, '{"hp": 900, "atk": 65, "def": 55, "rec": 50}', NULL, 'sepia(0) hue-rotate(0deg)', 'balanced', 15, 85, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_sea_serpent');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_golem', 'Stone Golem', 'Earth Guardian', 'Earth', 3, 40, '{"hp": 1500, "atk": 70, "def": 90, "rec": 30}', NULL, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'defensive', 25, 120, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_golem');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_ifrit', 'Ifrit', 'Flame Spirit', 'Fire', 4, 50, '{"hp": 1800, "atk": 160, "def": 80, "rec": 55}', NULL, 'sepia(0.5) saturate(2.5) hue-rotate(-50deg) brightness(1.2)', 'aggressive', 35, 180, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_ifrit');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_spark', 'Spark Sprite', 'Light Wisp', 'Light', 2, 30, '{"hp": 600, "atk": 95, "def": 35, "rec": 70}', NULL, 'sepia(0.1) saturate(1.2) hue-rotate(10deg) brightness(1.2)', 'aggressive', 12, 70, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_spark');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_shadow', 'Shadow Beast', 'Dark Hunter', 'Dark', 2, 30, '{"hp": 700, "atk": 100, "def": 40, "rec": 40}', NULL, 'sepia(0.8) hue-rotate(220deg) saturate(0.5)', 'aggressive', 15, 75, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_shadow');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_titan', 'Titan', 'Earth Giant', 'Earth', 5, 60, '{"hp": 3000, "atk": 140, "def": 160, "rec": 50}', NULL, 'sepia(0.5) saturate(2) hue-rotate(80deg) brightness(1.3)', 'boss', 50, 250, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_titan');

-- Also add simpler enemies for fallback
INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_slime', 'Slime', 'Gelatinous Blob', 'Water', 1, 10, '{"hp": 80, "atk": 15, "def": 5, "rec": 5}', NULL, 'sepia(0) hue-rotate(0deg)', 'defensive', 10, 20, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_slime');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_goblin', 'Goblin', 'Forest Scavenger', 'Earth', 2, 15, '{"hp": 150, "atk": 35, "def": 10, "rec": 8}', NULL, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'aggressive', 25, 50, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_goblin');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_wolf', 'Wolf', 'Wild Beast', 'Earth', 2, 20, '{"hp": 200, "atk": 45, "def": 12, "rec": 10}', NULL, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'aggressive', 40, 80, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_wolf');

INSERT INTO public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) 
SELECT 'enemy_bat', 'Bat', 'Cave Dweller', 'Dark', 3, 25, '{"hp": 180, "atk": 55, "def": 8, "rec": 15}', NULL, 'sepia(0.8) hue-rotate(220deg) saturate(0.5)', 'balanced', 60, 120, '[]'
WHERE NOT EXISTS (SELECT 1 FROM public.enemy_definitions WHERE id = 'enemy_bat');

-- Verify
SELECT * FROM public.enemy_definitions;