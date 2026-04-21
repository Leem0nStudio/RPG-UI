-- Migration 0004: Add grants and update trigger for job system

-- 1. Update grants (already exists for other tables)
GRANT SELECT ON public.job_definitions TO anon, authenticated;

-- 2. Drop and recreate trigger function to include job fields
CREATE OR REPLACE FUNCTION public.handle_new_player()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.player_profiles (id, display_name, level, energy_current, energy_max, energy_recover_at)
  VALUES (new.id, 'Summoner', 1, 20, 20, null)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.player_currencies (player_id, code, amount)
  VALUES
    (new.id, 'gems', 25),
    (new.id, 'zel', 6420),
    (new.id, 'karma', 1606)
  ON CONFLICT (player_id, code) DO NOTHING;

  INSERT INTO public.player_units (id, player_id, unit_id, level, exp, job_id, job_level, job_exp, locked, equipment)
  VALUES
    (gen_random_uuid(), new.id, 'u_sergio', 1, 0, 'job_swordman', 1, 0, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_vargas', 12, 120, 'job_swordman', 5, 50, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_lance', 25, 800, 'job_thief', 10, 200, false, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb),
    (gen_random_uuid(), new.id, 'u_magress', 30, 4500, 'job_knight', 15, 1000, true, '{"Weapon": null, "Armor": null, "Accessory": null}'::jsonb)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.player_items (player_id, item_id, quantity)
  VALUES
    (new.id, 'w_brave_sword', 1),
    (new.id, 'w_flame_dagger', 1),
    (new.id, 'a_knight_shield', 1),
    (new.id, 'a_aura_plate', 1),
    (new.id, 'ac_hero_ring', 1),
    (new.id, 'ac_recovery_amulet', 2)
  ON CONFLICT (player_id, item_id) DO NOTHING;

  RETURN new;
END;
$$;