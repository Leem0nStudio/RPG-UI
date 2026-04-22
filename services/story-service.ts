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

export interface ChapterReward {
  gems: number;
  zel: number;
  items: Array<{ itemId: string; quantity: number }>;
}

export async function getStoryProgress(): Promise<PlayerStoryProgress[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return storyChapters.map(ch => ({
    chapterId: ch.id,
    chapterNumber: ch.chapterNumber,
    title: ch.title,
    subtitle: ch.subtitle,
    world: ch.world,
    requiredLevel: ch.requiredLevel,
    status: ch.chapterNumber === 1 ? 'locked' : 'locked',
    pathType: 'neutral' as PathType,
    isBossChapter: ch.isBossChapter,
    canStart: ch.chapterNumber === 1,
    loreIntro: ch.loreIntro,
    loreBody: ch.loreBody,
  }));

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return storyChapters.map(ch => ({
      chapterId: ch.id,
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      subtitle: ch.subtitle,
      world: ch.world,
      requiredLevel: ch.requiredLevel,
      status: 'locked' as const,
      pathType: 'neutral' as PathType,
      isBossChapter: ch.isBossChapter,
      canStart: ch.chapterNumber === 1,
      loreIntro: ch.loreIntro,
      loreBody: ch.loreBody,
    }));
  }

  try {
    const { data, error } = await (supabase as any)
      .rpc('get_player_story_progress', { p_player_id: session.user.id });

    if (error) {
      console.error('Error fetching story progress:', error);
      return storyChapters.map(ch => ({
        chapterId: ch.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        subtitle: ch.subtitle,
        world: ch.world,
        requiredLevel: ch.requiredLevel,
        status: ch.chapterNumber === 1 ? 'locked' : 'locked',
        pathType: 'neutral' as PathType,
        isBossChapter: ch.isBossChapter,
        canStart: ch.chapterNumber === 1,
        loreIntro: ch.loreIntro,
        loreBody: ch.loreBody,
      }));
    }

    if (!data || data.length === 0) {
      return storyChapters.map((ch, idx) => ({
        chapterId: ch.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        subtitle: ch.subtitle,
        world: ch.world,
        requiredLevel: ch.requiredLevel,
        status: idx === 0 ? 'locked' : 'locked',
        pathType: 'neutral' as PathType,
        isBossChapter: ch.isBossChapter,
        canStart: idx === 0,
        loreIntro: ch.loreIntro,
        loreBody: ch.loreBody,
      }));
    }

    const progressMap = new Map<string, any>(data.map((row: any) => [row.chapter_id, row]));
    
    return storyChapters.map((chapter, idx) => {
      const progress = progressMap.get(chapter.id);
      const prevChapter = idx > 0 ? progressMap.get(storyChapters[idx - 1].id) : null;
      const previousCompleted = idx === 0 || (prevChapter?.status === 'completed');
      
      return {
        chapterId: chapter.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        subtitle: chapter.subtitle,
        world: chapter.world,
        requiredLevel: chapter.requiredLevel,
        status: progress?.status || (previousCompleted ? 'locked' : 'locked'),
        pathType: (progress?.path_type || 'neutral') as PathType,
        isBossChapter: chapter.isBossChapter,
        canStart: previousCompleted,
        loreIntro: chapter.loreIntro,
        loreBody: chapter.loreBody,
      };
    });
  } catch (err) {
    console.error('Exception fetching story progress:', err);
    return storyChapters.map((ch, idx) => ({
      chapterId: ch.id,
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      subtitle: ch.subtitle,
      world: ch.world,
      requiredLevel: ch.requiredLevel,
      status: idx === 0 ? 'locked' : 'locked',
      pathType: 'neutral' as PathType,
      isBossChapter: ch.isBossChapter,
      canStart: idx === 0,
      loreIntro: ch.loreIntro,
      loreBody: ch.loreBody,
    }));
  }
}

export async function startChapter(chapterId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  try {
    const { error } = await (supabase as any)
      .rpc('start_chapter', {
        p_player_id: session.user.id,
        p_chapter_id: chapterId,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
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
    const { data, error } = await (supabase as any)
      .rpc('complete_chapter', {
        p_player_id: session.user.id,
        p_chapter_id: chapterId,
        p_choice_id: choiceId,
        p_path_type: pathType,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, rewards: data?.rewards };
  } catch (err: any) {
    return { success: false, error: err.message };
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