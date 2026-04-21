import { bootstrapData, gameContent } from '@/content/game-content';
import type { CharacterData, Item } from '@/lib/types';

const ownedUnitByUnitId = new Map(bootstrapData.roster.map((owned) => [owned.unitId, owned]));

export const CHARACTERS: CharacterData[] = gameContent.units.map((unit) => {
  const owned = ownedUnitByUnitId.get(unit.id);
  return {
    ...unit,
    level: owned?.level ?? 1,
    maxLevel: unit.maxLevel,
    exp: owned?.exp ?? 0,
    maxExp: Math.max(15, unit.maxLevel * 150),
  };
});

export const INVENTORY: Item[] = gameContent.items;

const tintByElement: Record<CharacterData['element'], string> = {
  Fire: 'sepia(0.5) saturate(2) hue-rotate(-50deg)',
  Water: 'sepia(0) hue-rotate(0deg)',
  Earth: 'sepia(0.5) saturate(1.5) hue-rotate(80deg)',
  Light: 'sepia(0.1) saturate(1.2) hue-rotate(10deg) brightness(1.2)',
  Dark: 'sepia(0.8) hue-rotate(220deg) saturate(0.5)',
};

export const SQUAD_MOCK = CHARACTERS.slice(0, 5).map((unit) => ({
  name: unit.name,
  element: unit.element,
  hp: unit.baseStats.hp,
  maxHp: unit.baseStats.hp,
  portrait: unit.spriteUrl,
  tint: tintByElement[unit.element],
}));

export const ITEMS_MOCK = [
  { count: 10, name: 'Antidote', sprite: { col: 1, row: 3 } },
  { count: 10, name: 'Cure', sprite: { col: 2, row: 1 } },
  { count: 10, name: 'Sacred Water', sprite: { col: 3, row: 1 } },
  { count: 3, name: 'Ares Flute', sprite: { col: 2, row: 2 } },
  { count: 1, name: 'Reviver', sprite: { col: 2, row: 3 } },
];
