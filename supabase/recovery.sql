-- ============================================
-- RECOVERY SCRIPT - Fix RLS and verify tables
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================

-- Fix player_profiles RLS
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players can view own profile" ON public.player_profiles;
CREATE POLICY "Players can view own profile" ON public.player_profiles FOR ALL USING (auth.uid() = id);

-- Fix player_currencies RLS  
ALTER TABLE public.player_currencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players can manage own currencies" ON public.player_currencies;
CREATE POLICY "Players can manage own currencies" ON public.player_currencies FOR ALL USING (auth.uid() = player_id);

-- Fix player_units RLS
ALTER TABLE public.player_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players can manage own units" ON public.player_units;
CREATE POLICY "Players can manage own units" ON public.player_units FOR ALL USING (auth.uid() = player_id);

-- Fix player_items RLS
ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players can manage own items" ON public.player_items;
CREATE POLICY "Players can manage own items" ON public.player_items FOR ALL USING (auth.uid() = player_id);

-- Fix gacha tables RLS
ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gacha_pulls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players own cards" ON public.player_cards;
CREATE POLICY "Players own cards" ON public.player_cards FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own weapons" ON public.player_weapons;
CREATE POLICY "Players own weapons" ON public.player_weapons FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own skills" ON public.player_skills;
CREATE POLICY "Players own skills" ON public.player_skills FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own materials" ON public.player_materials;
CREATE POLICY "Players own materials" ON public.player_materials FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players own pulls" ON public.gacha_pulls;
CREATE POLICY "Players own pulls" ON public.gacha_pulls FOR ALL USING (auth.uid() = player_id);

-- Verification
SELECT 
  'player_profiles' as table_name, 
  (SELECT count(*) FROM public.player_profiles) as row_count
UNION ALL
SELECT 'player_currencies', (SELECT count(*) FROM public.player_currencies)
UNION ALL
SELECT 'player_units', (SELECT count(*) FROM public.player_units)
UNION ALL
SELECT 'player_items', (SELECT count(*) FROM public.player_items);