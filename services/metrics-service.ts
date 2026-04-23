import { getSupabaseBrowserClient } from '@/services/supabase/client';
import {
  PlayerBattleMetrics,
  getPlayerMetrics as coreGetPlayerMetrics,
  recordBattleOutcome as coreRecordBattleOutcome,
  getDefaultMetrics,
} from '@/core/balance-system';

export async function getPlayerMetrics(playerId: string): Promise<PlayerBattleMetrics> {
  const supabase = getSupabaseBrowserClient();
  return coreGetPlayerMetrics(playerId, supabase);
}

export async function recordBattleOutcome(
  playerId: string,
  difficulty: string,
  victory: boolean,
  damageDealt: number,
  damageTaken: number,
  enemiesKilled: number,
  unitsLost: number
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  return coreRecordBattleOutcome(
    playerId,
    difficulty,
    victory,
    damageDealt,
    damageTaken,
    enemiesKilled,
    unitsLost,
    supabase
  );
}

export function getMetricsSync(playerId: string): PlayerBattleMetrics {
  return getDefaultMetrics(playerId);
}