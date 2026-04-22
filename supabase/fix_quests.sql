-- Add quests that match the enemies we have

DELETE FROM public.quest_definitions WHERE id LIKE 'quest_%';

INSERT INTO public.quest_definitions (id, world_id, stage, name, energy_cost, difficulty, enemy_ids, rewards_preview) values
('quest_1', 'prontera', 1, 'First Steps', 5, 'Normal', '["enemy_slime"]', '["10 EXP", "20 Zel"]'),
('quest_2', 'prontera', 2, 'Forest Ambush', 5, 'Normal', '["enemy_goblin"]', '["25 EXP", "50 Zel"]'),
('quest_3', 'prontera', 3, 'Wolf Pack', 7, 'Normal', '["enemy_wolf"]', '["40 EXP", "80 Zel"]'),
('quest_4', 'prontera', 4, 'Cave Explorer', 10, 'Normal', '["enemy_bat"]', '["60 EXP", "120 Zel"]'),
('quest_5', 'prontera', 5, 'Fire Dungeon', 12, 'Hard', '["enemy_salamander", "enemy_ifrit"]', '["80 EXP", "200 Zel"]'),
('quest_6', 'prontera', 6, 'Water Temple', 15, 'Hard', '["enemy_sea_serpent", "enemy_siren"]', '["100 EXP", "300 Zel"]'),
('quest_7', 'prontera', 7, 'Earth Guardian', 18, 'Hard', '["enemy_golem"]', '["120 EXP", "400 Zel"]'),
('quest_8', 'prontera', 8, 'Dark Dungeon', 20, 'Heroic', '["enemy_shadow", "enemy_demon"]', '["150 EXP", "500 Zel"]'),
('quest_9', 'prontera', 9, 'Light Temple', 22, 'Heroic', '["enemy_spark", "enemy_angel"]', '["180 EXP", "600 Zel"]'),
('quest_10', 'prontera', 10, 'Final Boss', 30, 'Heroic', '["enemy_titan"]', '["300 EXP", "1000 Zel"]')
ON CONFLICT (id) DO NOTHING;

-- Show updated quests
SELECT * FROM public.quest_definitions ORDER BY stage;