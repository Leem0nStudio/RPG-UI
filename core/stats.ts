import type { ItemDefinition, OwnedUnit, StatBlock, UnitDefinition } from '@/backend-contracts/game';

export function sumStats(...blocks: StatBlock[]): StatBlock {
  return blocks.reduce(
    (acc, block) => ({
      hp: acc.hp + block.hp,
      atk: acc.atk + block.atk,
      def: acc.def + block.def,
      rec: acc.rec + block.rec,
    }),
    { hp: 0, atk: 0, def: 0, rec: 0 }
  );
}

export function scaleBaseStats(base: StatBlock, level: number, maxLevel: number): StatBlock {
  const growth = Math.max(0, (level - 1) / Math.max(1, maxLevel - 1));
  return {
    hp: Math.round(base.hp * (1 + growth * 0.85)),
    atk: Math.round(base.atk * (1 + growth * 0.82)),
    def: Math.round(base.def * (1 + growth * 0.78)),
    rec: Math.round(base.rec * (1 + growth * 0.7)),
  };
}

export function calculateUnitStats(unit: UnitDefinition, owned: OwnedUnit, equippedItems: Array<ItemDefinition | null>): StatBlock {
  const scaledBase = scaleBaseStats(unit.baseStats, owned.level, unit.maxLevel);
  const equipmentStats = sumStats(
    ...equippedItems.filter(Boolean).map((item) => item!.stats),
  );

  return sumStats(scaledBase, equipmentStats);
}
