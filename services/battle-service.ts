import type { Element, EnemyDefinition, QuestDefinition, StatBlock } from '@/backend-contracts/game';
import { scaleBaseStats } from '@/core/stats';
import { previewDamage } from '@/core/battle';
import { getElementMultiplier } from '@/core/elemental';
import { getSupabaseBrowserClient } from '@/services/supabase/client';
import { gameContent } from '@/content/game-content';
import { calculateRewardModifier, recordBattleOutcome, calculateEnemyLevelScaler, getPlayerMetrics } from '@/core/balance-system';

interface EnemyRow {
  id: string;
  name: string;
  title: string | null;
  element: Element;
  rarity: number;
  max_level: number;
  base_stats: StatBlock;
  sprite_url: string | null;
  css_filter: string | null;
  skills: EnemyDefinition['skills'];
  ai_type?: AIType;
  exp_reward: number;
  zel_reward: number;
  item_drops: EnemyDefinition['itemDrops'];
}

// AI Types
export type AIType = 'aggressive' | 'defensive' | 'balanced' | 'boss';

export interface CombatUnit {
  instanceId: string;
  unitId: string;
  name: string;
  element: Element;
  stats: StatBlock;
  hp: number;
  maxHp: number;
  bbGauge: number;
  alive: boolean;
}

export interface EnemyInstance {
  id: string;
  definitionId: string;
  name: string;
  title: string;
  element: Element;
  stats: StatBlock;
  hp: number;
  maxHp: number;
  alive: boolean;
  aiType: AIType;
  itemDrops: EnemyDefinition['itemDrops'];
}

export interface BattleAction {
  type: 'attack' | 'brave_burst' | 'skill' | 'item';
  sourceId: string;
  targetId: string;
  damage?: number;
  healing?: number;
  elementMultiplier?: number;
  isCritical?: boolean;
}

export interface BattleResult {
  victory: boolean;
  turns: number;
  actions: BattleAction[];
  rewards: {
    exp: number;
    zel: number;
    items: { itemId: string; quantity: number }[];
  };
  survivingUnits: string[];
  fallenUnits: string[];
}

const ELEMENT_SPRITES: Record<Element, string> = {
  Fire: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png',
  Water: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png',
  Earth: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png',
  Light: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png',
  Dark: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png',
};

/**
 * Filter enemies for a specific quest from the content pool
 * Assumes enemies are already loaded via loadGameContent()
 */
export function getEnemiesForQuest(
  allEnemies: EnemyDefinition[],
  enemyIds: string[]
): EnemyDefinition[] {
  if (!enemyIds || enemyIds.length === 0) return [];
  return allEnemies.filter(e => enemyIds.includes(e.id));
}

/**
 * Create an enemy instance at a given level
 */
export function createEnemyInstance(
  definition: EnemyDefinition,
  level: number,
  playerAvgLevel: number
): EnemyInstance {
  const scaledLevel = Math.max(1, Math.min(definition.maxLevel, Math.floor(level + Math.floor(Math.random() * 3) - 1)));
  
  const scaledStats = scaleBaseStats(definition.baseStats, scaledLevel, definition.maxLevel);
  
  return {
    id: `${definition.id}_${Date.now()}`,
    definitionId: definition.id,
    name: definition.name,
    title: definition.title ?? definition.name,
    element: definition.element,
    stats: scaledStats,
    hp: scaledStats.hp,
    maxHp: scaledStats.hp,
    alive: true,
    aiType: definition.aiType as AIType,
    itemDrops: definition.itemDrops,
  };
}

/**
 * Calculate damage from a combat unit to an enemy
 */
function calculateCombatDamage(
  attackerStats: StatBlock,
  attackerElement: Element,
  defenderStats: StatBlock,
  defenderElement: Element
): { damage: number; elementMultiplier: number; isCritical: boolean } {
  const elementMultiplier = getElementMultiplier(attackerElement, defenderElement);
  const rawDamage = Math.max(1, attackerStats.atk - Math.round(defenderStats.def * 0.55));
  const damage = Math.round(rawDamage * elementMultiplier);

  const isCritical = Math.random() < 0.1;
  const finalDamage = isCritical ? Math.round(damage * 1.5) : damage;

  return { damage: finalDamage, elementMultiplier, isCritical };
}

/**
 * Generic damage calculator - works for any attacker/defender with stats and element
 */
export function calculateUnitDamage(
  attacker: { stats: StatBlock; element: Element },
  defender: { stats: StatBlock; element: Element }
): { damage: number; elementMultiplier: number; isCritical: boolean } {
  return calculateCombatDamage(attacker.stats, attacker.element, defender.stats, defender.element);
}

/**
 * Calculate damage from player unit to enemy
 * @deprecated Use calculateUnitDamage instead
 */
export function calculateDamage(
  attacker: CombatUnit,
  defender: EnemyInstance
): { damage: number; elementMultiplier: number; isCritical: boolean } {
  return calculateUnitDamage(attacker, defender);
}

/**
 * Calculate damage from enemy to player unit
 * @deprecated Use calculateUnitDamage instead
 */
export function calculateEnemyDamage(
  attacker: EnemyInstance,
  defender: CombatUnit
): { damage: number; elementMultiplier: number; isCritical: boolean } {
  return calculateUnitDamage(attacker, defender);
}

/**
 * Execute a battle turn
 */
export function executeTurn(
  playerUnits: CombatUnit[],
  enemy: EnemyInstance
): { actions: BattleAction[]; newEnemyHp: number; deadUnits: CombatUnit[] } {
  const actions: BattleAction[] = [];
  let currentEnemyHp = enemy.hp;
  const deadUnits: CombatUnit[] = [];
  
  // Player units attack first (in order)
  for (const unit of playerUnits) {
    if (!unit.alive || currentEnemyHp <= 0) continue;
    
    const { damage, elementMultiplier, isCritical } = calculateDamage(unit, enemy);
    currentEnemyHp = Math.max(0, currentEnemyHp - damage);
    
    actions.push({
      type: 'attack',
      sourceId: unit.instanceId,
      targetId: enemy.id,
      damage,
      elementMultiplier,
      isCritical,
    });
    
    if (currentEnemyHp <= 0) {
      enemy.hp = 0;
      enemy.alive = false;
      break;
    }
  }
  
  // Enemy attacks back if alive
  if (enemy.alive) {
    const aliveUnits = playerUnits.filter(u => u.alive);
    
    // Boss attacks multiple units
    const targetsToAttack = enemy.aiType === 'boss' 
      ? aliveUnits.slice(0, 2) // Boss attacks 2 units
      : aliveUnits.slice(0, 1);
    
    for (const target of targetsToAttack) {
      const { damage, elementMultiplier, isCritical } = calculateEnemyDamage(enemy, target);
      
      target.hp = Math.max(0, target.hp - damage);
      target.alive = target.hp > 0;
      
      actions.push({
        type: 'attack',
        sourceId: enemy.id,
        targetId: target.instanceId,
        damage,
        elementMultiplier,
        isCritical,
      });
      
      if (!target.alive) {
        deadUnits.push(target);
      }
    }
  }
  
  return { actions, newEnemyHp: currentEnemyHp, deadUnits };
}

/**
 * Calculate BB gauge charge
 */
export function chargeBBGauge(currentGauge: number, isHit: boolean): number {
  if (!isHit) return currentGauge;
  return Math.min(100, currentGauge + 8);
}

/**
 * Roll for item drops
 */
export function rollItemDrops(
  drops: EnemyDefinition['itemDrops']
): { itemId: string; quantity: number }[] {
  const awarded: { itemId: string; quantity: number }[] = [];
  
  for (const drop of drops) {
    if (Math.random() <= drop.chance) {
      awarded.push({
        itemId: drop.itemId,
        quantity: drop.quantity,
      });
    }
  }
  
  return awarded;
}

/**
 * Execute full battle
 */
export async function executeBattle(
  playerUnits: CombatUnit[],
  enemy: EnemyInstance,
  maxTurns: number = 20,
  playerId?: string,
  playerLevel: number = 1
): Promise<BattleResult> {
  const actions: BattleAction[] = [];
  const survivingUnits: string[] = [];
  const fallenUnits: string[] = [];
  
  let totalDamageDealt = 0;
  let totalDamageTaken = 0;
  
  // No level-based modifier in enemy type, use enemy maxHp as proxy for difficulty
  const rewardModifier = calculateRewardModifier(playerLevel, 1);
  
  // Initial state
  let currentEnemyHp = enemy.hp;
  let turn = 0;
  
  // Battle loop
  while (turn < maxTurns) {
    turn++;
    
    const { actions: turnActions, newEnemyHp, deadUnits } = executeTurn(
      playerUnits.map(u => ({ ...u, alive: u.hp > 0 })),
      { ...enemy, hp: currentEnemyHp }
    );
    
    actions.push(...turnActions);
    currentEnemyHp = newEnemyHp;
    
    // Track deaths
    for (const dead of deadUnits) {
      if (!fallenUnits.includes(dead.instanceId)) {
        fallenUnits.push(dead.instanceId);
      }
    }
    
    // Check victory/defeat
    if (currentEnemyHp <= 0) {
      // Victory!
      survivingUnits.push(...playerUnits.filter(u => u.alive && u.hp > 0).map(u => u.instanceId));
      
      const baseExp = Math.round((enemy.maxHp / 10) * (1 + turn * 0.1));
      const baseZel = Math.round((enemy.maxHp / 5) * (1 + turn * 0.05));
      
      const result = {
        victory: true,
        turns: turn,
        actions,
        rewards: {
          exp: Math.round(baseExp * rewardModifier),
          zel: Math.round(baseZel * rewardModifier),
          items: rollItemDrops(enemy.itemDrops),
        },
        survivingUnits,
        fallenUnits,
      };
      
      // Record battle outcome if playerId provided
      if (playerId) {
        const damageDealt = actions.filter(a => a.type === 'attack' && a.damage).reduce((sum, a) => sum + (a.damage || 0), 0);
        const damageTaken = playerUnits.reduce((sum, u) => sum + (enemy.stats.atk || 0), 0);
        await recordBattleOutcome(
          playerId,
          'Normal',
          true,
          damageDealt,
          damageTaken,
          1,
          0
        );
      }
      
      return result;
    }
    
    // Check if all player units are dead (defeat)
    const aliveCount = playerUnits.filter(u => u.alive && u.hp > 0).length;
    if (aliveCount === 0) {
      fallenUnits.push(...playerUnits.map(u => u.instanceId));
      
      const result = {
        victory: false,
        turns: turn,
        actions,
        rewards: {
          exp: 0,
          zel: 0,
          items: [],
        },
        survivingUnits: [],
        fallenUnits,
      };
      
      // Record battle outcome if playerId provided
      if (playerId) {
        await recordBattleOutcome(
          playerId,
          'Normal',
          false,
          0,
          playerUnits.reduce((sum, u) => sum + u.hp, 0),
          0,
          playerUnits.length
        );
      }
      
      return result;
    }
  }
  
  // Max turns reached - check who has more HP
  const playerHpTotal = playerUnits.filter(u => u.alive).reduce((sum, u) => sum + u.hp, 0);
  const enemyHpPercent = currentEnemyHp / enemy.maxHp;
  const playerHpPercent = playerHpTotal / playerUnits.reduce((sum, u) => sum + u.maxHp, 0);
  
  if (playerHpPercent > enemyHpPercent) {
    survivingUnits.push(...playerUnits.filter(u => u.alive).map(u => u.instanceId));
    
    // Record battle outcome if playerId provided
    if (playerId) {
      const damageDealt = actions.filter(a => a.type === 'attack' && a.damage).reduce((sum, a) => sum + (a.damage || 0), 0);
      const damageTaken = playerUnits.reduce((sum, u) => sum + (enemy.stats.atk || 0), 0);
      await recordBattleOutcome(
        playerId,
        'Normal',
        true,
        damageDealt,
        damageTaken,
        1,
        fallenUnits.length
      );
    }
    
    return {
      victory: true,
      turns: turn,
      actions,
      rewards: {
        exp: Math.round((enemy.maxHp / 10) * 0.5 * rewardModifier),
        zel: Math.round((enemy.maxHp / 5) * 0.5 * rewardModifier),
        items: [],
      },
      survivingUnits,
      fallenUnits,
    };
  }
  
  // Defeat
  fallenUnits.push(...playerUnits.map(u => u.instanceId));
  
  // Record battle outcome if playerId provided
  if (playerId) {
    const damageDealt = actions.filter(a => a.type === 'attack' && a.damage).reduce((sum, a) => sum + (a.damage || 0), 0);
    const damageTaken = playerUnits.reduce((sum, u) => sum + u.hp, 0);
    await recordBattleOutcome(
      playerId,
      'Normal',
      false,
      damageDealt,
      damageTaken,
      0,
      playerUnits.length
    );
  }
  
  return {
    victory: false,
    turns: turn,
    actions,
    rewards: {
      exp: 0,
      zel: 0,
      items: [],
    },
    survivingUnits: [],
    fallenUnits,
  };
}

/**
 * Get enemy sprite URL or fallback
 */
export function getEnemySpriteUrl(element: Element): string {
  return ELEMENT_SPRITES[element] ?? ELEMENT_SPRITES.Water;
}

/**
 * Get enemy CSS filter for element
 */
export function getEnemyCssFilter(element: Element): string {
  const filters: Record<Element, string> = {
    Fire: 'sepia(0.5) saturate(2) hue-rotate(-50deg) brightness(0.75)',
    Water: 'sepia(0) hue-rotate(0deg) brightness(0.75)',
    Earth: 'sepia(0.5) saturate(1.5) hue-rotate(80deg) brightness(0.75)',
    Light: 'sepia(0.1) saturate(1.2) hue-rotate(10deg) brightness(0.75)',
    Dark: 'sepia(0.8) hue-rotate(220deg) saturate(0.5) brightness(0.75)',
  };
  return filters[element] ?? filters.Water;
}