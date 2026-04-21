insert into public.job_definitions (id, name, tier, category, sprite_url, css_filter, required_job_level, evolved_from, base_stats, stat_multipliers, skills) values
('job_swordman', 'Swordman', '1', 'Sword', '/assets/sprites/characters/1job/swordman_.png', '', 10, null, '{"hp":200,"atk":20,"def":15,"rec":5}', '{"hp":1.2,"atk":1.1,"def":1.0,"rec":0.8}', '[]'::jsonb),
('job_thief', 'Thief', '1', 'Thief', '/assets/sprites/characters/1job/thief_.png', '', 10, null, '{"hp":150,"atk":25,"def":8,"rec":10}', '{"hp":0.9,"atk":1.3,"def":0.7,"rec":1.0}', '[]'::jsonb),
('job_mage', 'Mage', '1', 'Magic', '/assets/sprites/characters/1job/mage_.png', '', 10, null, '{"hp":120,"atk":30,"def":5,"rec":25}', '{"hp":0.8,"atk":1.4,"def":0.5,"rec":1.3}', '[]'::jsonb),
('job_acolyte', 'Acolyte', '1', 'Heal', '/assets/sprites/characters/1job/acolyte_.png', '', 10, null, '{"hp":140,"atk":10,"def":10,"rec":30}', '{"hp":1.0,"atk":0.7,"def":0.8,"rec":1.5}', '[]'::jsonb),
('job_archer', 'Archer', '1', 'Bow', '/assets/sprites/characters/1job/archer_.png', '', 10, null, '{"hp":160,"atk":28,"def":8,"rec":8}', '{"hp":0.9,"atk":1.3,"def":0.6,"rec":0.9}', '[]'::jsonb),
('job_merchant', 'Merchant', '1', 'Trade', '/assets/sprites/characters/1job/merchant_.png', '', 10, null, '{"hp":180,"atk":15,"def":12,"rec":12}', '{"hp":1.1,"atk":0.9,"def":1.0,"rec":1.0}', '[]'::jsonb),
('job_knight', 'Knight', '2', 'Sword', '/assets/sprites/characters/2job/knight_.png', '', 10, 'job_swordman', '{"hp":350,"atk":35,"def":25,"rec":10}', '{"hp":1.4,"atk":1.3,"def":1.2,"rec":0.8}', '[]'::jsonb),
('job_assassin', 'Assassin', '2', 'Thief', '/assets/sprites/characters/2job/assasin_.png', '', 10, 'job_thief', '{"hp":250,"atk":45,"def":12,"rec":18}', '{"hp":1.0,"atk":1.6,"def":0.7,"rec":1.1}', '[]'::jsonb),
('job_wizard', 'Wizard', '2', 'Magic', '/assets/sprites/characters/2job/wizard_.png', '', 10, 'job_mage', '{"hp":200,"atk":55,"def":8,"rec":40}', '{"hp":0.8,"atk":1.8,"def":0.5,"rec":1.5}', '[]'::jsonb),
('job_priest', 'Priest', '2', 'Heal', '/assets/sprites/characters/2job/priest_.png', '', 10, 'job_acolyte', '{"hp":230,"atk":15,"def":15,"rec":50}', '{"hp":1.1,"atk":0.7,"def":0.9,"rec":1.8}', '[]'::jsonb),
('job_blacksmith', 'Blacksmith', '2', 'Trade', '/assets/sprites/characters/2job/blacksmith_.png', '', 10, 'job_merchant', '{"hp":300,"atk":25,"def":20,"rec":20}', '{"hp":1.3,"atk":1.1,"def":1.2,"rec":1.1}', '[]'::jsonb)
on conflict (id) do nothing;

insert into public.unit_definitions (id, name, title, element, rarity, max_level, job_id, max_job_level, cost, base_stats, skills) values
('u_sergio', 'Knight Sergio', 'ROGUE TIDE', 'Water', 3, 40, 'job_swordman', 50, 5, '{"hp":2050,"atk":600,"def":600,"rec":580}', '[{"id":"ls_sergio","type":"LEADER SKILL","title":"Tidal Command","description":"10% boost to Atk Power of Water units","iconType":"Flag"},{"id":"bb_sergio","type":"BRAVE BURST","title":"Aqua Slash","description":"5 combo Water attack on a single enemy","cost":18,"iconType":"Sparkles"}]'::jsonb),
('u_vargas', 'Vargas', 'EMBER VANGUARD', 'Fire', 4, 40, 'job_swordman', 50, 8, '{"hp":2400,"atk":850,"def":550,"rec":400}', '[{"id":"ls_vargas","type":"LEADER SKILL","title":"Flame March","description":"15% boost to Atk Power of Fire units","iconType":"Flag"}]'::jsonb),
('u_lance', 'Lance', 'STONE PIKEMAN', 'Earth', 3, 40, 'job_thief', 50, 6, '{"hp":3100,"atk":550,"def":800,"rec":350}', '[{"id":"ls_lance","type":"LEADER SKILL","title":"Earthen Wall","description":"10% boost to HP of Earth units","iconType":"Flag"}]'::jsonb),
('u_magress', 'Magress', 'SHADOW AEGIS', 'Dark', 5, 60, 'job_knight', 50, 12, '{"hp":4200,"atk":900,"def":950,"rec":200}', '[{"id":"ls_magress","type":"LEADER SKILL","title":"Dark Aegis","description":"15% boost to Def of Dark units","iconType":"Flag"},{"id":"ex_magress","type":"EXTRA SKILL","title":"Shadow Veil","description":"20% boost to all parameters","iconType":"Sword"}]'::jsonb),
('u_elys', 'Elys', 'SOLAR SAINT', 'Light', 6, 80, 'job_knight', 50, 15, '{"hp":4500,"atk":1200,"def":800,"rec":600}', '[{"id":"ls_elys","type":"LEADER SKILL","title":"Solar Blessing","description":"25% boost to Atk and 10% boost to HP of Light units","iconType":"Flag"}]'::jsonb)
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
