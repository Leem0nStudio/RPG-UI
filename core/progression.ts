import type { OwnedUnit, GrowthRates, StatBlock } from '@/backend-contracts/game';
import jobsData from '@/content/jobs/jobs.json';

const JOBS = jobsData.jobs as any[];

export interface EvolutionResult {
  canEvolve: boolean;
  missing: string[];
  cost: { zel: number; materials: { id: string; quantity: number }[] };
}

export function getJob(jobId: string): any {
  return JOBS.find((j: any) => j.id === jobId);
}

export function getAllJobs(): any[] {
  return [...JOBS];
}

export function getJobsByTier(tier: number): any[] {
  return JOBS.filter((j: any) => j.tier === tier);
}

export function getAvailableEvolutions(unit: OwnedUnit): any[] {
  return JOBS.filter((job: any) => 
    job.parentJobId === unit.jobId && 
    unit.level >= (job.evolutionRequirements?.level ?? 1)
  );
}

export function canEvolve(unit: OwnedUnit, targetJobId: string): EvolutionResult {
  const targetJob = getJob(targetJobId);
  if (!targetJob) {
    return { canEvolve: false, missing: ['Job not found'], cost: { zel: 0, materials: [] } };
  }
  
  if (targetJob.parentJobId !== unit.jobId) {
    return { canEvolve: false, missing: ['Not eligible job'], cost: { zel: 0, materials: [] } };
  }
  
  const req = targetJob.evolutionRequirements;
  if (!req) {
    return { canEvolve: false, missing: ['No requirements defined'], cost: { zel: 0, materials: [] } };
  }
  
  const missing: string[] = [];
  
  if (unit.level < req.level) {
    missing.push(`Level ${req.level}`);
  }
  
  if (unit.jobLevel < req.jobLevel) {
    missing.push(`Job Level ${req.jobLevel}`);
  }
  
  if (missing.length > 0) {
    return { canEvolve: false, missing, cost: { zel: req.zelCost, materials: req.materials ?? [] } };
  }
  
  return {
    canEvolve: true,
    missing: [],
    cost: { zel: req.zelCost, materials: req.materials ?? [] }
  };
}

export function evolveUnit(unit: OwnedUnit, targetJobId: string): OwnedUnit {
  const result = canEvolve(unit, targetJobId);
  if (!result.canEvolve) {
    throw new Error('Cannot evolve: requirements not met');
  }
  
  return {
    ...unit,
    jobId: targetJobId,
    unlockedJobs: [...(unit.unlockedJobs ?? []), targetJobId],
    jobLevel: 1,
    jobExp: 0,
  };
}

export function getBranchingChoices(unit: OwnedUnit): any[] {
  const currentJob = getJob(unit.jobId);
  if (!currentJob?.branchOptions) return [];
  
  return (currentJob.branchOptions as string[])
    .map((id: string) => getJob(id))
    .filter((j: any) => j !== undefined);
}

export function calculateJobBonus(baseStats: StatBlock, job: any): StatBlock {
  return {
    hp: Math.round(baseStats.hp * (job.statModifiers?.hp ?? 1) + (job.statBonuses?.hp ?? 0)),
    atk: Math.round(baseStats.atk * (job.statModifiers?.atk ?? 1) + (job.statBonuses?.atk ?? 0)),
    def: Math.round(baseStats.def * (job.statModifiers?.def ?? 1) + (job.statBonuses?.def ?? 0)),
    rec: Math.round(baseStats.rec * (job.statModifiers?.rec ?? 1) + (job.statBonuses?.rec ?? 0)),
    matk: Math.round((baseStats.matk ?? 0) * (job.statModifiers?.matk ?? 1) + (job.statBonuses?.matk ?? 0)),
    mdef: Math.round((baseStats.mdef ?? 0) * (job.statModifiers?.mdef ?? 1) + (job.statBonuses?.mdef ?? 0)),
    agi: Math.round((baseStats.agi ?? 0) * (job.statModifiers?.agi ?? 1) + (job.statBonuses?.agi ?? 0)),
  };
}

export function scaleWithGrowthRates(
  baseStats: StatBlock,
  level: number,
  maxLevel: number,
  growthRates?: GrowthRates
): StatBlock {
  const growth = (level - 1) / Math.max(1, maxLevel - 1);
  const rates = growthRates ?? { hp: 1, atk: 1, def: 1, rec: 1 };
  const stats = baseStats as any;
  const r = rates as any;
  
  const result: any = {
    hp: Math.round(stats.hp * (1 + growth * r.hp * 0.85)),
    atk: Math.round(stats.atk * (1 + growth * r.atk * 0.82)),
    def: Math.round(stats.def * (1 + growth * r.def * 0.78)),
    rec: Math.round(stats.rec * (1 + growth * r.rec * 0.70)),
  };
  
  if (stats.matk) result.matk = Math.round(stats.matk * (1 + growth * (r.matk ?? 1) * 0.75));
  if (stats.mdef) result.mdef = Math.round(stats.mdef * (1 + growth * (r.mdef ?? 1) * 0.65));
  if (stats.agi) result.agi = Math.round(stats.agi * (1 + growth * (r.agi ?? 1) * 0.90));
  
  return result as StatBlock;
}

export function getTraitBonus(trait?: string): Partial<GrowthRates> {
  const traitBonuses: Record<string, Partial<GrowthRates>> = {
    strong: { atk: 0.10 },
    agile: { agi: 0.15 },
    arcane: { matk: 0.15 },
    tanky: { hp: 0.10 },
    lucky: { agi: 0.08, atk: 0.05 },
    enduring: { def: 0.10 },
    mystic: { mdef: 0.10, matk: 0.05 },
  };
  
  return trait ? (traitBonuses[trait] ?? {}) : {};
}