import { getSupabaseBrowserClient } from './supabase/client';
import gachaData from '@/content/gacha/rewards.json';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const RARITY_RATES = {
  common: 0.60,
  rare: 0.25,
  epic: 0.10,
  legendary: 0.04,
  mythic: 0.01,
};

const PITY_THRESHOLD = 50;
const PITY_RARITY: Rarity = 'rare';

export interface PullResult {
  type: 'card' | 'weapon' | 'skill';
  item: any;
  rarity: Rarity;
}

const CARDS = gachaData.cards;
const WEAPONS = gachaData.weapons;
const SKILLS = gachaData.skills;

function rollRarity(): Rarity {
  const roll = Math.random();
  let cumulative = 0;
  
  const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  
  for (const rarity of rarities) {
    cumulative += RARITY_RATES[rarity];
    if (roll < cumulative) {
      return rarity;
    }
  }
  return 'common';
}

function getItemsByRarity(items: any[], rarity: Rarity): any[] {
  return items.filter(item => item.rarity === rarity);
}

function getRandomItem(items: any[]): any {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export async function pullSingle(playerId: string, pool: string = 'standard'): Promise<PullResult> {
  const supabase = getSupabaseBrowserClient();
  const rarity = rollRarity();
  
  const rollType = Math.random();
  let type: 'card' | 'weapon' | 'skill';
  
  if (rollType < 0.5) {
    type = 'card';
  } else if (rollType < 0.8) {
    type = 'weapon';
  } else {
    type = 'skill';
  }
  
  let itemPool: any[];
  switch (type) {
    case 'card':
      itemPool = getItemsByRarity(CARDS, rarity);
      if (itemPool.length === 0) itemPool = getItemsByRarity(CARDS, 'common');
      break;
    case 'weapon':
      itemPool = getItemsByRarity(WEAPONS, rarity);
      if (itemPool.length === 0) itemPool = getItemsByRarity(WEAPONS, 'common');
      break;
    case 'skill':
      itemPool = getItemsByRarity(SKILLS, rarity);
      if (itemPool.length === 0) itemPool = getItemsByRarity(SKILLS, 'common');
      break;
    default:
      itemPool = [];
  }
  
  const item = getRandomItem(itemPool);
  
  if (!item) {
    return pullSingle(playerId, pool);
  }
  
  const result = { type, item, rarity };
  
  if (supabase) {
    const db = supabase as any;
    try {
      await db.from('gacha_pulls').insert({
        player_id: playerId,
        pool_id: pool,
        rarity_pulled: rarity,
        pity_count: 0,
      });
    } catch (e) {}
    
    try {
      if (type === 'card') {
        await db.from('player_cards').upsert({
          player_id: playerId,
          card_id: item.id,
          rarity: item.rarity,
          quantity: 1,
        }, { onConflict: 'player_id, card_id' });
      } else if (type === 'weapon') {
        await db.from('player_weapons').insert({
          player_id: playerId,
          weapon_id: item.id,
          rarity: item.rarity,
        });
      } else if (type === 'skill') {
        await db.from('player_skills').upsert({
          player_id: playerId,
          skill_id: item.id,
          unlocked: true,
        }, { onConflict: 'player_id, skill_id' });
      }
    } catch (e) {}
  }
  
  return result;
}

export async function pullMulti(playerId: string, pool: string = 'standard'): Promise<PullResult[]> {
  const results: PullResult[] = [];
  
  const firstPull = await pullSingle(playerId, pool);
  results.push(firstPull);
  
  for (let i = 0; i < 9; i++) {
    const rarity = rollRarity();
    const forcedRarity = rarity === 'common' ? 'rare' : rarity;
    
    const typeRoll = Math.random();
    let type: 'card' | 'weapon' | 'skill';
    
    if (typeRoll < 0.5) {
      type = 'card';
    } else if (typeRoll < 0.8) {
      type = 'weapon';
    } else {
      type = 'skill';
    }
    
    let itemPool: any[];
    switch (type) {
      case 'card':
        itemPool = getItemsByRarity(CARDS, forcedRarity);
        if (itemPool.length === 0) itemPool = CARDS;
        break;
      case 'weapon':
        itemPool = getItemsByRarity(WEAPONS, forcedRarity);
        if (itemPool.length === 0) itemPool = WEAPONS;
        break;
      case 'skill':
        itemPool = getItemsByRarity(SKILLS, forcedRarity);
        if (itemPool.length === 0) itemPool = SKILLS;
        break;
      default:
        itemPool = [];
    }
    
    const item = getRandomItem(itemPool);
    if (item) {
      results.push({ type, item, rarity: forcedRarity });
    }
  }
  
  return results;
}

export function getCardById(cardId: string): any {
  return CARDS.find(c => c.id === cardId);
}

export function getWeaponById(weaponId: string): any {
  return WEAPONS.find(w => w.id === weaponId);
}

export function getSkillById(skillId: string): any {
  return SKILLS.find(s => s.id === skillId);
}

export function applyCardEffects(baseStats: any, cards: any[]): any {
  const result = { ...baseStats };
  
  for (const card of cards) {
    if (!card.effect) continue;
    
    if (card.effect.type === 'stat' && card.effect.stat) {
      const stat = card.effect.stat;
      if (result[stat] !== undefined) {
        result[stat] = Math.round(result[stat] * (1 + card.effect.value));
      }
    }
  }
  
  return result;
}