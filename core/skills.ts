import type { SkillDefinition } from '@/backend-contracts/game';

export interface SkillPool {
  [jobId: string]: {
    tier1: SkillDefinition[];
    tier2: SkillDefinition[];
    tier3: SkillDefinition[];
  };
}

const SWORDSMAN_SKILLS: SkillDefinition[] = [
  { id: 'sword_bash', type: 'active', title: 'Bash', description: 'Deals 150% damage to single target', cost: '8 SP' },
  { id: 'sword_endure', type: 'passive', title: 'Endure', description: 'Increases DEF by 10 during combat' },
  { id: 'sword_magnum', type: 'active', title: 'Magnum Break', description: 'Deals 110% AoE damage to enemies', cost: '12 SP' },
  { id: 'sword_battleshield', type: 'active', title: 'Battle Shield', description: 'Increases DEF by 20 for 30 seconds', cost: '10 SP' },
  { id: 'sword_shield', type: 'passive', title: 'Shield Mastery', description: 'Increases shield DEF by 15%' },
  { id: 'sword_onehand', type: 'passive', title: 'One-Hand Mastery', description: 'Increases ATK by 10% when using one-handed sword' },
];

const KNIGHT_SKILLS: SkillDefinition[] = [
  { id: 'knight_bowling', type: 'active', title: 'Bowling Bash', description: 'Deals 200% damage in a line', cost: '15 SP' },
  { id: 'knight_bladedash', type: 'active', title: 'Blade Dash', description: 'Teleports and deals 180% damage', cost: '20 SP' },
  { id: 'knight_parry', type: 'active', title: 'Parry', description: 'Block next attack with 50% chance', cost: '12 SP' },
  { id: 'knight_spear', type: 'passive', title: 'Spear Mastery', description: 'Increases spear ATK by 20%' },
  { id: 'knight_aura', type: 'active', title: 'Aura Blade', description: 'Adds 30 ATK to weapon for 30 seconds', cost: '25 SP' },
  { id: 'knight_recovery', type: 'passive', title: 'HP Recovery', description: 'Recover 5 HP per 10 seconds' },
];

const PALADIN_SKILLS: SkillDefinition[] = [
  { id: 'paladin_grandcross', type: 'active', title: 'Grand Cross', description: 'Deals 300% holy damage in cross pattern', cost: '40 SP' },
  { id: 'paladin_shieldcharge', type: 'active', title: 'Shield Charge', description: 'Charge enemy for 180% + shield DEF', cost: '25 SP' },
  { id: 'paladin_divine', type: 'active', title: 'Divine Protection', description: 'Reduces party damage by 30%', cost: '30 SP' },
  { id: 'paladin_sanctuary', type: 'active', title: 'Sanctuary', description: 'Creates safe zone, 0 damage taken', cost: '50 SP' },
  { id: 'paladin_reflect', type: 'passive', title: 'Reflect', description: 'Reflects 20% damage back to attacker' },
  { id: 'paladin_holy', type: 'passive', title: 'Holy Mastery', description: 'Increases holy damage by 25%' },
];

const MAGE_SKILLS: SkillDefinition[] = [
  { id: 'mage_firebolt', type: 'active', title: 'Fire Bolt', description: 'Deals 150% fire magic damage', cost: '10 SP' },
  { id: 'mage_coldbolt', type: 'active', title: 'Cold Bolt', description: 'Deals 150% ice magic damage', cost: '10 SP' },
  { id: 'mage_lightning', type: 'active', title: 'Lightening Bolt', description: 'Deals 140% lightning damage', cost: '10 SP' },
  { id: 'mage_napalm', type: 'active', title: 'Napalm Beat', description: 'Deals 100% + drains 5 SP', cost: '8 SP' },
  { id: 'mage_safety', type: 'passive', title: 'Safety', description: 'Reduces aftercast by 30%' },
  { id: 'mage_intimidate', type: 'passive', title: 'Intimidate', description: 'Increases INT by 10' },
];

const WIZARD_SKILLS: SkillDefinition[] = [
  { id: 'wizard_firewall', type: 'active', title: 'Fire Wall', description: 'Deals 200% damage over 3 tiles', cost: '20 SP' },
  { id: 'wizard_meteor', type: 'active', title: 'Meteor Storm', description: 'Deals 250% AoE fire damage', cost: '35 SP' },
  { id: 'wizard_frost', type: 'active', title: 'Frost Diver', description: 'Deals 180% + 30% freeze chance', cost: '18 SP' },
  { id: 'wizard_jupiter', type: 'active', title: 'Jupiter Thunder', description: 'Deals 300% lightning to 3 enemies', cost: '40 SP' },
  { id: 'wizard_eyes', type: 'passive', title: 'Open Eyes', description: 'Increases MATK by 15%' },
  { id: 'wizard_staff', type: 'passive', title: 'Staff Mastery', description: 'Increases staff MATK by 20%' },
];

const SAGE_SKILLS: SkillDefinition[] = [
  { id: 'sage_vermilion', type: 'active', title: 'Lord of Vermillion', description: 'Deals 400% lightning AoE', cost: '60 SP' },
  { id: 'sage_storm', type: 'active', title: 'Storm Gust', description: 'Deals 350% ice AoE + freeze', cost: '50 SP' },
  { id: 'sage_comet', type: 'active', title: 'Comet', description: 'Deals 380% fire to enemy with most HP', cost: '55 SP' },
  { id: 'sage_distract', type: 'active', title: 'Distract', description: 'Reduces enemy INT by 30%', cost: '25 SP' },
  { id: 'sage_wisdom', type: 'passive', title: 'Wisdom', description: 'Increases SP recovery by 20%' },
  { id: 'sage_soul', type: 'passive', title: 'Soul Exile', description: 'Increases Max SP by 25%' },
];

const ARCHER_SKILLS: SkillDefinition[] = [
  { id: 'archer_double', type: 'active', title: 'Double Strafe', description: 'Deals 140% damage twice', cost: '10 SP' },
  { id: 'archer_arrowshower', type: 'active', title: 'Arrow Shower', description: 'Deals 120% AoE damage', cost: '12 SP' },
  { id: 'archer_owls', type: 'passive', title: "Owl's Eye", description: 'Increases DEX by 10' },
  { id: 'archer_aimed', type: 'active', title: 'Aimed Shot', description: 'Deals 170% critical damage', cost: '15 SP' },
  { id: 'archer_feign', type: 'active', title: 'Feign Death', description: 'Avoid all damage for 5 seconds', cost: '20 SP' },
  { id: 'archer_charge', type: 'passive', title: 'Charge Arrow', description: 'Increases arrow damage by 15%' },
];

const HUNTER_SKILLS: SkillDefinition[] = [
  { id: 'hunter_falcon', type: 'active', title: 'Falcon Assault', description: 'Deals 200% with falcon companion', cost: '25 SP' },
  { id: 'hunter_blazar', type: 'active', title: 'Blazar Beast', description: 'Falcon deals 180% to all enemies', cost: '30 SP' },
  { id: 'hunter_fear', type: 'active', title: 'Fear Breeze', description: 'Reduces enemy DEF by 25%', cost: '20 SP' },
  { id: 'hunter_tracking', type: 'active', title: 'Tracking', description: 'Increases damage to target by 30%', cost: '15 SP' },
  { id: 'hunter_falconmaster', type: 'passive', title: 'Falcon Mastery', description: 'Falcon ATK +30%' },
  { id: 'hunter_explosive', type: 'passive', title: 'Explosive Arrow', description: 'Arrow explosion deals extra 20%' },
];

const SNIPER_SKILLS: SkillDefinition[] = [
  { id: 'sniper_predator', type: 'active', title: "Predator's Rush", description: 'Deals 300% to weak enemies', cost: '40 SP' },
  { id: 'sniper_clap', type: 'active', title: 'Clap', description: 'Deals 250% + silence chance', cost: '35 SP' },
  { id: 'sniper_aim', type: 'active', title: 'Perfect Aim', description: 'next 3 attacks crit for 300%', cost: '45 SP' },
  { id: 'sniper_focus', type: 'passive', title: 'Focus', description: 'Critical rate +25%' },
  { id: 'sniper_triple', type: 'passive', title: 'Triple Attack', description: '30% chance for triple hit' },
  { id: 'sniper_elemental', type: 'passive', title: 'Elemental Arrow', description: 'Arrows deal +20% elemental damage' },
];

const THIEF_SKILLS: SkillDefinition[] = [
  { id: 'thief_backstab', type: 'active', title: 'Backstab', description: 'Deals 250% damage from behind', cost: '10 SP' },
  { id: 'thief_steal', type: 'active', title: 'Steal', description: 'Steal item from enemy', cost: '15 SP' },
  { id: 'thief_envenom', type: 'active', title: 'Envenom', description: 'Deals 120% + poison for 20 sec', cost: '12 SP' },
  { id: 'thief_hide', type: 'active', title: 'Hide', description: 'Become invisible for 30 seconds', cost: '15 SP' },
  { id: 'thief_dagger', type: 'passive', title: 'Dagger Mastery', description: 'Increases dagger ATK by 15%' },
  { id: 'thief_stealth', type: 'passive', title: 'Stealth', description: 'Increases AGI by 10' },
];

const ASSASSIN_SKILLS: SkillDefinition[] = [
  { id: 'assassin_enchant', type: 'active', title: 'Enchant Blade', description: 'Weapon deals +50% more damage', cost: '25 SP' },
  { id: 'assassin_soulbreaker', type: 'active', title: 'Soul Breaker', description: 'Deals 300% + ignores defense', cost: '30 SP' },
  { id: 'assassin_cross', type: 'active', title: 'Cross Impact', description: 'Deals 250% to 3 enemies', cost: '28 SP' },
  { id: 'assassin_cloak', type: 'active', title: 'Cloaking', description: 'Invisible + +50% ATK', cost: '35 SP' },
  { id: 'assassin_poison', type: 'passive', title: 'Poison Mastery', description: 'Poison deals +30% damage' },
  { id: 'assassin_crit', type: 'passive', title: 'Critical Mastery', description: 'Critical damage +40%' },
];

const LORD_SKILLS: SkillDefinition[] = [
  { id: 'lord_meteor', type: 'active', title: 'Meteor Assault', description: 'Deals 350% to 5 enemies', cost: '50 SP' },
  { id: 'lord_grim', type: 'active', title: 'Grim Reaper', description: '50% chance to instant kill', cost: '60 SP' },
  { id: 'lord_shadow', type: 'active', title: 'Shadow Slash', description: 'Deals 300% + drains HP', cost: '45 SP' },
  { id: 'lord_thorn', type: 'passive', title: 'Shadow Thorn', description: 'Each hit has 20% poison' },
  { id: 'lord_voltage', type: 'passive', title: 'Voltage', description: 'ATK +35% when hidden' },
  { id: 'lord_immortal', type: 'passive', title: 'Immortal', description: 'Survive fatal blow once per battle' },
];

const MERCHANT_SKILLS: SkillDefinition[] = [
  { id: 'merchant_discount', type: 'active', title: 'Discount', description: 'Item costs 20% less', cost: '10 SP' },
  { id: 'merchant_overcharge', type: 'active', title: 'Overcharge', description: 'Sell items for 20% more', cost: '10 SP' },
  { id: 'merchant_pushcart', type: 'active', title: 'Push Cart', description: 'Carry more items', cost: '15 SP' },
  { id: 'merchant_vending', type: 'active', title: 'Vending', description: 'Open shop to sell items', cost: '20 SP' },
  { id: 'merchant_coin', type: 'passive', title: 'Mammonite', description: 'Zel drop rate +20%' },
  { id: 'merchant_smith', type: 'passive', title: 'Smith Sword', description: 'Forging chance +15%' },
];

const BLACKSMITH_SKILLS: SkillDefinition[] = [
  { id: 'bs_cart', type: 'active', title: 'Cart Revolution', description: 'Push cart deals 150% AoE', cost: '20 SP' },
  { id: 'bs_adrenaline', type: 'active', title: 'Adrenaline', description: 'Attack speed +30% for 30s', cost: '25 SP' },
  { id: 'bs_ore', type: 'active', title: 'Ore Discovery', description: 'Find better ores', cost: '15 SP' },
  { id: 'bs_weapon', type: 'active', title: 'Weapon Refine', description: 'Upgrade weapon +1', cost: '30 SP' },
  { id: 'bs_melt', type: 'passive', title: 'Melt Hammer', description: 'Weapon upgrade chance +10%' },
  { id: 'bs_unite', type: 'passive', title: 'Unite', description: 'Cart ATK +25%' },
];

const CHAMPION_SKILLS: SkillDefinition[] = [
  { id: 'champion_max', type: 'active', title: 'Maximum Overclock', description: 'Cart deals 300% + ATK bonus', cost: '60 SP' },
  { id: 'champion_full', type: 'active', title: 'Full Chemical', description: '300% to all enemies', cost: '55 SP' },
  { id: 'champion_crash', type: 'active', title: 'Cart Crash', description: 'Cart deals 250% + stun', cost: '45 SP' },
  { id: 'champion_detonate', type: 'passive', title: 'Detonate', description: 'Cart explosion +30% damage' },
  { id: 'champion_berserk', type: 'passive', title: 'Berserk', description: 'ATK +40% below 30% HP' },
  { id: 'champion_iron', type: 'passive', title: 'Iron Hands', description: 'Item steal chance +25%' },
];

const ACOLYTE_SKILLS: SkillDefinition[] = [
  { id: 'acolyte_heal', type: 'active', title: 'Heal', description: 'Restores 100% HP to ally', cost: '12 SP' },
  { id: 'acolyte_light', type: 'active', title: 'Light', description: 'Increases ally ATK by 15%', cost: '10 SP' },
  { id: 'acolyte_angelus', type: 'active', title: 'Angelus', description: 'Increases party DEF by 20%', cost: '15 SP' },
  { id: 'acolyte_bolt', type: 'active', title: 'Holy Bolt', description: 'Deals 130% holy to enemy', cost: '8 SP' },
  { id: 'acolyte_blessing', type: 'passive', title: 'Blessing', description: 'SP cost -10%' },
  { id: 'acolyte_divine', type: 'passive', title: 'Divine Protection', description: 'DEF +10' },
];

const PRIEST_SKILLS: SkillDefinition[] = [
  { id: 'priest_sanctuary', type: 'active', title: 'Sanctuary', description: 'Creates safe zone, recovers HP', cost: '40 SP' },
  { id: 'priest_meditation', type: 'active', title: 'Meditation', description: 'Party MATK +30% for 30s', cost: '30 SP' },
  { id: 'priest_plea', type: 'active', title: 'Plea', description: 'Transfer 50% SP to ally', cost: '20 SP' },
  { id: 'priest_impositio', type: 'active', title: 'Impositio', description: 'Party ATK/DEF +25%', cost: '35 SP' },
  { id: 'priest_spirit', type: 'passive', title: 'Spirits', description: 'Heal effectiveness +20%' },
  { id: 'priest_assumptio', type: 'passive', title: 'Assumptio', description: 'Healed target takes -30% damage' },
];

const HIGHPRIEST_SKILLS: SkillDefinition[] = [
  { id: 'highpriest_resurect', type: 'active', title: 'Resurrection', description: 'Revive ally with 50% HP', cost: '80 SP' },
  { id: 'highpriest_suffragium', type: 'active', title: 'Suffragium', description: 'Ally cast time -50%', cost: '45 SP' },
  { id: 'highpriest_buheal', type: 'active', title: 'Banner Heal', description: 'Heals 200% to party', cost: '60 SP' },
  { id: 'highpriest_magic', type: 'passive', title: 'Magic Piercing', description: 'Ignores enemy MDEF by 30%' },
  { id: 'highpriest_tolerance', type: 'passive', title: 'Tolerance', description: 'Status duration -30%' },
  { id: 'highpriest_revival', type: 'passive', title: 'Revival', description: 'Resurrection gives 75% HP' },
];

const BARD_SKILLS: SkillDefinition[] = [
  { id: 'bard_ensemble', type: 'active', title: 'Ensemble', description: 'Buff party with random song', cost: '15 SP' },
  { id: 'bard_Frigg', type: 'active', title: 'Frigg Song', description: 'Party ATK +20%', cost: '12 SP' },
  { id: 'bard_hero', type: 'active', title: 'Hero\'s Ballad', description: 'Party STR +20', cost: '12 SP' },
  { id: 'bard_wander', type: 'passive', title: 'Wanderer', description: 'Movement speed +15%' },
  { id: 'birdman', type: 'passive', title: 'Bird Song', description: 'Song duration +30%' },
  { id: 'whistle', type: 'passive', title: 'Whistle', description: 'Movement speed +10' },
];

const CLOWN_SKILLS: SkillDefinition[] = [
  { id: 'clown_mis', type: 'active', title: 'Mixt', description: 'Random buff to party', cost: '30 SP' },
  { id: 'clown_arc', type: 'active', title: 'Arc Moon Song', description: 'Party INT +25', cost: '25 SP' },
  { id: 'clown_gloom', type: 'active', title: 'Gloom Shot', description: 'Deals 180% + reduces DEF', cost: '28 SP' },
  { id: 'clown_love', type: 'active', title: 'Love Song', description: 'Enemy ATK -30%', cost: '20 SP' },
  { id: 'clown_sonic', type: 'passive', title: 'Sonic Cue', description: 'Song cast time -30%' },
  { id: 'clown_troub', type: 'passive', title: 'Troubadour', description: 'Song effect +25%' },
];

const ROYALBARD_SKILLS: SkillDefinition[] = [
  { id: 'royal_symphony', type: 'active', title: 'Symphony', description: 'All party buffs at once', cost: '70 SP' },
  { id: 'royal_requiem', type: 'active', title: 'Requiem', description: 'Drains 40 SP from enemies', cost: '50 SP' },
  { id: 'royal_fantas', type: 'active', title: 'Fantasized', description: 'Party has +50% all stats', cost: '60 SP' },
  { id: 'royal_minstrel', type: 'passive', title: 'Minstrel Song', description: 'Music ATK +35%' },
  { id: 'royal_chord', type: 'passive', title: 'Chord', description: 'Song cooldown -40%' },
  { id: 'royal_echo', type: 'passive', title: 'Echo Song', description: 'Final song heals party' },
];

const DANCER_SKILLS: SkillDefinition[] = [
  { id: 'dancer_sway', type: 'active', title: 'Sway', description: 'Dance, party AGI +20', cost: '15 SP' },
  { id: 'dancer_waltz', type: 'active', title: 'Waltz', description: 'Dance, party DEF +20%', cost: '15 SP' },
  { id: 'dancer_gypsy', type: 'active', title: 'Gypsy Song', description: 'Dance, party INT +20', cost: '12 SP' },
  { id: 'dancer_slow', type: 'active', title: 'Slow Dance', description: 'Enemy AGI -30%', cost: '20 SP' },
  { id: 'dance_heart', type: 'passive', title: 'Heart Breaker', description: 'Dance effect +20%' },
  { id: 'dance_dash', type: 'passive', title: 'Dash', description: 'Movement speed +15%' },
];

const GYPSY_SKILLS: SkillDefinition[] = [
  { id: 'gyps_ kiss', type: 'active', title: ' Kiss', description: 'Deals 200% + charm', cost: '30 SP' },
  { id: 'gyps_shadow', type: 'active', title: 'Shadow Dance', description: 'Deals 250% + evasion +30%', cost: '35 SP' },
  { id: 'gyps_focus', type: 'active', title: 'Focus Dance', description: 'Party critical rate +25%', cost: '28 SP' },
  { id: 'gyps_allure', type: 'active', title: 'Allure', description: 'Charm 3 enemies', cost: '40 SP' },
  { id: 'gyps_kick', type: 'passive', title: 'Kick', description: 'Kick damage +30%' },
  { id: 'gyps_tumble', type: 'passive', title: 'Tumble', description: 'Dodge +20%' },
];

const ROYALDANCER_SKILLS: SkillDefinition[] = [
  { id: 'royald_moon', type: 'active', title: 'Moonlight', description: 'Party +50% ATK and DEF', cost: '70 SP' },
  { id: 'royald_spiral', type: 'active', title: 'Spiral Kick', description: '350% AoE damage', cost: '55 SP' },
  { id: 'royald_can', type: 'active', title: 'Can Can', description: 'Random debuff to all', cost: '60 SP' },
  { id: 'royald_eternal', type: 'passive', title: 'Eternal', description: 'All stats +20% after dance' },
  { id: 'royald_frenzy', type: 'passive', title: 'Frenzy', description: 'Attack speed +40%' },
  { id: 'royald_impulse', type: 'passive', title: 'Impulse', description: 'After combo +15% damage' },
];

export const SKILL_POOL: SkillPool = {
  job_swordman: { tier1: SWORDSMAN_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_knight: { tier1: SWORDSMAN_SKILLS.slice(0, 3), tier2: KNIGHT_SKILLS.slice(0, 3), tier3: [] },
  job_paladin: { tier1: SWORDSMAN_SKILLS.slice(0, 3), tier2: KNIGHT_SKILLS.slice(0, 3), tier3: PALADIN_SKILLS.slice(0, 3) },
  job_mage: { tier1: MAGE_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_wizard: { tier1: MAGE_SKILLS.slice(0, 3), tier2: WIZARD_SKILLS.slice(0, 3), tier3: [] },
  job_sage: { tier1: MAGE_SKILLS.slice(0, 3), tier2: WIZARD_SKILLS.slice(0, 3), tier3: SAGE_SKILLS.slice(0, 3) },
  job_archer: { tier1: ARCHER_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_hunter: { tier1: ARCHER_SKILLS.slice(0, 3), tier2: HUNTER_SKILLS.slice(0, 3), tier3: [] },
  job_sniper: { tier1: ARCHER_SKILLS.slice(0, 3), tier2: HUNTER_SKILLS.slice(0, 3), tier3: SNIPER_SKILLS.slice(0, 3) },
  job_thief: { tier1: THIEF_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_assassin: { tier1: THIEF_SKILLS.slice(0, 3), tier2: ASSASSIN_SKILLS.slice(0, 3), tier3: [] },
  job_lord: { tier1: THIEF_SKILLS.slice(0, 3), tier2: ASSASSIN_SKILLS.slice(0, 3), tier3: LORD_SKILLS.slice(0, 3) },
  job_merchant: { tier1: MERCHANT_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_blacksmith: { tier1: MERCHANT_SKILLS.slice(0, 3), tier2: BLACKSMITH_SKILLS.slice(0, 3), tier3: [] },
  job_champion: { tier1: MERCHANT_SKILLS.slice(0, 3), tier2: BLACKSMITH_SKILLS.slice(0, 3), tier3: CHAMPION_SKILLS.slice(0, 3) },
  job_acolyte: { tier1: ACOLYTE_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_priest: { tier1: ACOLYTE_SKILLS.slice(0, 3), tier2: PRIEST_SKILLS.slice(0, 3), tier3: [] },
  job_highpriest: { tier1: ACOLYTE_SKILLS.slice(0, 3), tier2: PRIEST_SKILLS.slice(0, 3), tier3: HIGHPRIEST_SKILLS.slice(0, 3) },
  job_bard: { tier1: BARD_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_clown: { tier1: BARD_SKILLS.slice(0, 3), tier2: CLOWN_SKILLS.slice(0, 3), tier3: [] },
  job_royalbard: { tier1: BARD_SKILLS.slice(0, 3), tier2: CLOWN_SKILLS.slice(0, 3), tier3: ROYALBARD_SKILLS.slice(0, 3) },
  job_dancer: { tier1: DANCER_SKILLS.slice(0, 3), tier2: [], tier3: [] },
  job_gypsy: { tier1: DANCER_SKILLS.slice(0, 3), tier2: GYPSY_SKILLS.slice(0, 3), tier3: [] },
  job_royaldancer: { tier1: DANCER_SKILLS.slice(0, 3), tier2: GYPSY_SKILLS.slice(0, 3), tier3: ROYALDANCER_SKILLS.slice(0, 3) },
};

export function getSkillsForJobTier(jobId: string, tier: '1' | '2' | '3', count: number): SkillDefinition[] {
  const job = SKILL_POOL[jobId];
  if (!job) return [];
  
  const allSkills = [...job.tier1];
  if (parseInt(tier) >= 2) allSkills.push(...job.tier2);
  if (parseInt(tier) >= 3) allSkills.push(...job.tier3);
  
  const shuffled = allSkills.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}