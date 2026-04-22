-- FIX: Drop all existing tables and functions to start fresh
-- Run this FIRST, then run 002_full_setup.sql
-- IMPORTANT: Run ALL lines at once

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_player_quest_progress_timestamp ON public.player_quest_progress;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_quest_progress_timestamp();
DROP FUNCTION IF EXISTS public.handle_new_player();
DROP FUNCTION IF EXISTS public.admin_insert_enemies(jsonb);

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.player_quest_progress;
DROP TABLE IF EXISTS public.player_items;
DROP TABLE IF EXISTS public.player_units;
DROP TABLE IF EXISTS public.player_currencies;
DROP TABLE IF EXISTS public.player_profiles;
DROP TABLE IF EXISTS public.enemy_definitions;
DROP TABLE IF EXISTS public.summon_banners;
DROP TABLE IF EXISTS public.quest_definitions;
DROP TABLE IF EXISTS public.item_definitions;
DROP TABLE IF EXISTS public.unit_definitions;
DROP TABLE IF EXISTS public.job_definitions;
