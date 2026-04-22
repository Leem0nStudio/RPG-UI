-- Debug: Check if data is accessible
SELECT 'Jobs:' as info, COUNT(*) as count FROM public.job_definitions
UNION ALL
SELECT 'Units:', COUNT(*) FROM public.unit_definitions
UNION ALL  
SELECT 'Items:', COUNT(*) FROM public.item_definitions
UNION ALL
SELECT 'Enemies:', COUNT(*) FROM public.enemy_definitions
UNION ALL
SELECT 'Quests:', COUNT(*) FROM public.quest_definitions
UNION ALL
SELECT 'Banners:', COUNT(*) FROM public.summon_banners;

-- Also check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';