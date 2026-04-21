import type { Element, StatBlock } from '@/backend-contracts/game';
import { getElementMultiplier } from '@/core/elemental';

export interface BattleActor {
  id: string;
  name: string;
  element: Element;
  stats: StatBlock;
  hp: number;
  bbGauge: number;
}

export interface DamagePreview {
  amount: number;
  crit: boolean;
  elementMultiplier: number;
}

export function previewDamage(attacker: BattleActor, defender: BattleActor): DamagePreview {
  const elementMultiplier = getElementMultiplier(attacker.element, defender.element);
  const raw = Math.max(1, attacker.stats.atk - Math.round(defender.stats.def * 0.55));
  const amount = Math.round(raw * elementMultiplier);

  return {
    amount,
    crit: false,
    elementMultiplier,
  };
}

export function chargeBraveBurst(currentGauge: number, hits = 1): number {
  return Math.min(100, currentGauge + hits * 8);
}
