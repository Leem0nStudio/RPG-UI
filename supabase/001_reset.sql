-- RESET: Drop all tables and functions to start fresh
-- WARNING: This will delete ALL data. Use with caution.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_player;

drop table if exists public.player_quest_progress;
drop table if exists public.player_items;
drop table if exists public.player_units;
drop table if exists public.player_currencies;
drop table if exists public.player_profiles;
drop table if exists public.enemy_definitions;
drop table if exists public.summon_banners;
drop table if exists public.quest_definitions;
drop table if exists public.item_definitions;
drop table if exists public.unit_definitions;
drop table if exists public.job_definitions;

drop function if exists public.update_quest_progress_timestamp;
drop extension if exists "pgcrypto";