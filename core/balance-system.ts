export interface PlayerBattleMetrics {
  playerId: string;
  totalBattles: number;
  winsByDifficulty: { Normal: number; Hard: number; Heroic: number };
  lossesByDifficulty: { Normal: number; Hard: number; Heroic: number };
  totalDamageDealt: number;
  totalDamageTaken: number;
  enemiesKilled: number;
  unitsLost: number;
  lastUpdated: string;
}

export interface DifficultyConfig {
  name: 'Normal' | 'Hard' | 'Heroic';
  targetWinRate: number;
  hpMultiplier: number;
  atkMultiplier: number;
  expMultiplier: number;
  zelMultiplier: number;
}

export const DIFFICULTY_PRESETS: Record<string, DifficultyConfig> = {
  Normal: {
    name: 'Normal',
    targetWinRate: 0.85,
    hpMultiplier: 1.0,
    atkMultiplier: 1.0,
    expMultiplier: 1.0,
    zelMultiplier: 1.0,
  },
  Hard: {
    name: 'Hard',
    targetWinRate: 0.70,
    hpMultiplier: 1.8,
    atkMultiplier: 1.5,
    expMultiplier: 2.0,
    zelMultiplier: 2.0,
  },
  Heroic: {
    name: 'Heroic',
    targetWinRate: 0.50,
    hpMultiplier: 3.0,
    atkMultiplier: 2.0,
    expMultiplier: 4.0,
    zelMultiplier: 4.0,
  },
};

export const LEVEL_DIFF_BONUS = 0.05;
export const MIN_REWARD_MODIFIER = 0.7;
export const MAX_REWARD_MODIFIER = 1.5;

export async function getPlayerMetrics(
  playerId: string,
  supabase: any = null
): Promise<PlayerBattleMetrics> {
  if (!supabase) {
    return getDefaultMetrics(playerId);
  }

  const { data, error } = await (supabase.from as any)('player_battle_metrics')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error || !data) {
    return getDefaultMetrics(playerId);
  }

  const row = data as any;
  return {
    playerId: row.player_id,
    totalBattles: row.total_battles,
    winsByDifficulty: row.wins_by_difficulty,
    lossesByDifficulty: row.losses_by_difficulty,
    totalDamageDealt: row.total_damage_dealt,
    totalDamageTaken: row.total_damage_taken,
    enemiesKilled: row.enemies_killed,
    unitsLost: row.units_lost,
    lastUpdated: row.updated_at,
  };
}

export function getDefaultMetrics(playerId: string): PlayerBattleMetrics {
  return {
    playerId,
    totalBattles: 0,
    winsByDifficulty: { Normal: 0, Hard: 0, Heroic: 0 },
    lossesByDifficulty: { Normal: 0, Hard: 0, Heroic: 0 },
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    enemiesKilled: 0,
    unitsLost: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function calculateWinRate(metrics: PlayerBattleMetrics, difficulty: string): number {
  if (metrics.totalBattles === 0) return 0.5;
  
  const wins = metrics.winsByDifficulty[difficulty as keyof typeof metrics.winsByDifficulty] || 0;
  const losses = metrics.lossesByDifficulty[difficulty as keyof typeof metrics.lossesByDifficulty] || 0;
  const total = wins + losses;
  
  if (total === 0) return 0.5;
  return wins / total;
}

export function calculateDifficultyAdjustment(metrics: PlayerBattleMetrics): number {
  const normalWinRate = calculateWinRate(metrics, 'Normal');
  const hardWinRate = calculateWinRate(metrics, 'Hard');
  const heroicWinRate = calculateWinRate(metrics, 'Heroic');
  
  const avgWinRate = (normalWinRate + hardWinRate + heroicWinRate) / 3;
  const diff = avgWinRate - 0.7;
  
  if (diff > 0.15) {
    return 1.2;
  } else if (diff > 0.05) {
    return 1.1;
  } else if (diff > -0.05) {
    return 1.0;
  } else if (diff > -0.15) {
    return 0.9;
  }
  
  return 0.8;
}

export function calculateRewardModifier(
  playerLevel: number,
  enemyLevel: number
): number {
  const levelDiff = enemyLevel - playerLevel;
  const bonus = levelDiff * LEVEL_DIFF_BONUS;
  
  return Math.max(MIN_REWARD_MODIFIER, Math.min(MAX_REWARD_MODIFIER, 1 + bonus));
}

export function calculateEnemyLevelScaler(
  baseEnemyLevel: number,
  playerLevel: number,
  difficulty: string
): number {
  const config = DIFFICULTY_PRESETS[difficulty];
  if (!config) return baseEnemyLevel;
  
  const avgLevel = (baseEnemyLevel + playerLevel) / 2;
  const scalingFactor = config.hpMultiplier;
  
  return Math.round(avgLevel * scalingFactor);
}

export async function recordBattleOutcome(
  playerId: string,
  difficulty: string,
  victory: boolean,
  damageDealt: number,
  damageTaken: number,
  enemiesKilled: number,
  unitsLost: number,
  supabase: any = null
): Promise<void> {
  if (!supabase) return;
  
  const currentMetrics = await getPlayerMetrics(playerId, supabase);
  
  const updates: any = {
    player_id: playerId,
    total_battles: currentMetrics.totalBattles + 1,
    total_damage_dealt: currentMetrics.totalDamageDealt + damageDealt,
    total_damage_taken: currentMetrics.totalDamageTaken + damageTaken,
    enemies_killed: currentMetrics.enemiesKilled + enemiesKilled,
    units_lost: currentMetrics.unitsLost + unitsLost,
    wins_by_difficulty: {
      ...currentMetrics.winsByDifficulty,
      [difficulty]: (currentMetrics.winsByDifficulty[difficulty as keyof typeof currentMetrics.winsByDifficulty] || 0) + (victory ? 1 : 0),
    },
    losses_by_difficulty: {
      ...currentMetrics.lossesByDifficulty,
      [difficulty]: (currentMetrics.lossesByDifficulty[difficulty as keyof typeof currentMetrics.lossesByDifficulty] || 0) + (victory ? 0 : 1),
    },
    updated_at: new Date().toISOString(),
  };
  
  if (currentMetrics.totalBattles === 0) {
    await (supabase.from as any)('player_battle_metrics').insert(updates);
  } else {
    await (supabase.from as any)('player_battle_metrics').update(updates).eq('player_id', playerId);
  }
}

export function getRecommendedDifficulty(metrics: PlayerBattleMetrics): string {
  const normalWinRate = calculateWinRate(metrics, 'Normal');
  const hardWinRate = calculateWinRate(metrics, 'Hard');
  const heroicWinRate = calculateWinRate(metrics, 'Heroic');
  
  if (normalWinRate >= 0.85 && metrics.totalBattles > 10) {
    return 'Hard';
  }
  if (hardWinRate >= 0.70 && metrics.totalBattles > 20) {
    return 'Heroic';
  }
  if (heroicWinRate < 0.40 && metrics.totalBattles > 30) {
    return 'Hard';
  }
  
  return 'Normal';
}

export function calculateQuestDifficulty(
  playerLevel: number,
  playerProgress: number,
  baseQuestLevel: number
): { targetCount: number; difficultyMultiplier: number } {
  const progressRatio = Math.min(1, playerProgress / 100);
  const levelDiff = playerLevel - baseQuestLevel;
  
  let baseCount = 3 + Math.floor(playerLevel / 10);
  let multiplier = 1.0;
  
  if (levelDiff > 5) {
    baseCount = Math.floor(baseCount * 1.3);
    multiplier = 1.2;
  } else if (levelDiff < -3) {
    baseCount = Math.floor(baseCount * 0.7);
    multiplier = 0.7;
  }
  
  baseCount = Math.floor(baseCount * (0.8 + progressRatio * 0.4));
  multiplier = multiplier * (0.8 + progressRatio * 0.4);
  
  return {
    targetCount: Math.max(1, baseCount),
    difficultyMultiplier: multiplier,
  };
}