import { getSupabaseBrowserClient } from './supabase/client';
import { storyChapters, getChapterById, type StoryChapter } from '@/content/story-content';

export type PathType = 'light' | 'neutral' | 'dark';

export interface PlayerStoryProgress {
  chapterId: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  world: string;
  requiredLevel: number;
  status: 'locked' | 'active' | 'completed';
  pathType: PathType;
  isBossChapter: boolean;
  canStart: boolean;
  loreIntro: string;
  loreBody: string;
}

interface PlayerStoryProgressRow {
  chapter_id: string;
  status: 'locked' | 'active' | 'completed';
  path_type?: PathType;
}

export interface ChapterReward {
  gems: number;
  zel: number;
  items: Array<{ itemId: string; quantity: number }>;
}

function defaultStoryProgress(chapter: StoryChapter, idx: number): PlayerStoryProgress {
  return {
    chapterId: chapter.id,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    subtitle: chapter.subtitle,
    world: chapter.world,
    requiredLevel: chapter.requiredLevel,
    status: idx === 0 ? 'active' : 'locked',
    pathType: 'neutral',
    isBossChapter: chapter.isBossChapter,
    canStart: idx === 0,
    loreIntro: chapter.loreIntro,
    loreBody: chapter.loreBody,
  };
}

export async function getStoryProgress(): Promise<PlayerStoryProgress[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return storyChapters.map(defaultStoryProgress);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return storyChapters.map(defaultStoryProgress);
  }

  try {
    const { data, error } = await supabase.rpc<PlayerStoryProgressRow>('get_player_story_progress', {
      p_player_id: session.user.id,
    });

    if (error) {
      console.error('Error fetching story progress:', error);
      return storyChapters.map(defaultStoryProgress);
    }

    const progressRows = data ?? [];
    const progressMap = new Map<string, PlayerStoryProgressRow>(
      progressRows.map((row) => [row.chapter_id, row])
    );

    return storyChapters.map((chapter, idx) => {
      const progress = progressMap.get(chapter.id);
      const prevChapterProgress = idx > 0 ? progressMap.get(storyChapters[idx - 1].id) : null;
      const previousCompleted = idx === 0 || prevChapterProgress?.status === 'completed';
      const canStart = previousCompleted;
      const status = progress?.status ?? (canStart ? 'active' : 'locked');

      return {
        chapterId: chapter.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        subtitle: chapter.subtitle,
        world: chapter.world,
        requiredLevel: chapter.requiredLevel,
        status,
        pathType: progress?.path_type ?? 'neutral',
        isBossChapter: chapter.isBossChapter,
        canStart,
        loreIntro: chapter.loreIntro,
        loreBody: chapter.loreBody,
      };
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching story progress';
    console.error('Exception fetching story progress:', message);
    return storyChapters.map(defaultStoryProgress);
  }
}

export async function startChapter(chapterId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    const { error } = await supabase.rpc<null>('start_chapter', {
      p_player_id: session.user.id,
      p_chapter_id: chapterId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function completeChapter(
  chapterId: string,
  choiceId?: string,
  pathType: PathType = 'neutral'
): Promise<{ success: boolean; rewards?: ChapterReward; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const chapter = getChapterById(chapterId);
    return { success: true, rewards: chapter?.rewards || { gems: 0, zel: 0, items: [] } };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    const { data, error } = await supabase.rpc<{ rewards?: ChapterReward }>('complete_chapter', {
      p_player_id: session.user.id,
      p_chapter_id: chapterId,
      p_choice_id: choiceId,
      p_path_type: pathType,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, rewards: data?.rewards };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export function getChapterRewards(chapterId: string): ChapterReward {
  const chapter = getChapterById(chapterId);
  return chapter?.rewards || { gems: 0, zel: 0, items: [] };
}

export function canStartChapter(chapterId: string, playerLevel: number, completedChapters: string[]): boolean {
  const chapter = getChapterById(chapterId);
  if (!chapter) return false;
  
  if (playerLevel < chapter.requiredLevel) return false;
  if (chapter.requiredChapter && !completedChapters.includes(chapter.requiredChapter)) return false;
  
  return true;
}