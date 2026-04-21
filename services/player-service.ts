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

  if (session) return { supabase, session };

  const anonymousSignIn = await supabase.auth.signInAnonymously();
  if (anonymousSignIn.error || !anonymousSignIn.data.session) {
    return null;
  }

  return { supabase, session: anonymousSignIn.data.session };
}

export async function loadPlayerBootstrap(): Promise<GameBootstrap> {
  const connection = await ensureSession();
  if (!connection) return bootstrapData;

  const { supabase, session } = connection;
  const userId = session.user.id;

  const [profileRes, currenciesRes, unitsRes, itemsRes] = await Promise.all([
    supabase.from('player_profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('player_currencies').select('code, amount').eq('player_id', userId),
    supabase.from('player_units').select('id, unit_id, level, exp, locked, equipment').eq('player_id', userId),
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
    locked: unit.locked,
    equipment: unit.equipment ?? { Weapon: null, Armor: null, Accessory: null },
  }));

  const remoteItems = ((itemsRes.data as PlayerItemRow[] | null) ?? []).map((item) => ({
    itemId: item.item_id,
    quantity: item.quantity,
  }));

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
      currencies,
    },
    roster: remoteRoster.length > 0 ? remoteRoster : defaultRoster,
    items: remoteItems.length > 0 ? remoteItems : defaultInventory,
  };
}
