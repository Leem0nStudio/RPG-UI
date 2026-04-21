import type { GameBootstrap, GameContent, JobDefinition } from '@/backend-contracts/game';

const fallbackJobs: JobDefinition[] = [
  { id: 'job_swordman', name: 'Swordman', tier: '1', category: 'Sword', spriteUrl: '/assets/sprites/characters/1job/swordman_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: null, baseStats: { hp: 200, atk: 20, def: 15, rec: 5 }, statMultipliers: { hp: 1.2, atk: 1.1, def: 1.0, rec: 0.8 }, skills: [] },
  { id: 'job_mage', name: 'Mage', tier: '1', category: 'Magic', spriteUrl: '/assets/sprites/characters/1job/mage_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: null, baseStats: { hp: 120, atk: 30, def: 5, rec: 25 }, statMultipliers: { hp: 0.8, atk: 1.4, def: 0.5, rec: 1.3 }, skills: [] },
  { id: 'job_archer', name: 'Archer', tier: '1', category: 'Bow', spriteUrl: '/assets/sprites/characters/1job/archer_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: null, baseStats: { hp: 160, atk: 28, def: 8, rec: 8 }, statMultipliers: { hp: 0.9, atk: 1.3, def: 0.6, rec: 0.9 }, skills: [] },
  { id: 'job_thief', name: 'Thief', tier: '1', category: 'Thief', spriteUrl: '/assets/sprites/characters/1job/thief_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: null, baseStats: { hp: 150, atk: 25, def: 8, rec: 10 }, statMultipliers: { hp: 0.9, atk: 1.3, def: 0.7, rec: 1.0 }, skills: [] },
  { id: 'job_acolyte', name: 'Acolyte', tier: '1', category: 'Heal', spriteUrl: '/assets/sprites/characters/1job/acolyte_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: null, baseStats: { hp: 140, atk: 10, def: 10, rec: 30 }, statMultipliers: { hp: 1.0, atk: 0.7, def: 0.8, rec: 1.5 }, skills: [] },
  { id: 'job_knight', name: 'Knight', tier: '2', category: 'Sword', spriteUrl: '/assets/sprites/characters/2job/knight_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: 'job_swordman', baseStats: { hp: 350, atk: 35, def: 25, rec: 10 }, statMultipliers: { hp: 1.4, atk: 1.3, def: 1.2, rec: 0.8 }, skills: [] },
  { id: 'job_wizard', name: 'Wizard', tier: '2', category: 'Magic', spriteUrl: '/assets/sprites/characters/2job/wizard_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: 'job_mage', baseStats: { hp: 200, atk: 55, def: 8, rec: 40 }, statMultipliers: { hp: 0.8, atk: 1.8, def: 0.5, rec: 1.5 }, skills: [] },
  { id: 'job_assassin', name: 'Assassin', tier: '2', category: 'Thief', spriteUrl: '/assets/sprites/characters/2job/assasin_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: 'job_thief', baseStats: { hp: 250, atk: 45, def: 12, rec: 18 }, statMultipliers: { hp: 1.0, atk: 1.6, def: 0.7, rec: 1.1 }, skills: [] },
  { id: 'job_priest', name: 'Priest', tier: '2', category: 'Heal', spriteUrl: '/assets/sprites/characters/2job/priest_.png', cssFilter: '', requiredJobLevel: 10, evolvedFrom: 'job_acolyte', baseStats: { hp: 230, atk: 15, def: 15, rec: 50 }, statMultipliers: { hp: 1.1, atk: 0.7, def: 0.9, rec: 1.8 }, skills: [] },
  { id: 'job_hunter', name: 'Hunter', tier: '2', category: 'Bow', spriteUrl: '/assets/sprites/characters/1job/archer_.png', cssFilter: 'saturate(1.2)', requiredJobLevel: 10, evolvedFrom: 'job_archer', baseStats: { hp: 280, atk: 45, def: 12, rec: 15 }, statMultipliers: { hp: 1.0, atk: 1.5, def: 0.7, rec: 1.0 }, skills: [] },
];

const getSprite = (jobId: string) => {
  const job = fallbackJobs.find(j => j.id === jobId);
  return job ? { spriteUrl: job.spriteUrl, cssFilter: job.cssFilter } : { spriteUrl: '', cssFilter: '' };
};

const fallbackUnits = [
  { id: 'u_hero_1', name: 'Knight', title: 'BRAVE SOLDIER', element: 'Water' as const, rarity: 3, maxLevel: 40, jobId: 'job_swordman', maxJobLevel: 50, cost: 5, baseStats: { hp: 2050, atk: 600, def: 600, rec: 580 }, skills: [] },
  { id: 'u_hero_2', name: 'Mage', title: 'FLAME ARCHER', element: 'Fire' as const, rarity: 3, maxLevel: 40, jobId: 'job_mage', maxJobLevel: 50, cost: 5, baseStats: { hp: 1500, atk: 750, def: 300, rec: 450 }, skills: [] },
  { id: 'u_hero_3', name: 'Archer', title: 'WIND HUNTER', element: 'Earth' as const, rarity: 3, maxLevel: 40, jobId: 'job_archer', maxJobLevel: 50, cost: 5, baseStats: { hp: 1800, atk: 650, def: 400, rec: 350 }, skills: [] },
].map(u => ({ ...u, ...getSprite(u.jobId) }));

const fallbackItems = [
  { id: 'w_iron_sword', name: 'Iron Sword', type: 'Weapon' as const, rarity: 1, description: 'A basic sword.', stats: { hp: 0, atk: 50, def: 0, rec: 0 }, sprite: { col: 0, row: 0 }, effects: [] },
  { id: 'a_wood_shield', name: 'Wood Shield', type: 'Armor' as const, rarity: 1, description: 'A basic shield.', stats: { hp: 100, atk: 0, def: 30, rec: 0 }, sprite: { col: 1, row: 0 }, effects: [] },
  { id: 'ac_power_ring', name: 'Power Ring', type: 'Accessory' as const, rarity: 1, description: 'Increases attack.', stats: { hp: 20, atk: 20, def: 0, rec: 0 }, sprite: { col: 2, row: 0 }, effects: [] },
];

const fallbackQuests = [
  { id: 'quest_tutorial_1', worldId: 'world_tutorial', stage: 1, name: 'First Battle', energyCost: 0, difficulty: 'Normal' as const, enemyIds: ['enemy_slime'], rewardsPreview: ['EXP x50', 'Zel x100'] },
  { id: 'quest_forest_1', worldId: 'world_forest', stage: 1, name: 'Forest Ambush', energyCost: 5, difficulty: 'Normal' as const, enemyIds: ['enemy_goblin'], rewardsPreview: ['EXP x100', 'Zel x200'] },
  { id: 'quest_forest_2', worldId: 'world_forest', stage: 2, name: 'Wolf Pack', energyCost: 7, difficulty: 'Normal' as const, enemyIds: ['enemy_wolf'], rewardsPreview: ['EXP x150', 'Zel x300'] },
  { id: 'quest_cave_1', worldId: 'world_cave', stage: 1, name: 'Dark Cave', energyCost: 10, difficulty: 'Hard' as const, enemyIds: ['enemy_bat'], rewardsPreview: ['EXP x250', 'Zel x500'] },
];

const fallbackBanners = [
  { id: 'banner_starter', name: 'Starter Summon', cost: 5, currency: 'gems' as const, featuredUnitIds: ['u_hero_1', 'u_hero_2', 'u_hero_3'], description: 'Basic units banner.', active: true },
];

export const gameContent: GameContent = {
  units: fallbackUnits,
  items: fallbackItems,
  quests: fallbackQuests,
  banners: fallbackBanners,
  jobs: fallbackJobs,
};

export const bootstrapData: GameBootstrap = {
  player: {
    id: 'player_local',
    name: 'Hero',
    level: 1,
    energy: { current: 50, max: 50, recoverAt: null },
    currencies: { gems: 100, zel: 1000, karma: 100 },
  },
  roster: [
    { instanceId: 'owned_1', unitId: 'u_hero_1', level: 1, exp: 0, jobId: 'job_swordman', jobLevel: 1, jobExp: 0, locked: false, equipment: { Weapon: null, Armor: null, Accessory: null } },
    { instanceId: 'owned_2', unitId: 'u_hero_2', level: 1, exp: 0, jobId: 'job_mage', jobLevel: 1, jobExp: 0, locked: false, equipment: { Weapon: null, Armor: null, Accessory: null } },
    { instanceId: 'owned_3', unitId: 'u_hero_3', level: 1, exp: 0, jobId: 'job_archer', jobLevel: 1, jobExp: 0, locked: false, equipment: { Weapon: null, Armor: null, Accessory: null } },
  ],
  items: [
    { itemId: 'w_iron_sword', quantity: 1 },
    { itemId: 'a_wood_shield', quantity: 1 },
    { itemId: 'ac_power_ring', quantity: 2 },
  ],
  content: gameContent,
};

export const defaultPlayerProfile = bootstrapData.player;
export const defaultRoster = bootstrapData.roster;
export const defaultInventory = bootstrapData.items;