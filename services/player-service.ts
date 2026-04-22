import type { GameBootstrap } from '@/backend-contracts/game';
import { bootstrapData, defaultInventory, defaultPlayerProfile, defaultRoster } from '@/content/game-content';
import { getSupabaseBrowserClient } from '@/services/supabase/client';

type ProfileRow = {
  id: string;
  display_name: string;
  level: number;
  energy_current: number;
  energy_max: number;
  energy_recover_at: string | null;
};

type CurrencyRow = {
  code: keyof typeof defaultPlayerProfile.currencies;
  amount: number;
};

type PlayerUnitRow = {
  id: string;
  unit_id: string;
  level: number;
  exp: number;
  job_id: string;
  job_level: number;
  job_exp: number;
  locked: boolean;
  equipment: {
    Weapon: string | null;
    Armor: string | null;
    Accessory: string | null;
  } | null;
};

type PlayerItemRow = {
  item_id: string;
  quantity: number;
};

async function ensureSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return { supabase, session };
}

export async function loadPlayerBootstrap(): Promise<GameBootstrap> {
  const connection = await ensureSession();
  if (!connection) return bootstrapData;

  const { supabase, session } = connection;
  const userId = session.user.id;

  const [profileRes, currenciesRes, unitsRes, itemsRes] = await Promise.all([
    supabase.from('player_profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('player_currencies').select('code, amount').eq('player_id', userId),
    supabase.from('player_units').select('id, unit_id, level, exp, job_id, job_level, job_exp, locked, equipment').eq('player_id', userId),
    supabase.from('player_items').select('item_id, quantity').eq('player_id', userId),
  ]);

  if (profileRes.error || !profileRes.data || currenciesRes.error || unitsRes.error || itemsRes.error) {
    return {
      ...bootstrapData,
      player: {
        ...bootstrapData.player,
        id: userId,
      },
    };
  }

  const profile = profileRes.data as ProfileRow;
  const currencies = { ...defaultPlayerProfile.currencies };
  for (const currency of (currenciesRes.data as CurrencyRow[] | null) ?? []) {
    currencies[currency.code] = currency.amount;
  }

  const remoteRoster = ((unitsRes.data as PlayerUnitRow[] | null) ?? []).map((unit) => ({
    instanceId: unit.id,
    unitId: unit.unit_id,
    level: unit.level,
    exp: unit.exp,
    jobId: unit.job_id,
    jobLevel: unit.job_level,
    jobExp: unit.job_exp,
    locked: unit.locked,
    equipment: unit.equipment ?? { Weapon: null, Armor: null, Accessory: null },
  }));

  const remoteItems = ((itemsRes.data as PlayerItemRow[] | null) ?? []).map((item) => ({
    itemId: item.item_id,
    quantity: item.quantity,
  }));

  const isLegacyUnitId = (id: string) => {
    return (
      id.startsWith('u_hero_') || id.startsWith('u_sergio_') ||
      id.startsWith('u_vargas') || id.startsWith('u_lance') ||
      id.startsWith('u_magress') || id.startsWith('u_silver') ||
      id.startsWith('u_bronze') || id.startsWith('u_gold') ||
      id.startsWith('u_platinum') || id.startsWith('u_diamond') ||
      !id.includes('_') || id.length < 10
    );
  };

  const hasLegacyRoster = remoteRoster.length > 0 && (
    remoteRoster.some(u => isLegacyUnitId(u.unitId)) || remoteRoster.length === 3
  );

  if (hasLegacyRoster && remoteRoster.length > 0) {
    const legacyIds = remoteRoster.map(u => u.instanceId);
    await supabase.from('player_units').delete().in('id', legacyIds);
  }

  return {
    ...bootstrapData,
    player: {
      id: profile.id,
      name: profile.display_name,
      level: profile.level,
      energy: {
        current: profile.energy_current,
        max: profile.energy_max,
        recoverAt: profile.energy_recover_at,
      },
      currencies: hasLegacyRoster 
        ? { gems: 25, zel: 1000, karma: 100 }
        : currencies,
    },
    roster: hasLegacyRoster ? [] : remoteRoster,
    items: hasLegacyRoster 
      ? [{ itemId: 'w_iron_sword', quantity: 1 }, { itemId: 'a_wood_shield', quantity: 1 }, { itemId: 'ac_power_ring', quantity: 1 }]
      : remoteItems,
  };
}
