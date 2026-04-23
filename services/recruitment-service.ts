import { getSupabaseBrowserClient } from './supabase/client';

export type Affinity = 'physical' | 'magic' | 'support' | 'ranged';

export interface NoviceTemplate {
  id: string;
  name: string;
  affinity: Affinity;
  trait: string;
  growthRates: {
    hp: number;
    atk: number;
    def: number;
    rec: number;
    matk: number;
    mdef: number;
    agi: number;
  };
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    rec: number;
    matk: number;
    mdef: number;
    agi: number;
  };
}

const NOVICES: NoviceTemplate[] = [
  {
    id: 'novice_warrior',
    name: 'Alex',
    affinity: 'physical',
    trait: 'strong',
    growthRates: { hp: 1.2, atk: 1.15, def: 1.1, rec: 0.8, matk: 0.5, mdef: 0.5, agi: 0.9 },
    baseStats: { hp: 120, atk: 12, def: 10, rec: 5, matk: 5, mdef: 5, agi: 8 },
  },
  {
    id: 'novice_ranger',
    name: 'Diana',
    affinity: 'ranged',
    trait: 'agile',
    growthRates: { hp: 0.95, atk: 1.1, def: 0.8, rec: 0.9, matk: 0.6, mdef: 0.6, agi: 1.25 },
    baseStats: { hp: 100, atk: 14, def: 7, rec: 6, matk: 6, mdef: 6, agi: 12 },
  },
  {
    id: 'novice_mage',
    name: 'Morgan',
    affinity: 'magic',
    trait: 'arcane',
    growthRates: { hp: 0.85, atk: 0.6, def: 0.7, rec: 1.1, matk: 1.3, mdef: 1.15, agi: 0.75 },
    baseStats: { hp: 90, atk: 6, def: 6, rec: 8, matk: 15, mdef: 12, agi: 6 },
  },
];

const TRAITS = [
  { id: 'strong', name: 'Strong', bonus: { atk: 0.10 } },
  { id: 'tanky', name: 'Tanky', bonus: { hp: 0.10 } },
  { id: 'agile', name: 'Agile', bonus: { agi: 0.15 } },
  { id: 'arcane', name: 'Arcane', bonus: { matk: 0.15 } },
  { id: 'lucky', name: 'Lucky', bonus: { agi: 0.08, atk: 0.05 } },
  { id: 'enduring', name: 'Enduring', bonus: { def: 0.10 } },
];

const AFFINITIES: Affinity[] = ['physical', 'magic', 'support', 'ranged'];

export function getStartingNovices(): NoviceTemplate[] {
  return [...NOVICES];
}

export function getNoviceById(id: string): NoviceTemplate | undefined {
  return NOVICES.find(n => n.id === id);
}

export function generateRecruit(): {
  instanceId: string;
  unitId: string;
  name: string;
  affinity: Affinity;
  trait: string;
  growthRates: Record<string, number>;
  baseStats: Record<string, number>;
} {
  const affinity = AFFINITIES[Math.floor(Math.random() * AFFINITIES.length)];
  
  const baseGrowth = {
    hp: 0.9 + Math.random() * 0.25,
    atk: 0.9 + Math.random() * 0.25,
    def: 0.9 + Math.random() * 0.25,
    rec: 0.9 + Math.random() * 0.25,
    matk: 0.9 + Math.random() * 0.25,
    mdef: 0.9 + Math.random() * 0.25,
    agi: 0.9 + Math.random() * 0.25,
  };
  
  const traitRoll = Math.random();
  const trait = traitRoll < 0.3 
    ? TRAITS[Math.floor(Math.random() * TRAITS.length)]
    : null;
  
  let finalGrowth = { ...baseGrowth };
  if (trait) {
    for (const [stat, bonus] of Object.entries(trait.bonus)) {
      finalGrowth[stat] = (finalGrowth[stat] ?? 1) + bonus;
    }
  }
  
  const baseStats = {
    hp: 80 + Math.floor(Math.random() * 40),
    atk: 8 + Math.floor(Math.random() * 8),
    def: 6 + Math.floor(Math.random() * 6),
    rec: 5 + Math.floor(Math.random() * 5),
    matk: 5 + Math.floor(Math.random() * 10),
    mdef: 5 + Math.floor(Math.random() * 5),
    agi: 6 + Math.floor(Math.random() * 6),
  };
  
  const names = ['Hero', 'Warrior', 'Mage', 'Ranger', 'Rogue', 'Sage', 'Knight', 'Scout'];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return {
    instanceId: `novice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    unitId: 'novice',
    name,
    affinity,
    trait: trait?.id ?? 'none',
    growthRates: finalGrowth,
    baseStats,
  };
}

export function createOwnedUnitFromTemplate(
  template: NoviceTemplate,
  instanceId: string
): {
  instanceId: string;
  unitId: string;
  name: string;
  level: number;
  exp: number;
  jobId: string;
  jobLevel: number;
  jobExp: number;
  unlockedJobs: string[];
  equippedCards: string[];
  equippedSkills: string[];
  growthRates: Record<string, number>;
  affinity: Affinity;
  trait: string;
} {
  return {
    instanceId,
    unitId: template.id,
    name: template.name,
    level: 1,
    exp: 0,
    jobId: 'novice',
    jobLevel: 1,
    jobExp: 0,
    unlockedJobs: ['novice'],
    equippedCards: [],
    equippedSkills: [],
    growthRates: template.growthRates,
    affinity: template.affinity,
    trait: template.trait,
  };
}

export async function saveRecruitmentTicket(playerId: string, ticketType: string = 'standard'): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await (supabase.from as any)('player_recruitment_tickets').insert({
    player_id: playerId,
    ticket_type: ticketType,
    expires_at: expiresAt.toISOString(),
  });
}

export async function getRecruitmentQueue(playerId: string): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  
  const { data } = await (supabase.from as any)('player_recruitment_tickets')
    .select('ticket_type')
    .eq('player_id', playerId)
    .gt('expires_at', new Date().toISOString());
  
  return (data ?? []).map((r: any) => r.ticket_type);
}