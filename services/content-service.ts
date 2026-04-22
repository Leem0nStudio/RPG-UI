import type { GameContent, JobDefinition } from '@/backend-contracts/game';
import { gameContent } from '@/content/game-content';
import { getSupabaseBrowserClient } from '@/services/supabase/client';

type JobRow = {
  id: string;
  name: string;
  tier: string;
  category: string;
  sprite_url: string;
  css_filter: string;
  required_job_level: number;
  evolved_from: string | null;
  base_stats: JobDefinition['baseStats'];
  stat_multipliers: JobDefinition['statMultipliers'];
  skills: JobDefinition['skills'];
};

type UnitRow = {
  id: string;
  name: string;
  title: string;
  element: GameContent['units'][number]['element'];
  rarity: number;
  max_level: number;
  job_id: string;
  max_job_level: number;
  cost: number;
  base_stats: GameContent['units'][number]['baseStats'];
  sprite_url: string;
  css_filter: string;
  skills: GameContent['units'][number]['skills'];
};

type ItemRow = {
  id: string;
  name: string;
  type: GameContent['items'][number]['type'];
  rarity: number;
  description: string;
  stats: GameContent['items'][number]['stats'];
  sprite: GameContent['items'][number]['sprite'];
  effects: string[] | null;
};

type QuestRow = {
  id: string;
  world_id: string;
  stage: number;
  name: string;
  energy_cost: number;
  difficulty: GameContent['quests'][number]['difficulty'];
  enemy_ids: string[];
  rewards_preview: string[];
};

type BannerRow = {
  id: string;
  name: string;
  cost: number;
  currency: GameContent['banners'][number]['currency'];
  featured_unit_ids: string[];
  description: string;
  active: boolean;
};

export async function loadGameContent(): Promise<GameContent> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return gameContent;

  const [jobsRes, unitsRes, itemsRes, questsRes, bannersRes] = await Promise.all([
    supabase.from('job_definitions').select('*'),
    supabase.from('unit_definitions').select('*'),
    supabase.from('item_definitions').select('*'),
    supabase.from('quest_definitions').select('*'),
    supabase.from('summon_banners').select('*'),
  ]);

  if (jobsRes.error || unitsRes.error || itemsRes.error || questsRes.error || bannersRes.error) {
    console.warn('[loadGameContent] Some queries failed, falling back to local content:', {
      jobsError: jobsRes.error,
      unitsError: unitsRes.error,
      itemsError: itemsRes.error,
      questsError: questsRes.error,
      bannersError: bannersRes.error,
    });
    return gameContent;
  }

  const remoteJobs = ((jobsRes.data as JobRow[] | null) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    tier: row.tier as '1' | '2' | '3',
    category: row.category as 'Sword' | 'Magic' | 'Bow' | 'Thief' | 'Trade' | 'Heal',
    spriteUrl: row.sprite_url,
    cssFilter: row.css_filter,
    requiredJobLevel: row.required_job_level,
    evolvedFrom: row.evolved_from,
    baseStats: row.base_stats,
    statMultipliers: row.stat_multipliers,
    skills: row.skills ?? [],
  }));

  const remoteUnits = ((unitsRes.data as UnitRow[] | null) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    title: row.title,
    element: row.element,
    rarity: row.rarity,
    maxLevel: row.max_level,
    jobId: row.job_id,
    maxJobLevel: row.max_job_level,
    cost: row.cost,
    baseStats: row.base_stats,
    spriteUrl: row.sprite_url,
    cssFilter: row.css_filter,
    skills: row.skills ?? [],
  }));

  const remoteItems = ((itemsRes.data as ItemRow[] | null) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    rarity: row.rarity,
    description: row.description,
    stats: row.stats,
    sprite: row.sprite,
    effects: row.effects ?? [],
  }));

  const remoteQuests = ((questsRes.data as QuestRow[] | null) ?? []).map((row) => ({
    id: row.id,
    worldId: row.world_id,
    stage: row.stage,
    name: row.name,
    energyCost: row.energy_cost,
    difficulty: row.difficulty,
    enemyIds: row.enemy_ids ?? [],
    rewardsPreview: row.rewards_preview ?? [],
  }));

  const remoteBanners = ((bannersRes.data as BannerRow[] | null) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    cost: row.cost,
    currency: row.currency,
    featuredUnitIds: row.featured_unit_ids ?? [],
    description: row.description,
    active: row.active,
  }));

  return {
    units: remoteUnits.length > 0 ? remoteUnits : gameContent.units,
    items: remoteItems.length > 0 ? remoteItems : gameContent.items,
    quests: remoteQuests.length > 0 ? remoteQuests : gameContent.quests,
    banners: remoteBanners.length > 0 ? remoteBanners : gameContent.banners,
    jobs: remoteJobs.length > 0 ? remoteJobs : gameContent.jobs,
    enemies: gameContent.enemies,
  };
}
