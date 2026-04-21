import type { GameContent } from '@/backend-contracts/game';
import { gameContent } from '@/content/game-content';
import { getSupabaseBrowserClient } from '@/services/supabase/client';

export async function loadGameContent(): Promise<GameContent> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return gameContent;

  const [unitsRes, itemsRes, questsRes, bannersRes] = await Promise.all([
    supabase.from('unit_definitions').select('*'),
    supabase.from('item_definitions').select('*'),
    supabase.from('quest_definitions').select('*'),
    supabase.from('summon_banners').select('*'),
  ]);

  if (unitsRes.error || itemsRes.error || questsRes.error || bannersRes.error) {
    return gameContent;
  }

  return {
    units: (unitsRes.data as GameContent['units']) ?? gameContent.units,
    items: (itemsRes.data as GameContent['items']) ?? gameContent.items,
    quests: (questsRes.data as GameContent['quests']) ?? gameContent.quests,
    banners: (bannersRes.data as GameContent['banners']) ?? gameContent.banners,
  };
}
