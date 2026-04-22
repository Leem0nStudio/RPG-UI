import type { GameBootstrap, GameContent, JobDefinition, EnemyDefinition } from '@/backend-contracts/game';

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
  { id: 'u_sergio', name: 'Sergio', title: 'NOVICE', element: 'Water' as const, rarity: 3, maxLevel: 50, jobId: 'job_swordman', maxJobLevel: 50, cost: 5, baseStats: { hp: 2000, atk: 550, def: 500, rec: 300 }, skills: [] },
  { id: 'u_vargas', name: 'Vargas', title: 'SOLDIER', element: 'Water' as const, rarity: 4, maxLevel: 60, jobId: 'job_swordman', maxJobLevel: 50, cost: 5, baseStats: { hp: 3500, atk: 800, def: 700, rec: 400 }, skills: [] },
  { id: 'u_lance', name: 'Lance', title: 'ROGUE', element: 'Dark' as const, rarity: 4, maxLevel: 80, jobId: 'job_thief', maxJobLevel: 50, cost: 5, baseStats: { hp: 2800, atk: 950, def: 400, rec: 350 }, skills: [] },
  { id: 'u_magress', name: 'Magress', title: 'GUARDIAN', element: 'Earth' as const, rarity: 5, maxLevel: 100, jobId: 'job_knight', maxJobLevel: 50, cost: 5, baseStats: { hp: 5000, atk: 650, def: 1200, rec: 500 }, skills: [] },
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
  { id: 'quest_1', worldId: 'prontera', stage: 1, name: 'First Steps', energyCost: 5, difficulty: 'Normal' as const, enemyIds: ['enemy_slime'], rewardsPreview: ['10 EXP', '20 Zel'] },
  { id: 'quest_2', worldId: 'prontera', stage: 2, name: 'Forest Ambush', energyCost: 5, difficulty: 'Normal' as const, enemyIds: ['enemy_goblin'], rewardsPreview: ['25 EXP', '50 Zel'] },
  { id: 'quest_3', worldId: 'prontera', stage: 3, name: 'Wolf Pack', energyCost: 7, difficulty: 'Normal' as const, enemyIds: ['enemy_wolf'], rewardsPreview: ['40 EXP', '80 Zel'] },
  { id: 'quest_4', worldId: 'prontera', stage: 4, name: 'Cave Explorer', energyCost: 10, difficulty: 'Normal' as const, enemyIds: ['enemy_bat'], rewardsPreview: ['60 EXP', '120 Zel'] },
  { id: 'quest_5', worldId: 'prontera', stage: 5, name: 'Fire Dungeon', energyCost: 12, difficulty: 'Hard' as const, enemyIds: ['enemy_salamander', 'enemy_ifrit'], rewardsPreview: ['80 EXP', '200 Zel'] },
  { id: 'quest_6', worldId: 'prontera', stage: 6, name: 'Water Temple', energyCost: 15, difficulty: 'Hard' as const, enemyIds: ['enemy_sea_serpent', 'enemy_siren'], rewardsPreview: ['100 EXP', '300 Zel'] },
  { id: 'quest_7', worldId: 'prontera', stage: 7, name: 'Earth Guardian', energyCost: 18, difficulty: 'Hard' as const, enemyIds: ['enemy_golem'], rewardsPreview: ['120 EXP', '400 Zel'] },
  { id: 'quest_8', worldId: 'prontera', stage: 8, name: 'Dark Dungeon', energyCost: 20, difficulty: 'Heroic' as const, enemyIds: ['enemy_shadow', 'enemy_demon'], rewardsPreview: ['150 EXP', '500 Zel'] },
  { id: 'quest_9', worldId: 'prontera', stage: 9, name: 'Light Temple', energyCost: 22, difficulty: 'Heroic' as const, enemyIds: ['enemy_spark', 'enemy_angel'], rewardsPreview: ['180 EXP', '600 Zel'] },
  { id: 'quest_10', worldId: 'prontera', stage: 10, name: 'Final Boss', energyCost: 30, difficulty: 'Heroic' as const, enemyIds: ['enemy_titan'], rewardsPreview: ['300 EXP', '1000 Zel'] },
];

const fallbackEnemies: EnemyDefinition[] = [
  { id: 'enemy_slime', name: 'Slime', title: 'Gelatinous Blob', element: 'Water', rarity: 1, maxLevel: 10, baseStats: { hp: 80, atk: 15, def: 5, rec: 5 }, skills: [], aiType: 'defensive', expReward: 10, zelReward: 20, itemDrops: [] },
  { id: 'enemy_goblin', name: 'Goblin', title: 'Forest Scavenger', element: 'Earth', rarity: 2, maxLevel: 15, baseStats: { hp: 150, atk: 35, def: 10, rec: 8 }, skills: [], aiType: 'aggressive', expReward: 25, zelReward: 50, itemDrops: [] },
  { id: 'enemy_wolf', name: 'Wolf', title: 'Wild Beast', element: 'Earth', rarity: 2, maxLevel: 20, baseStats: { hp: 200, atk: 45, def: 12, rec: 10 }, skills: [], aiType: 'aggressive', expReward: 40, zelReward: 80, itemDrops: [] },
  { id: 'enemy_bat', name: 'Bat', title: 'Cave Dweller', element: 'Dark', rarity: 3, maxLevel: 25, baseStats: { hp: 180, atk: 55, def: 8, rec: 15 }, skills: [], aiType: 'balanced', expReward: 60, zelReward: 120, itemDrops: [] },
  // Add all enemies that quests reference
  { id: 'enemy_salamander', name: 'Salamander', title: 'Flame Lizard', element: 'Fire', rarity: 2, maxLevel: 30, baseStats: { hp: 800, atk: 85, def: 45, rec: 35 }, skills: [], aiType: 'aggressive', expReward: 15, zelReward: 80, itemDrops: [] },
  { id: 'enemy_ifrit', name: 'Ifrit', title: 'Flame Spirit', element: 'Fire', rarity: 4, maxLevel: 50, baseStats: { hp: 1800, atk: 160, def: 80, rec: 55 }, skills: [], aiType: 'aggressive', expReward: 35, zelReward: 180, itemDrops: [] },
  { id: 'enemy_sea_serpent', name: 'Sea Serpent', title: 'Ocean Serpent', element: 'Water', rarity: 2, maxLevel: 30, baseStats: { hp: 900, atk: 65, def: 55, rec: 50 }, skills: [], aiType: 'balanced', expReward: 15, zelReward: 85, itemDrops: [] },
  { id: 'enemy_siren', name: 'Siren', title: 'Ocean Song', element: 'Water', rarity: 4, maxLevel: 50, baseStats: { hp: 1600, atk: 140, def: 95, rec: 90 }, skills: [], aiType: 'defensive', expReward: 35, zelReward: 175, itemDrops: [] },
  { id: 'enemy_golem', name: 'Stone Golem', title: 'Earth Guardian', element: 'Earth', rarity: 3, maxLevel: 40, baseStats: { hp: 1500, atk: 70, def: 90, rec: 30 }, skills: [], aiType: 'defensive', expReward: 25, zelReward: 120, itemDrops: [] },
  { id: 'enemy_titan', name: 'Titan', title: 'Earth Giant', element: 'Earth', rarity: 5, maxLevel: 60, baseStats: { hp: 3000, atk: 140, def: 160, rec: 50 }, skills: [], aiType: 'boss', expReward: 50, zelReward: 250, itemDrops: [] },
  { id: 'enemy_spark', name: 'Spark Sprite', title: 'Light Wisp', element: 'Light', rarity: 2, maxLevel: 30, baseStats: { hp: 600, atk: 95, def: 35, rec: 70 }, skills: [], aiType: 'aggressive', expReward: 12, zelReward: 70, itemDrops: [] },
  { id: 'enemy_angel', name: 'Fallen Angel', title: 'Dark Light', element: 'Light', rarity: 4, maxLevel: 50, baseStats: { hp: 1400, atk: 180, def: 70, rec: 100 }, skills: [], aiType: 'balanced', expReward: 30, zelReward: 160, itemDrops: [] },
  { id: 'enemy_shadow', name: 'Shadow Beast', title: 'Dark Hunter', element: 'Dark', rarity: 2, maxLevel: 30, baseStats: { hp: 700, atk: 100, def: 40, rec: 40 }, skills: [], aiType: 'aggressive', expReward: 15, zelReward: 75, itemDrops: [] },
  { id: 'enemy_demon', name: 'Lesser Demon', title: 'Hell Spawn', element: 'Dark', rarity: 5, maxLevel: 60, baseStats: { hp: 2200, atk: 200, def: 100, rec: 65 }, skills: [], aiType: 'boss', expReward: 45, zelReward: 220, itemDrops: [] },
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
  enemies: fallbackEnemies,
};

export const bootstrapData: GameBootstrap = {
  player: {
    id: 'player_local',
    name: 'Hero',
    level: 1,
    energy: { current: 50, max: 50, recoverAt: null },
    currencies: { gems: 25, zel: 1000, karma: 100 },
  },
  roster: [],
  items: [],
  content: gameContent,
};

export const defaultPlayerProfile = bootstrapData.player;
export const defaultRoster = bootstrapData.roster;
export const defaultInventory = bootstrapData.items;