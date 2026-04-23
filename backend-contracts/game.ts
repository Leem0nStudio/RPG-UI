import { z } from 'zod';

export const elementSchema = z.enum(['Fire', 'Water', 'Earth', 'Light', 'Dark']);
export type Element = z.infer<typeof elementSchema>;

export const currencySchema = z.enum(['gems', 'zel', 'karma']);
export type CurrencyCode = z.infer<typeof currencySchema>;

export const jobTierSchema = z.enum(['1', '2', '3']);
export type JobTier = z.infer<typeof jobTierSchema>;

export const jobCategorySchema = z.enum(['Sword', 'Magic', 'Bow', 'Thief', 'Trade', 'Heal']);
export type JobCategory = z.infer<typeof jobCategorySchema>;

export const genderSchema = z.enum(['male', 'female', 'neutral']);
export type Gender = z.infer<typeof genderSchema>;

export const statBlockSchema = z.object({
  hp: z.number().int().nonnegative(),
  atk: z.number().int().nonnegative(),
  def: z.number().int().nonnegative(),
  rec: z.number().int().nonnegative(),
});
export type StatBlock = z.infer<typeof statBlockSchema>;

export const itemTypeSchema = z.enum(['Weapon', 'Armor', 'Accessory']);
export type ItemType = z.infer<typeof itemTypeSchema>;

export const skillDefinitionSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  cost: z.union([z.number(), z.string()]).optional(),
  iconType: z.string().optional(),
});
export type SkillDefinition = z.infer<typeof skillDefinitionSchema>;

export const jobDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: jobTierSchema,
  category: jobCategorySchema,
  spriteUrl: z.string(),
  cssFilter: z.string().default(''),
  requiredJobLevel: z.number().int().positive().default(10),
  evolvedFrom: z.string().nullable(),
  baseStats: statBlockSchema,
  statMultipliers: z.object({
    hp: z.number().min(0).default(1),
    atk: z.number().min(0).default(1),
    def: z.number().min(0).default(1),
    rec: z.number().min(0).default(1),
  }).default({ hp: 1, atk: 1, def: 1, rec: 1 }),
  skills: z.array(skillDefinitionSchema).default([]),
  allowedGenders: z.array(genderSchema).optional(),
});
export type JobDefinition = z.infer<typeof jobDefinitionSchema>;

export const unitDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  element: elementSchema,
  rarity: z.number().int().min(1).max(10),
  maxLevel: z.number().int().positive(),
  jobId: z.string(),
  maxJobLevel: z.number().int().positive().default(50),
  cost: z.number().int().nonnegative(),
  baseStats: statBlockSchema,
  spriteUrl: z.string().optional(),
  cssFilter: z.string().optional(),
  skills: z.array(skillDefinitionSchema),
  gender: genderSchema.optional(),
});
export type UnitDefinition = z.infer<typeof unitDefinitionSchema>;

export const itemDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: itemTypeSchema,
  rarity: z.number().int().min(1).max(10),
  description: z.string(),
  stats: statBlockSchema,
  effects: z.array(z.string()).optional(),
  sprite: z.object({
    col: z.number().int().nonnegative(),
    row: z.number().int().nonnegative(),
    className: z.string().optional(),
  }),
});
export type ItemDefinition = z.infer<typeof itemDefinitionSchema>;

export const questDefinitionSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  stage: z.number().int().positive(),
  name: z.string(),
  energyCost: z.number().int().nonnegative(),
  difficulty: z.enum(['Normal', 'Hard', 'Heroic']),
  enemyIds: z.array(z.string()),
  rewardsPreview: z.array(z.string()),
  baseLevel: z.number().int().positive().optional(),
});
export type QuestDefinition = z.infer<typeof questDefinitionSchema>;

export const enemyDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().nullable().optional(),
  element: elementSchema,
  rarity: z.number().int().min(1).max(10),
  maxLevel: z.number().int().positive(),
  baseStats: statBlockSchema,
  spriteUrl: z.string().nullable().optional(),
  cssFilter: z.string().nullable().optional(),
  skills: z.array(skillDefinitionSchema).default([]),
  aiType: z.enum(['aggressive', 'defensive', 'balanced', 'boss']).default('aggressive'),
  expReward: z.number().int().nonnegative().default(10),
  zelReward: z.number().int().nonnegative().default(50),
  itemDrops: z.array(z.object({
    itemId: z.string(),
    chance: z.number().min(0).max(1),
    quantity: z.number().int().positive(),
  })).default([]),
});
export type EnemyDefinition = z.infer<typeof enemyDefinitionSchema>;

export const battleStateSchema = z.object({
  questId: z.string().nullable(),
  enemyInstanceId: z.string(),
  enemyHp: z.number().int().nonnegative(),
  enemyMaxHp: z.number().int().nonnegative(),
  enemyElement: elementSchema,
  playerUnits: z.array(z.object({
    instanceId: z.string(),
    currentHp: z.number().int().nonnegative(),
    bbGauge: z.number().min(0).max(100),
  })),
  battlePhase: z.enum(['player_turn', 'enemy_turn', 'victory', 'defeat']),
  turnNumber: z.number().int().nonnegative(),
});
export type BattleState = z.infer<typeof battleStateSchema>;

export const summonBannerSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number().int().positive(),
  currency: currencySchema,
  featuredUnitIds: z.array(z.string()),
  description: z.string(),
  active: z.boolean(),
});
export type SummonBanner = z.infer<typeof summonBannerSchema>;

export const ownedUnitSchema = z.object({
  instanceId: z.string(),
  unitId: z.string(),
  level: z.number().int().positive(),
  exp: z.number().int().nonnegative(),
  jobId: z.string(),
  jobLevel: z.number().int().positive().default(1),
  jobExp: z.number().int().nonnegative().default(0),
  locked: z.boolean().default(false),
  equipment: z.object({
    Weapon: z.string().nullable(),
    Armor: z.string().nullable(),
    Accessory: z.string().nullable(),
  }),
});
export type OwnedUnit = z.infer<typeof ownedUnitSchema>;

export const playerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().int().positive(),
  energy: z.object({
    current: z.number().int().nonnegative(),
    max: z.number().int().positive(),
    recoverAt: z.string().datetime().nullable(),
  }),
  currencies: z.record(currencySchema, z.number().int().nonnegative()),
});
export type PlayerProfile = z.infer<typeof playerProfileSchema>;

export const gameContentSchema = z.object({
  units: z.array(unitDefinitionSchema),
  items: z.array(itemDefinitionSchema),
  quests: z.array(questDefinitionSchema),
  banners: z.array(summonBannerSchema),
  jobs: z.array(jobDefinitionSchema),
  enemies: z.array(enemyDefinitionSchema),
});
export type GameContent = z.infer<typeof gameContentSchema>;

export const gameBootstrapSchema = z.object({
  player: playerProfileSchema,
  roster: z.array(ownedUnitSchema),
  items: z.array(z.object({ itemId: z.string(), quantity: z.number().int().nonnegative() })),
  content: gameContentSchema,
});
export type GameBootstrap = z.infer<typeof gameBootstrapSchema>;
