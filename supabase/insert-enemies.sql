-- Insert enemies for quests (enemy_slime, enemy_goblin, enemy_wolf, enemy_bat)
-- Run this in Supabase SQL Editor

insert into public.enemy_definitions (id, name, title, element, rarity, max_level, base_stats, sprite_url, css_filter, ai_type, exp_reward, zel_reward, item_drops) values
  ('enemy_slime', 'Slime', 'Gelatinous Blob', 'Water', 1, 10, '{"hp": 80, "atk": 15, "def": 5, "rec": 5}', null, 'sepia(0) hue-rotate(0deg)', 'defensive', 10, 20, '[]'),
  ('enemy_goblin', 'Goblin', 'Forest Scavenger', 'Earth', 2, 15, '{"hp": 150, "atk": 35, "def": 10, "rec": 8}', null, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'aggressive', 25, 50, '[]'),
  ('enemy_wolf', 'Wolf', 'Wild Beast', 'Earth', 2, 20, '{"hp": 200, "atk": 45, "def": 12, "rec": 10}', null, 'sepia(0.5) saturate(1.5) hue-rotate(80deg)', 'aggressive', 40, 80, '[]'),
  ('enemy_bat', 'Bat', 'Cave Dweller', 'Dark', 3, 25, '{"hp": 180, "atk": 55, "def": 8, "rec": 15}', null, 'sepia(0.8) hue-rotate(220deg) saturate(0.5)', 'balanced', 60, 120, '[]')
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  element = excluded.element,
  rarity = excluded.rarity,
  max_level = excluded.max_level,
  base_stats = excluded.base_stats,
  css_filter = excluded.css_filter,
  ai_type = excluded.ai_type,
  exp_reward = excluded.exp_reward,
  zel_reward = excluded.zel_reward;