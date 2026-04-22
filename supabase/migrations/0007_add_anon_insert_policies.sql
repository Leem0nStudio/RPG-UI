-- Add grants for new tables and anon role
grant usage on schema public to anon, authenticated;

grant select on public.enemy_definitions to anon, authenticated;
grant select on public.player_quest_progress to authenticated;

grant select, insert, update on public.player_profiles to anon;
grant select, insert, update on public.player_currencies to anon;
grant select, insert, update on public.player_units to anon;
grant select, insert, update on public.player_items to anon;
grant select, insert, update on public.player_quest_progress to anon;

-- Drop existing anon policies if they exist (for re-runability)
drop policy if exists "anon insert own profile" on public.player_profiles;
drop policy if exists "anon insert own currencies" on public.player_currencies;
drop policy if exists "anon update own currencies" on public.player_currencies;
drop policy if exists "anon insert own units" on public.player_units;
drop policy if exists "anon update own units" on public.player_units;
drop policy if exists "anon insert own items" on public.player_items;
drop policy if exists "anon update own items" on public.player_items;
drop policy if exists "anon manage quest progress" on public.player_quest_progress;

-- Add INSERT policies for anonymous (anon) role
create policy "anon insert own profile" on public.player_profiles
for insert with check (auth.uid() = id);

create policy "anon insert own currencies" on public.player_currencies
for insert with check (auth.uid() = player_id);

create policy "anon update own currencies" on public.player_currencies
for update using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "anon insert own units" on public.player_units
for insert with check (auth.uid() = player_id);

create policy "anon update own units" on public.player_units
for update using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "anon insert own items" on public.player_items
for insert with check (auth.uid() = player_id);

create policy "anon update own items" on public.player_items
for update using (auth.uid() = player_id) with check (auth.uid() = player_id);

create policy "anon manage quest progress" on public.player_quest_progress
for all using (auth.uid() = player_id) with check (auth.uid() = player_id);

-- RPC functions for type-safe upserts
create or replace function public.upsert_currency(
  p_player_id uuid,
  p_code text,
  p_amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_currencies (player_id, code, amount)
  values (p_player_id, p_code, p_amount)
  on conflict (player_id, code) do update set amount = p_amount;
end;
$$;

create or replace function public.upsert_item(
  p_player_id uuid,
  p_item_id text,
  p_quantity integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_items (player_id, item_id, quantity)
  values (p_player_id, p_item_id, p_quantity)
  on conflict (player_id, item_id) do update set quantity = p_quantity;
end;
$$;

drop function if exists public.add_unit_to_roster(uuid, text, integer, text);

create function public.add_unit_to_roster(
  p_player_id uuid,
  p_unit_id text,
  p_level integer,
  p_job_id text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_unit_id text;
begin
  new_unit_id := gen_random_uuid();
  insert into public.player_units (id, player_id, unit_id, level, exp, job_id, job_level, job_exp, locked, equipment)
  values (new_unit_id, p_player_id, p_unit_id, p_level, 0, p_job_id, 1, 0, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb);
  return new_unit_id;
end;
$$;

grant execute on function public.upsert_currency to anon, authenticated;
grant execute on function public.upsert_item to anon, authenticated;
grant execute on function public.add_unit_to_roster to anon, authenticated;