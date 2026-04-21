import type { GameBootstrap, GameContent, PlayerProfile, OwnedUnit, SummonBanner, QuestDefinition } from '@/backend-contracts/game';

const units: GameContent['units'] = [
  {
    id: 'u_sergio',
    name: 'Knight Sergio',
    title: 'ROGUE TIDE',
    element: 'Water',
    rarity: 3,
    maxLevel: 40,
    cost: 5,
    baseStats: { hp: 2050, atk: 600, def: 600, rec: 580 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0) hue-rotate(0deg)',
    skills: [
      { id: 'ls_sergio', type: 'LEADER SKILL', title: 'Tidal Command', description: '10% boost to Atk Power of Water units', iconType: 'Flag' },
      { id: 'bb_sergio', type: 'BRAVE BURST', title: 'Aqua Slash', description: '5 combo Water attack on a single enemy', cost: 18, iconType: 'Sparkles' },
    ],
  },
  {
    id: 'u_vargas',
    name: 'Vargas',
    title: 'EMBER VANGUARD',
    element: 'Fire',
    rarity: 4,
    maxLevel: 40,
    cost: 8,
    baseStats: { hp: 2400, atk: 850, def: 550, rec: 400 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.5) saturate(2) hue-rotate(-50deg)',
    skills: [
      { id: 'ls_vargas', type: 'LEADER SKILL', title: 'Flame March', description: '15% boost to Atk Power of Fire units', iconType: 'Flag' },
      { id: 'bb_vargas', type: 'BRAVE BURST', title: 'Flare Ride', description: '8 combo Fire attack on all enemies', cost: 22, iconType: 'Sparkles' },
    ],
  },
  {
    id: 'u_lance',
    name: 'Lance',
    title: 'STONE PIKEMAN',
    element: 'Earth',
    rarity: 3,
    maxLevel: 40,
    cost: 6,
    baseStats: { hp: 3100, atk: 550, def: 800, rec: 350 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.5) saturate(1.5) hue-rotate(80deg)',
    skills: [
      { id: 'ls_lance', type: 'LEADER SKILL', title: 'Earthen Wall', description: '10% boost to HP of Earth units', iconType: 'Flag' },
      { id: 'bb_lance', type: 'BRAVE BURST', title: 'Tremor Strike', description: '6 combo Earth attack on all enemies', cost: 20, iconType: 'Sparkles' },
    ],
  },
  {
    id: 'u_magress',
    name: 'Magress',
    title: 'SHADOW AEGIS',
    element: 'Dark',
    rarity: 5,
    maxLevel: 60,
    cost: 12,
    baseStats: { hp: 4200, atk: 900, def: 950, rec: 200 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.8) hue-rotate(220deg) saturate(0.5) brightness(0.8)',
    skills: [
      { id: 'ls_magress', type: 'LEADER SKILL', title: 'Dark Aegis', description: '15% boost to Def of Dark units', iconType: 'Flag' },
      { id: 'bb_magress', type: 'BRAVE BURST', title: 'Void Cleave', description: '7 combo Dark attack on all enemies', cost: 24, iconType: 'Sparkles' },
      { id: 'ex_magress', type: 'EXTRA SKILL', title: 'Shadow Veil', description: '20% boost to all parameters with the right Sphere', iconType: 'Sword' },
    ],
  },
  {
    id: 'u_elys',
    name: 'Elys',
    title: 'SOLAR SAINT',
    element: 'Light',
    rarity: 6,
    maxLevel: 80,
    cost: 15,
    baseStats: { hp: 4500, atk: 1200, def: 800, rec: 600 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.2) saturate(1.4) hue-rotate(10deg) brightness(1.25)',
    skills: [
      { id: 'ls_elys', type: 'LEADER SKILL', title: 'Solar Blessing', description: '25% boost to Atk and 10% boost to HP of Light units', iconType: 'Flag' },
      { id: 'bb_elys', type: 'BRAVE BURST', title: 'Halo Breaker', description: '12 combo Light attack on all enemies', cost: 30, iconType: 'Sparkles' },
    ],
  },
];

const items: GameContent['items'] = [
  {
    id: 'w_brave_sword',
    name: 'Brave Sword',
    type: 'Weapon',
    rarity: 3,
    description: 'A standard sword assigned to brave warriors.',
    stats: { hp: 0, atk: 120, def: 0, rec: 0 },
    sprite: { col: 2, row: 0, className: 'drop-shadow-[0_2px_4px_#111]' },
    effects: ['10% chance to ignore enemy DEF'],
  },
  {
    id: 'w_flame_dagger',
    name: 'Flame Dagger',
    type: 'Weapon',
    rarity: 4,
    description: 'A dagger imbued with ember magic.',
    stats: { hp: 0, atk: 250, def: 0, rec: 50 },
    sprite: { col: 0, row: 2, className: 'drop-shadow-[0_2px_4px_#311]' },
    effects: ['Adds Fire element to attacks', '15% boost to Spark damage'],
  },
  {
    id: 'a_knight_shield',
    name: 'Knight Shield',
    type: 'Armor',
    rarity: 3,
    description: 'A sturdy iron shield.',
    stats: { hp: 200, atk: 0, def: 150, rec: 0 },
    sprite: { col: 3, row: 0, className: 'drop-shadow-[0_2px_4px_#111]' },
    effects: ['Reduces damage taken by 5%'],
  },
  {
    id: 'a_aura_plate',
    name: 'Aura Plate',
    type: 'Armor',
    rarity: 5,
    description: 'Legendary plate glowing with aura.',
    stats: { hp: 500, atk: 0, def: 400, rec: 100 },
    sprite: { col: 1, row: 1, className: 'drop-shadow-[0_2px_4px_#111]' },
    effects: ['Negates all status ailments', 'Restores HP each turn'],
  },
  {
    id: 'ac_hero_ring',
    name: 'Hero Ring',
    type: 'Accessory',
    rarity: 4,
    description: 'Boosts all stats slightly.',
    stats: { hp: 100, atk: 50, def: 50, rec: 50 },
    sprite: { col: 0, row: 1, className: 'drop-shadow-[0_2px_4px_#111]' },
  },
  {
    id: 'ac_recovery_amulet',
    name: 'Recovery Amulet',
    type: 'Accessory',
    rarity: 3,
    description: 'Enhances healing capability.',
    stats: { hp: 0, atk: 0, def: 0, rec: 300 },
    sprite: { col: 1, row: 0, className: 'drop-shadow-[0_2px_4px_#111]' },
    effects: ['Boosts BC and HC drop rate by 10%'],
  },
];

const quests: QuestDefinition[] = [
  {
    id: 'quest_evergreen_1',
    worldId: 'world_evergreen',
    stage: 1,
    name: 'Echoes of the Grove',
    energyCost: 5,
    difficulty: 'Normal',
    enemyIds: ['enemy_mimic', 'enemy_wisp', 'enemy_golem'],
    rewardsPreview: ['Zel x250', 'Karma x150', 'Potion', '1* Material'],
  },
  {
    id: 'quest_evergreen_2',
    worldId: 'world_evergreen',
    stage: 2,
    name: 'Sunlit Rift',
    energyCost: 7,
    difficulty: 'Normal',
    enemyIds: ['enemy_paladin', 'enemy_sprite', 'enemy_archer'],
    rewardsPreview: ['Zel x350', 'Karma x220', 'Fire Ore', 'Burst Crystal'],
  },
  {
    id: 'quest_abyss_1',
    worldId: 'world_abyss',
    stage: 1,
    name: 'Abyss Watch',
    energyCost: 9,
    difficulty: 'Hard',
    enemyIds: ['enemy_crawler', 'enemy_warden', 'enemy_magus'],
    rewardsPreview: ['Zel x500', 'Karma x300', 'Dark Relic', 'Evolution Totem'],
  },
];

const banners: SummonBanner[] = [
  {
    id: 'banner_origin_light',
    name: 'Origin of Light',
    cost: 5,
    currency: 'gems',
    featuredUnitIds: ['u_elys', 'u_magress'],
    description: 'Light and Dark featured rate-up banner with a guaranteed 4* or higher on multi.',
    active: true,
  },
];

export const defaultPlayerProfile: PlayerProfile = {
  id: 'player_local',
  name: 'Uptodown',
  level: 1,
  energy: {
    current: 18,
    max: 20,
    recoverAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
  },
  currencies: {
    gems: 25,
    zel: 6420,
    karma: 1606,
  },
};

export const defaultRoster: OwnedUnit[] = [
  { instanceId: 'owned_sergio_1', unitId: 'u_sergio', level: 1, exp: 0, locked: false, equipment: { Weapon: null, Armor: null, Accessory: null } },
  { instanceId: 'owned_vargas_1', unitId: 'u_vargas', level: 12, exp: 120, locked: false, equipment: { Weapon: null, Armor: null, Accessory: null } },
  { instanceId: 'owned_lance_1', unitId: 'u_lance', level: 25, exp: 800, locked: false, equipment: { Weapon: null, Armor: null, Accessory: null } },
  { instanceId: 'owned_magress_1', unitId: 'u_magress', level: 30, exp: 4500, locked: true, equipment: { Weapon: null, Armor: null, Accessory: null } },
];

export const gameContent: GameContent = {
  units,
  items,
  quests,
  banners,
};

export const bootstrapData: GameBootstrap = {
  player: defaultPlayerProfile,
  roster: defaultRoster,
  items: [
    { itemId: 'w_brave_sword', quantity: 1 },
    { itemId: 'w_flame_dagger', quantity: 1 },
    { itemId: 'a_knight_shield', quantity: 1 },
    { itemId: 'a_aura_plate', quantity: 1 },
    { itemId: 'ac_hero_ring', quantity: 1 },
    { itemId: 'ac_recovery_amulet', quantity: 2 },
  ],
  content: gameContent,
};

