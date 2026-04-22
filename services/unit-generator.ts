import type { Gender, Element, StatBlock, SkillDefinition } from '@/backend-contracts/game';
import { getSkillsForJobTier } from '@/core/skills';

export type RarityTier = 'normal' | 'rare' | 'epic' | 'legendary';

const RARITY_BONUS: Record<RarityTier, number> = {
  normal: 0,
  rare: 0.15,
  epic: 0.30,
  legendary: 0.50,
};

const RARITY_CHANCE: Record<RarityTier, number> = {
  normal: 0.60,
  rare: 0.25,
  epic: 0.10,
  legendary: 0.05,
};

const JOB_BASE_STATS: Record<string, StatBlock> = {
  job_swordman: { hp: 2000, atk: 550, def: 500, rec: 300 },
  job_knight: { hp: 2800, atk: 700, def: 650, rec: 350 },
  job_paladin: { hp: 3200, atk: 600, def: 800, rec: 450 },
  job_mage: { hp: 1200, atk: 650, def: 250, rec: 450 },
  job_wizard: { hp: 1500, atk: 850, def: 300, rec: 550 },
  job_sage: { hp: 1800, atk: 800, def: 350, rec: 650 },
  job_archer: { hp: 1600, atk: 580, def: 350, rec: 350 },
  job_hunter: { hp: 2000, atk: 750, def: 450, rec: 400 },
  job_sniper: { hp: 2200, atk: 850, def: 500, rec: 450 },
  job_thief: { hp: 1500, atk: 600, def: 300, rec: 380 },
  job_assassin: { hp: 1800, atk: 850, def: 380, rec: 420 },
  job_lord: { hp: 2000, atk: 950, def: 450, rec: 480 },
  job_merchant: { hp: 1800, atk: 480, def: 400, rec: 320 },
  job_blacksmith: { hp: 2200, atk: 700, def: 550, rec: 400 },
  job_champion: { hp: 2500, atk: 800, def: 600, rec: 450 },
  job_acolyte: { hp: 1400, atk: 350, def: 300, rec: 500 },
  job_priest: { hp: 1700, atk: 450, def: 380, rec: 650 },
  job_highpriest: { hp: 2000, atk: 550, def: 450, rec: 750 },
  job_bard: { hp: 1400, atk: 550, def: 300, rec: 400 },
  job_clown: { hp: 1700, atk: 700, def: 380, rec: 500 },
  job_royalbard: { hp: 2000, atk: 800, def: 450, rec: 550 },
  job_dancer: { hp: 1400, atk: 550, def: 300, rec: 400 },
  job_gypsy: { hp: 1700, atk: 700, def: 380, rec: 500 },
  job_royaldancer: { hp: 2000, atk: 800, def: 450, rec: 550 },
};

export function rollRarity(): RarityTier {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [tier, chance] of Object.entries(RARITY_CHANCE)) {
    cumulative += chance;
    if (roll < cumulative) return tier as RarityTier;
  }
  return 'normal';
}

function applyVariance(stats: StatBlock, variance: number = 0.15): StatBlock {
  return {
    hp: Math.round(stats.hp * (1 + (Math.random() - 0.5) * 2 * variance)),
    atk: Math.round(stats.atk * (1 + (Math.random() - 0.5) * 2 * variance)),
    def: Math.round(stats.def * (1 + (Math.random() - 0.5) * 2 * variance)),
    rec: Math.round(stats.rec * (1 + (Math.random() - 0.5) * 2 * variance)),
  };
}

function applyRarityBonus(stats: StatBlock, rarity: RarityTier): StatBlock {
  const bonus = RARITY_BONUS[rarity];
  return {
    hp: Math.round(stats.hp * (1 + bonus)),
    atk: Math.round(stats.atk * (1 + bonus)),
    def: Math.round(stats.def * (1 + bonus)),
    rec: Math.round(stats.rec * (1 + bonus)),
  };
}

export function generateBaseStats(jobId: string, rarity: RarityTier): StatBlock {
  const baseStats = JOB_BASE_STATS[jobId] || { hp: 1500, atk: 500, def: 350, rec: 350 };
  const withVariance = applyVariance(baseStats);
  return applyRarityBonus(withVariance, rarity);
}

export function getRarityNumber(rarity: RarityTier): number {
  const mapping: Record<RarityTier, number> = { normal: 3, rare: 5, epic: 7, legendary: 9 };
  return mapping[rarity];
}

export function getRarityLabel(rarity: RarityTier): string {
  const mapping: Record<RarityTier, string> = { normal: 'Normal', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
  return mapping[rarity];
}

const MALE_NAMES = [
  'Ygnatel', 'Destral', 'Vance', 'Krom', 'Zex', 'Lorencia', 'Hein', 'Amotion',
  'Ragnar', 'Grimwal', 'Azoth', 'Balm', 'Celez', 'Dante', 'Frost', 'Gorm',
  'Heros', 'Ivar', 'Jorn', 'Keen', 'Lorak', 'Morne', 'Nero', 'Orion',
];

const FEMALE_NAMES = [
  'Katria', 'Lilia', 'Elin', 'Nady', 'Feena', 'Anne', 'Carla', 'Rin',
  'Aria', 'Brynn', 'Cora', 'Dara', 'Eira', 'Freya', 'Gwen', 'Hana',
  'Iris', 'Jade', 'Kira', 'Luna', 'Maya', 'Nora', 'Onyx', 'Pyra',
];

export function generateUnitName(gender: Gender): string {
  const names = gender === 'female' ? FEMALE_NAMES : MALE_NAMES;
  return names[Math.floor(Math.random() * names.length)];
}

const ELEMENTS: Element[] = ['Fire', 'Water', 'Earth', 'Light', 'Dark'];

export function rollElement(): Element {
  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
}

const TITLES: Record<string, string[]> = {
  job_swordman: ['Novice', 'Warrior', 'Soldier'],
  job_knight: ['Guardian', 'Defender', 'Protector'],
  job_paladin: ['Holy Knight', 'Templar', 'Divine'],
  job_mage: ['Apprentice', 'Scholar', 'Magician'],
  job_wizard: ['Arcane', 'Elementalist', 'Sorcerer'],
  job_sage: ['Master', 'Sage', 'Elder'],
  job_archer: ['Scout', 'Ranger', 'Marksman'],
  job_hunter: ['Tracker', 'Beast Master', 'Predator'],
  job_sniper: ['Sniper', 'Hawkeye', 'Deadeye'],
  job_thief: ['Rogue', 'Spy', 'Shadow'],
  job_assassin: ['Killer', 'Striker', 'Death'],
  job_lord: ['Master Assassin', 'Shadow Lord', 'Grim'],
  job_merchant: ['Trader', 'Dealer', 'Peddler'],
  job_blacksmith: ['Smith', 'Artisan', 'Craftsman'],
  job_champion: ['Master Smith', 'Forge Master', 'Champion'],
  job_acolyte: ['Devotee', 'Believer', 'Servant'],
  job_priest: ['Cleric', 'Father', 'Bishop'],
  job_highpriest: ['Archbishop', 'Saint', 'Divine'],
  job_bard: ['Minstrel', 'Bard', 'Harper'],
  job_clown: ['Jester', 'Fool', 'Entertainer'],
  job_royalbard: ['Maestro', 'Virtuoso', 'Royal'],
  job_dancer: ['Dancer', 'Ballerina', 'Performer'],
  job_gypsy: ['Enchantress', 'Seductress', 'Temptress'],
  job_royaldancer: ['Prima', 'Star', 'Royal'],
};

export function generateUnitTitle(jobId: string): string {
  const titles = TITLES[jobId] || ['Unknown'];
  return titles[Math.floor(Math.random() * titles.length)];
}

export function generateUniqueId(): string {
  return `u_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface GeneratedUnit {
  id: string;
  name: string;
  title: string;
  element: Element;
  jobId: string;
  gender: Gender;
  baseStats: StatBlock;
  skills: SkillDefinition[];
  rarity: RarityTier;
}

export function generateUnit(gender?: Gender, jobId?: string, tier: '1' | '2' | '3' = '1'): GeneratedUnit {
  const rarity = rollRarity();
  const unitGender = gender || (Math.random() > 0.5 ? 'male' : 'female');
  
  const jobIds = [
    'job_swordman', 'job_mage', 'job_archer', 'job_thief', 'job_merchant', 'job_acolyte',
    'job_bard', 'job_dancer',
  ].filter(j => {
    if (j === 'job_bard' && unitGender === 'female') return false;
    if (j === 'job_dancer' && unitGender === 'male') return false;
    return true;
  });
  
  const selectedJob = jobId || jobIds[Math.floor(Math.random() * jobIds.length)];
  const title = generateUnitTitle(selectedJob);
  const name = generateUnitName(unitGender);
  const stats = generateBaseStats(selectedJob, rarity);
  const skillCount = Math.min(parseInt(tier) * 2, 4);
  const skills = getSkillsForJobTier(selectedJob, tier, skillCount);
  
  return {
    id: generateUniqueId(),
    name,
    title,
    element: rollElement(),
    jobId: selectedJob,
    gender: unitGender,
    baseStats: stats,
    skills,
    rarity,
  };
}