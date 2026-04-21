import type { BattleState, CurrencyCode } from '@/backend-contracts/game';
import { getSupabaseBrowserClient } from '@/services/supabase/client';

// Supabase client type for bypass
type SupabaseClient = ReturnType<typeof getSupabaseBrowserClient>;

// Types for write operations
type WriteResult = { success: boolean; error?: string };

interface CurrencyChange {
  code: CurrencyCode;
  amount: number; // positive to add, negative to subtract
}

interface UnitExpGain {
  instanceId: string;
  expGained: number;
}

interface ItemReward {
  itemId: string;
  quantity: number;
}

async function ensureSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) return { supabase, session };

  const anonymousSignIn = await supabase.auth.signInAnonymously();
  if (anonymousSignIn.error || !anonymousSignIn.data.session) {
    return null;
  }

  return { supabase, session: anonymousSignIn.data.session };
}

/**
 * Update player currencies (for battle rewards, summon costs, etc.)
 */
export async function updateCurrencies(
  changes: CurrencyChange[]
): Promise<WriteResult & { newBalances?: Partial<Record<CurrencyCode, number>> }> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  // Process each change individually (simpler approach)
  const results: Array<{ code: string; amount: number }> = [];
  
  for (const change of changes) {
    // Get current balance
    const { data: currentData } = await supabase
      .from('player_currencies')
      .select('amount')
      .eq('player_id', userId)
      .eq('code', change.code)
      .single();
    
    const current = (currentData as { amount: number } | null)?.amount ?? 0;
    const newAmount = current + change.amount;
    
    if (newAmount < 0) {
      return { success: false, error: `Insufficient ${change.code} (have ${current}, need ${Math.abs(change.amount)})` };
    }
    
    results.push({ code: change.code, amount: newAmount });
    
    // Use raw SQL through RPC or bypass type checking
    const { error } = await (supabase as any).from('player_currencies').insert({
      player_id: userId,
      code: change.code,
      amount: newAmount,
    }, { upsert: true });
    
    if (error) {
      return { success: false, error: error.message };
    }
  }

  return {
    success: true,
    newBalances: Object.fromEntries(results.map(r => [r.code, r.amount])) as Partial<Record<CurrencyCode, number>>,
  };
}

/**
 * Add a new unit to the player's roster (from summons)
 */
export async function addUnitToRoster(
  unitId: string,
  jobId: string,
  level: number = 1
): Promise<WriteResult & { instanceId?: string }> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  // Verify unit exists
  const { data: unitDef } = await supabase
    .from('unit_definitions')
    .select('id, job_id')
    .eq('id', unitId)
    .maybeSingle();

  if (!unitDef) {
    return { success: false, error: 'Unit definition not found' };
  }

  // Use provided jobId or the unit's default job
  const finalJobId = jobId || (unitDef as { job_id: string }).job_id;

  // Insert into player_units (bypass type checking for custom columns)
  const { data: newUnit, error: insertError } = await (supabase as any)
    .from('player_units')
    .insert({
      player_id: userId,
      unit_id: unitId,
      level,
      exp: 0,
      job_id: finalJobId,
      job_level: 1,
      job_exp: 0,
      locked: false,
      equipment: { Weapon: null, Armor: null, Accessory: null },
    })
    .select('id')
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, instanceId: (newUnit as { id: string }).id };
}

/**
 * Update unit exp and handle level-ups
 */
export async function addUnitExp(
  gains: UnitExpGain[]
): Promise<WriteResult & { leveledUnits?: Array<{ instanceId: string; newLevel: number; newExp: number }> }> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  const leveledUnits: Array<{ instanceId: string; newLevel: number; newExp: number }> = [];

  for (const gain of gains) {
    // Get current unit
    const { data: unit } = await supabase
      .from('player_units')
      .select('id, unit_id, level, exp, job_level, job_exp')
      .eq('player_id', userId)
      .eq('id', gain.instanceId)
      .single();

    if (!unit) continue;

    const currentUnit = unit as {
      id: string;
      unit_id: string;
      level: number;
      exp: number;
      job_level: number;
      job_exp: number;
    };

    // Get unit definition for max level
    const { data: unitDef } = await supabase
      .from('unit_definitions')
      .select('max_level, max_job_level')
      .eq('id', currentUnit.unit_id)
      .single();

    const maxLevel = unitDef ? (unitDef as { max_level: number }).max_level : 50;
    const maxExp = Math.max(15, maxLevel * 150);

    let newExp = currentUnit.exp + gain.expGained;
    let newLevel = currentUnit.level;

    // Handle level up
    while (newExp >= maxExp && newLevel < maxLevel) {
      newExp -= maxExp;
      newLevel++;
    }

    // Cap at max
    if (newLevel >= maxLevel) {
      newExp = Math.min(newExp, maxExp);
    }

    if (newLevel > currentUnit.level) {
      leveledUnits.push({ instanceId: currentUnit.id, newLevel, newExp: Math.min(newExp, maxExp) });
    }

    // Update the unit (bypass type checking)
    const { error } = await (supabase as any)
      .from('player_units')
      .update({ level: newLevel, exp: Math.min(newExp, maxExp) })
      .eq('player_id', userId)
      .eq('id', gain.instanceId);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, leveledUnits };
}

/**
 * Add items to player inventory
 */
export async function addItems(
  rewards: ItemReward[]
): Promise<WriteResult & { newQuantities?: Record<string, number> }> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  for (const reward of rewards) {
    // Get current quantity
    const { data: currentData } = await supabase
      .from('player_items')
      .select('quantity')
      .eq('player_id', userId)
      .eq('item_id', reward.itemId)
      .single();

    const current = (currentData as { quantity: number } | null)?.quantity ?? 0;
    const newQuantity = current + reward.quantity;

    // Use raw insert with upsert bypass
    const { error } = await (supabase as any).from('player_items').insert({
      player_id: userId,
      item_id: reward.itemId,
      quantity: newQuantity,
    }, { upsert: true });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Record quest completion or attempt
 */
export async function updateQuestProgress(
  questId: string,
  completed: boolean
): Promise<WriteResult> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  // Check if record exists
  const { data: existing } = await supabase
    .from('player_quest_progress')
    .select('attempts, completed')
    .eq('player_id', userId)
    .eq('quest_id', questId)
    .maybeSingle();

  if (existing) {
    const existingData = existing as { attempts: number; completed: boolean };
    // Update existing (bypass type checking)
    const { error } = await (supabase as any)
      .from('player_quest_progress')
      .update({
        completed: completed || existingData.completed,
        attempts: (existingData.attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('player_id', userId)
      .eq('quest_id', questId);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Create new (bypass type checking)
    const { error } = await (supabase as any).from('player_quest_progress').insert({
      player_id: userId,
      quest_id: questId,
      completed,
      attempts: 1,
    });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Deduct energy for entering a quest
 */
export async function deductEnergy(
  questId: string
): Promise<WriteResult & { newEnergy?: number }> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  // Get current energy
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('energy_current, energy_max')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'Profile not found' };
  }

  const profileData = profile as { energy_current: number; energy_max: number };
  const currentEnergy = profileData.energy_current;

  // Get quest energy cost
  const { data: quest } = await supabase
    .from('quest_definitions')
    .select('energy_cost')
    .eq('id', questId)
    .single();

  if (!quest) {
    return { success: false, error: 'Quest not found' };
  }

  const energyCost = (quest as { energy_cost: number }).energy_cost;

  if (currentEnergy < energyCost) {
    return { success: false, error: 'Not enough energy' };
  }

  const newEnergy = currentEnergy - energyCost;

  // Update (bypass type checking)
  const { error } = await (supabase as any)
    .from('player_profiles')
    .update({ energy_current: newEnergy })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, newEnergy };
}

/**
 * Restore energy after quest attempt (if failed or fled)
 */
export async function restoreEnergy(amount: number): Promise<WriteResult> {
  const connection = await ensureSession();
  if (!connection) {
    return { success: false, error: 'Not authenticated' };
  }

  const { supabase, session } = connection;
  const userId = session.user.id;

  // Get current energy
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('energy_current, energy_max')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'Profile not found' };
  }

  const profileData = profile as { energy_current: number; energy_max: number };
  const newEnergy = Math.min(profileData.energy_current + amount, profileData.energy_max);

  const { error } = await (supabase as any)
    .from('player_profiles')
    .update({ energy_current: newEnergy })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Save battle result to server
 */
export async function saveBattleResult(
  battleState: BattleState,
  rewards: {
    currencies?: CurrencyChange[];
    unitExp?: UnitExpGain[];
    items?: ItemReward[];
  }
): Promise<WriteResult> {
  // Save currencies
  if (rewards.currencies && rewards.currencies.length > 0) {
    const result = await updateCurrencies(rewards.currencies);
    if (!result.success) return result;
  }

  // Save unit exp
  if (rewards.unitExp && rewards.unitExp.length > 0) {
    const result = await addUnitExp(rewards.unitExp);
    if (!result.success) return result;
  }

  // Save items
  if (rewards.items && rewards.items.length > 0) {
    const result = await addItems(rewards.items);
    if (!result.success) return result;
  }

  // Update quest progress
  if (battleState.questId && (battleState.battlePhase === 'victory' || battleState.battlePhase === 'defeat')) {
    const result = await updateQuestProgress(battleState.questId, battleState.battlePhase === 'victory');
    if (!result.success) return result;
  }

  return { success: true };
}