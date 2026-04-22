import type { StatBlock } from '@/backend-contracts/game';

export const LEVEL_MULTIPLIERS = {
  hp: 0.85,
  atk: 1.15,
  def: 0.80,
  rec: 1.10,
} as const;

export const DIFFICULTY_SETTINGS = {
  Normal: {
    expMultiplier: 1.0,
    zelMultiplier: 1.0,
    dropRate: 0.20,
    enemyHpMultiplier: 1.0,
    enemyAtkMultiplier: 1.0,
    energyMultiplier: 1.0,
  },
  Hard: {
    expMultiplier: 2.0,
    zelMultiplier: 2.0,
    dropRate: 0.40,
    enemyHpMultiplier: 1.8,
    enemyAtkMultiplier: 1.5,
    energyMultiplier: 1.5,
  },
  Heroic: {
    expMultiplier: 4.0,
    zelMultiplier: 4.0,
    dropRate: 0.70,
    enemyHpMultiplier: 3.0,
    enemyAtkMultiplier: 2.0,
    energyMultiplier: 2.0,
  },
} as const;

export const BASE_STATS = {
  Swordman: { hp: 250, atk: 35, def: 12, rec: 15 },
  Mage: { hp: 180, atk: 50, def: 8, rec: 35 },
  Archer: { hp: 220, atk: 45, def: 10, rec: 12 },
  Thief: { hp: 200, atk: 40, def: 10, rec: 15 },
  Acolyte: { hp: 190, atk: 15, def: 12, rec: 40 },
  Knight: { hp: 400, atk: 55, def: 30, rec: 20 },
  Wizard: { hp: 280, atk: 85, def: 10, rec: 50 },
  Assassin: { hp: 320, atk: 70, def: 15, rec: 25 },
  Priest: { hp: 300, atk: 25, def: 20, rec: 60 },
  Hunter: { hp: 350, atk: 70, def: 15, rec: 20 },
  Bard: { hp: 260, atk: 45, def: 12, rec: 30 },
  Dancer: { hp: 240, atk: 40, def: 10, rec: 35 },
} as const;

export const ENERGY_REGEN_INTERVAL = 10;
export const ENERGY_MAX_DEFAULT = 100;
export const ENERGY_START_DEFAULT = 50;

export const EXP_FORMULA = {
  base: 50,
  perLevel: 10,
} as const;

export const EXP_BY_DIFFICULTY = {
  Normal: { base: 50, perLevel: 10 },
  Hard: { base: 100, perLevel: 20 },
  Heroic: { base: 200, perLevel: 40 },
} as const;

export function calculateDamage(atk: number, def: number, level: number): number {
  const baseDmg = atk * (1 + level * 0.05);
  const mitigated = def * 0.40;
  return Math.max(1, Math.floor(baseDmg - mitigated));
}

export function calculateExpReward(level: number, difficulty: 'Normal' | 'Hard' | 'Heroic'): number {
  const settings = EXP_BY_DIFFICULTY[difficulty];
  return settings.base + level * settings.perLevel;
}

export function calculateZelReward(level: number, difficulty: 'Normal' | 'Hard' | 'Heroic'): number {
  const baseZel = 20 + level * 5;
  return Math.floor(baseZel * DIFFICULTY_SETTINGS[difficulty].zelMultiplier);
}

export function calculateEnemyStats(
  baseStats: StatBlock,
  difficulty: 'Normal' | 'Hard' | 'Heroic',
  enemyLevel: number
): StatBlock {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const levelBonus = 1 + (enemyLevel - 1) * 0.1;
  
  return {
    hp: Math.floor(baseStats.hp * settings.enemyHpMultiplier * levelBonus),
    atk: Math.floor(baseStats.atk * settings.enemyAtkMultiplier * levelBonus),
    def: Math.floor(baseStats.def * levelBonus),
    rec: Math.floor(baseStats.rec * levelBonus),
  };
}

export function scaleBaseStats(
  baseStats: StatBlock,
  level: number,
  multipliers: { hp: number; atk: number; def: number; rec: number } = LEVEL_MULTIPLIERS
): StatBlock {
  return {
    hp: Math.floor(baseStats.hp * (1 + (level - 1) * multipliers.hp)),
    atk: Math.floor(baseStats.atk * (1 + (level - 1) * multipliers.atk)),
    def: Math.floor(baseStats.def * (1 + (level - 1) * multipliers.def)),
    rec: Math.floor(baseStats.rec * (1 + (level - 1) * multipliers.rec)),
  };
}

export function getEnergyToRegen(energyMax: number, energyCurrent: number): number {
  return Math.max(0, energyMax - energyCurrent);
}

export function getTimeToFullEnergy(
  energyMax: number,
  energyCurrent: number,
  regenMinutes: number = ENERGY_REGEN_INTERVAL
): number {
  const energyNeeded = getEnergyToRegen(energyMax, energyCurrent);
  return energyNeeded * regenMinutes;
}

export function getDifficultyColor(difficulty: 'Normal' | 'Hard' | 'Heroic'): string {
  switch (difficulty) {
    case 'Normal': return '#4ade80';
    case 'Hard': return '#fbbf24';
    case 'Heroic': return '#f87171';
    default: return '#6a5a4a';
  }
}

export function getRarityColor(rarity: number): string {
  if (rarity >= 5) return '#ff6b35';
  if (rarity >= 4) return '#b388ff';
  if (rarity >= 3) return '#60a5fa';
  if (rarity >= 2) return '#4ade80';
  return '#9ca3af';
}

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}