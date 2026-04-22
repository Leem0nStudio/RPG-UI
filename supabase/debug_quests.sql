-- Check quest enemy_ids and verify they match existing enemies

-- Show all quests with their enemy_ids
SELECT id, name, enemy_ids FROM public.quest_definitions ORDER BY stage;

-- Show all enemies
SELECT id, name, element FROM public.enemy_definitions ORDER BY id;