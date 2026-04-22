import { getSupabaseBrowserClient } from './supabase/client';

export interface DailyQuest {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  periodStart: string;
  reward: {
    gems?: number;
    zel?: number;
    items?: Array<{ itemId: string; quantity: number }>;
  };
  timeUntilReset: number;
}

export interface QuestProgress {
  questId: string;
  questType: string;
  questTitle: string;
  progress: number;
  targetCount: number;
  completed: boolean;
  claimed: boolean;
  periodStart: string;
  canClaim: boolean;
  timeUntilReset: number;
}

export async function getDailyQuests(): Promise<DailyQuest[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  try {
    const { data, error } = await (supabase as any)
      .rpc('get_player_quest_progress', { p_player_id: session.user.id });

    if (error) {
      console.error('Error fetching daily quests:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.quest_id,
      type: row.quest_type,
      title: row.quest_title,
      description: row.quest_title,
      targetCount: row.target_count,
      progress: row.progress,
      completed: row.completed,
      claimed: row.claimed,
      periodStart: row.period_start,
      reward: { gems: 0, zel: 0, items: [] },
      timeUntilReset: row.time_until_reset,
    }));
  } catch (err) {
    console.error('Exception fetching daily quests:', err);
    return [];
  }
}

export async function updateQuestProgress(type: 'daily' | 'weekly', increment: number = 1): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    const { error } = await (supabase as any)
      .rpc('update_quest_progress', {
        p_player_id: session.user.id,
        p_quest_type: type,
        p_increment: increment,
      });

    if (error) {
      console.error('Error updating quest progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception updating quest progress:', err);
    return false;
  }
}

export async function claimQuestReward(questId: string): Promise<{ success: boolean; reward?: any; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    const { data, error } = await (supabase as any)
      .rpc('claim_quest_reward', {
        p_player_id: session.user.id,
        p_quest_id: questId,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reward: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function getTimeUntilNextReset(type: 'daily' | 'weekly'): number {
  const now = new Date();
  if (type === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  } else {
    const nextSunday = new Date(now);
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday.getTime() - now.getTime();
  }
}

export function formatCountdown(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}