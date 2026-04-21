insert into public.unit_definitions (id, name, title, element, rarity, max_level, cost, base_stats, sprite_url, css_filter, skills) values
('u_sergio', 'Knight Sergio', 'ROGUE TIDE', 'Water', 3, 40, 5, '{"hp":2050,"atk":600,"def":600,"rec":580}', 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', 'sepia(0) hue-rotate(0deg)', '[{"id":"ls_sergio","type":"LEADER SKILL","title":"Tidal Command","description":"10% boost to Atk Power of Water units","iconType":"Flag"},{"id":"bb_sergio","type":"BRAVE BURST","title":"Aqua Slash","description":"5 combo Water attack on a single enemy","cost":18,"iconType":"Sparkles"}]'::jsonb),
('u_vargas', 'Vargas', 'EMBER VANGUARD', 'Fire', 4, 40, 8, '{"hp":2400,"atk":850,"def":550,"rec":400}', 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', 'sepia(0.5) saturate(2) hue-rotate(-50deg)', '[{"id":"ls_vargas","type":"LEADER SKILL","title":"Flame March","description":"15% boost to Atk Power of Fire units","iconType":"Flag"}]'::jsonb),
('u_elys', 'Elys', 'SOLAR SAINT', 'Light', 6, 80, 15, '{"hp":4500,"atk":1200,"def":800,"rec":600}', 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', 'sepia(0.2) saturate(1.4) hue-rotate(10deg) brightness(1.25)', '[{"id":"ls_elys","type":"LEADER SKILL","title":"Solar Blessing","description":"25% boost to Atk and 10% boost to HP of Light units","iconType":"Flag"}]'::jsonb)
on conflict (id) do nothing;

insert into public.item_definitions (id, name, type, rarity, description, stats, sprite, effects) values
('w_brave_sword', 'Brave Sword', 'Weapon', 3, 'A standard sword assigned to brave warriors.', '{"hp":0,"atk":120,"def":0,"rec":0}', '{"col":2,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["10% chance to ignore enemy DEF"]'::jsonb),
('a_knight_shield', 'Knight Shield', 'Armor', 3, 'A sturdy iron shield.', '{"hp":200,"atk":0,"def":150,"rec":0}', '{"col":3,"row":0,"className":"drop-shadow-[0_2px_4px_#111]"}', '["Reduces damage taken by 5%"]'::jsonb)
on conflict (id) do nothing;

insert into public.quest_definitions (id, world_id, stage, name, energy_cost, difficulty, enemy_ids, rewards_preview) values
('quest_evergreen_1', 'world_evergreen', 1, 'Echoes of the Grove', 5, 'Normal', '["enemy_mimic","enemy_wisp","enemy_golem"]'::jsonb, '["Zel x250","Karma x150","Potion","1* Material"]'::jsonb)
on conflict (id) do nothing;

insert into public.summon_banners (id, name, cost, currency, featured_unit_ids, description, active) values
('banner_origin_light', 'Origin of Light', 5, 'gems', '["u_elys","u_magress"]'::jsonb, 'Light and Dark featured rate-up banner with a guaranteed 4* or higher on multi.', true)
on conflict (id) do nothing;
