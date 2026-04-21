-- RESET: Drop all tables and functions to start fresh
-- WARNING: This will delete ALL data. Use with caution.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_player;
drop function if exists public.update_quest_progress_timestamp;

drop table if exists public.player_quest_progress cascade;
drop table if exists public.player_items cascade;
drop table if exists public.player_units cascade;
drop table if exists public.player_currencies cascade;
drop table if exists public.player_profiles cascade;
drop table if exists public.enemy_definitions cascade;
drop table if exists public.summon_banners cascade;
drop table if exists public.quest_definitions cascade;
drop table if exists public.item_definitions cascade;
drop table if exists public.unit_definitions cascade;
drop table if exists public.job_definitions cascade;

drop extension if exists "pgcrypto";