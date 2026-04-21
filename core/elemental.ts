import type { Element } from '@/backend-contracts/game';

const beats: Record<Element, Element> = {
  Fire: 'Earth',
  Earth: 'Water',
  Water: 'Fire',
  Light: 'Dark',
  Dark: 'Light',
};

export function getElementOutcome(attacker: Element, defender: Element): 'advantage' | 'neutral' | 'disadvantage' {
  if (attacker === defender) return 'neutral';
  if (beats[attacker] === defender) return 'advantage';
  if (beats[defender] === attacker) return 'disadvantage';
  return 'neutral';
}

export function getElementMultiplier(attacker: Element, defender: Element): number {
  const outcome = getElementOutcome(attacker, defender);
  if (outcome === 'advantage') return 1.5;
  if (outcome === 'disadvantage') return 0.75;
  return 1;
}
