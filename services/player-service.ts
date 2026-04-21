import type { GameBootstrap } from '@/backend-contracts/game';
import { bootstrapData } from '@/content/game-content';
import { getSupabaseBrowserClient } from '@/services/supabase/client';

export async function loadPlayerBootstrap(): Promise<GameBootstrap> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return bootstrapData;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return bootstrapData;

  return bootstrapData;
}
