import type { ItemDefinition, JobDefinition, OwnedUnit, StatBlock, UnitDefinition } from '@/backend-contracts/game';

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

export function scaleJobStats(base: StatBlock, multipliers: JobDefinition['statMultipliers'], jobLevel: number, maxJobLevel: number): StatBlock {
  const growth = Math.max(0, (jobLevel - 1) / Math.max(1, maxJobLevel - 1));
  return {
    hp: Math.round(base.hp * multipliers.hp * (1 + growth * 0.5)),
    atk: Math.round(base.atk * multipliers.atk * (1 + growth * 0.5)),
    def: Math.round(base.def * multipliers.def * (1 + growth * 0.5)),
    rec: Math.round(base.rec * multipliers.rec * (1 + growth * 0.5)),
  };
}

export function calculateUnitStats(
  unit: UnitDefinition,
  owned: OwnedUnit,
  equippedItems: Array<ItemDefinition | null>,
  job?: JobDefinition
): StatBlock {
  const scaledBase = scaleBaseStats(unit.baseStats, owned.level, unit.maxLevel);
  
  let jobBonus: StatBlock = { hp: 0, atk: 0, def: 0, rec: 0 };
  if (job) {
    jobBonus = scaleJobStats(
      job.baseStats,
      job.statMultipliers,
      owned.jobLevel,
      unit.maxJobLevel
    );
  }

  const equipmentStats = sumStats(
    ...equippedItems.filter(Boolean).map((item) => item!.stats),
  );

  return sumStats(scaledBase, jobBonus, equipmentStats);
}

export function canEvolve(owned: OwnedUnit, jobs: JobDefinition[]): boolean {
  const currentJob = jobs.find(j => j.id === owned.jobId);
  if (!currentJob) return false;
  
  const nextJob = jobs.find(j => j.evolvedFrom === currentJob.id);
  if (!nextJob) return false;
  
  return owned.jobLevel >= currentJob.requiredJobLevel;
}

export function getNextJob(owned: OwnedUnit, jobs: JobDefinition[]): JobDefinition | undefined {
  const currentJob = jobs.find(j => j.id === owned.jobId);
  if (!currentJob) return undefined;
  
  return jobs.find(j => j.evolvedFrom === currentJob.id);
}
