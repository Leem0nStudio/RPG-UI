-- FIX: Drop all existing tables and functions to start fresh
-- Run this FIRST, then run 002_full_setup.sql

DROP TABLE IF EXISTS public.player_quest_progress CASCADE;
DROP TABLE IF EXISTS public.player_items CASCADE;
DROP TABLE IF EXISTS public.player_units CASCADE;
DROP TABLE IF EXISTS public.player_currencies CASCADE;
DROP TABLE IF EXISTS public.player_profiles CASCADE;
DROP TABLE IF EXISTS public.enemy_definitions CASCADE;
DROP TABLE IF EXISTS public.summon_banners CASCADE;
DROP TABLE IF EXISTS public.quest_definitions CASCADE;
DROP TABLE IF EXISTS public.item_definitions CASCADE;
DROP TABLE IF EXISTS public.unit_definitions CASCADE;
DROP TABLE IF EXISTS public.job_definitions CASCADE;

DROP FUNCTION IF EXISTS public.update_quest_progress_timestamp CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_player CASCADE;
DROP FUNCTION IF EXISTS public.admin_insert_enemies CASCADE;
