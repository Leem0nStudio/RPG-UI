grant usage on schema public to anon, authenticated;

grant select on public.job_definitions to anon, authenticated;
grant select on public.unit_definitions to anon, authenticated;
grant select on public.item_definitions to anon, authenticated;
grant select on public.quest_definitions to anon, authenticated;
grant select on public.summon_banners to anon, authenticated;

grant select, insert, update on public.player_profiles to authenticated;
grant select, insert, update on public.player_currencies to authenticated;
grant select, insert, update on public.player_units to authenticated;
grant select, insert, update on public.player_items to authenticated;

create policy "players insert own profile" on public.player_profiles
for insert
with check (auth.uid() = id);

create policy "players insert own currencies" on public.player_currencies
for insert
with check (auth.uid() = player_id);

create policy "players update own currencies" on public.player_currencies
for update
using (auth.uid() = player_id)
with check (auth.uid() = player_id);

create policy "players insert own units" on public.player_units
for insert
with check (auth.uid() = player_id);

create policy "players update own units" on public.player_units
for update
using (auth.uid() = player_id)
with check (auth.uid() = player_id);

create policy "players insert own items" on public.player_items
for insert
with check (auth.uid() = player_id);

create policy "players update own items" on public.player_items
for update
using (auth.uid() = player_id)
with check (auth.uid() = player_id);

create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_profiles (id, display_name, level, energy_current, energy_max, energy_recover_at)
  values (new.id, 'Summoner', 1, 20, 20, null)
  on conflict (id) do nothing;

  insert into public.player_currencies (player_id, code, amount)
  values
    (new.id, 'gems', 25),
    (new.id, 'zel', 6420),
    (new.id, 'karma', 1606)
  on conflict (player_id, code) do nothing;

  insert into public.player_units (id, player_id, unit_id, level, exp, job_id, job_level, job_exp, locked, equipment)
  values
    (gen_random_uuid(), new.id, 'u_sergio', 1, 0, 'job_swordman', 1, 0, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_vargas', 12, 120, 'job_swordman', 5, 50, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_lance', 25, 800, 'job_thief', 10, 200, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_magress', 30, 4500, 'job_knight', 15, 1000, true, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb)
  on conflict do nothing;

  insert into public.player_items (player_id, item_id, quantity)
  values
    (new.id, 'w_brave_sword', 1),
    (new.id, 'w_flame_dagger', 1),
    (new.id, 'a_knight_shield', 1),
    (new.id, 'a_aura_plate', 1),
    (new.id, 'ac_hero_ring', 1),
    (new.id, 'ac_recovery_amulet', 2)
  on conflict (player_id, item_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_player();
