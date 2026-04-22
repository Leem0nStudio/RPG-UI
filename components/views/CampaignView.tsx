'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, ChevronRight, Lock, Check, Star, Swords, Sparkles } from 'lucide-react';
import { getStoryProgress, startChapter, type PlayerStoryProgress } from '@/services/story-service';
import { useGameStore } from '@/store/game-store';
import { storyWorlds } from '@/content/story-content';
import { useNotifications } from '@/components/ui/Notifications';

type Props = {
  onClose: () => void;
  onStartChapter: (chapterId: string) => void;
  onOpenStory: (chapterId: string) => void;
};

export function CampaignView({ onClose, onStartChapter, onOpenStory }: Props) {
  const [chapters, setChapters] = useState<PlayerStoryProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorld, setSelectedWorld] = useState('rune_midgard');
  const { bootstrap } = useGameStore();
  const playerLevel = bootstrap.player.level;

  const loadProgress = useCallback(async () => {
    setLoading(true);
    const progress = await getStoryProgress();
    setChapters(progress);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const worldChapters = chapters.filter(c => c.world === selectedWorld);
  const completedCount = worldChapters.filter(c => c.status === 'completed').length;
  const totalChapters = worldChapters.length;
  const progressPercent = (completedCount / totalChapters) * 100;

  const worldInfo = storyWorlds.find(w => w.id === selectedWorld);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 bg-[#1a0a05] border-b border-[#3a2820]">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#b388ff]" />
          <h2 className="ui-heading text-[16px] text-white text-stroke-sm">Campaña</h2>
        </div>
        <button onClick={onClose} className="p-2 text-[#6a5a4a] hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-[#b388ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* World Selector */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {storyWorlds.map(world => (
                  <button
                    key={world.id}
                    onClick={() => setSelectedWorld(world.id)}
                    className={`
                      flex-shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold transition-all
                      ${selectedWorld === world.id 
                        ? 'bg-[#b388ff]/20 border border-[#b388ff] text-[#b388ff]' 
                        : 'bg-[#1a0a05] border border-[#3a2820] text-[#6a5a4a]'}
                    `}
                  >
                    {world.name}
                  </button>
                ))}
              </div>
            </div>

            {/* World Info */}
            <div className="mb-4 p-3 bg-[#2a1a10] rounded-lg border border-[#3a2820]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#a58d78]">{worldInfo?.description}</span>
                <span className="text-[14px] font-bold text-white">{playerLevel} Lv</span>
              </div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-[#8a7a6a]">Progreso</span>
                <span className="text-[#b388ff]">{completedCount}/{totalChapters}</span>
              </div>
              <div className="h-2 bg-[#1a0a05] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#b388ff] to-[#9333ea] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-2">
              {worldChapters.map((chapter, idx) => {
                const canStart = chapter.canStart && chapter.status !== 'completed' && playerLevel >= chapter.requiredLevel;
                const isLocked = chapter.status === 'locked' && !canStart;
                const isCompleted = chapter.status === 'completed';
                const isActive = chapter.status === 'active';

                return (
                  <button
                    key={chapter.chapterId}
                    onClick={() => {
                      if (isCompleted) {
                        onOpenStory(chapter.chapterId);
                      } else if (canStart || isActive) {
                        onOpenStory(chapter.chapterId);
                      }
                    }}
                    disabled={isLocked}
                    className={`
                      w-full ui-panel p-4 text-left relative overflow-hidden transition-all
                      ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'}
                      ${isActive ? 'border-[#ffd66e] shadow-[0_0_15px_rgba(255,214,110,0.3)]' : ''}
                      ${isCompleted ? 'border-[#4ade80]' : ''}
                    `}
                  >
                    {/* Glow effects */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ffd66e]/20 to-transparent rounded-bl-full" />
                    )}
                    {isCompleted && (
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#4ade80]/20 to-transparent rounded-bl-full" />
                    )}

                    <div className="flex items-center gap-3">
                      {/* Chapter Number Badge */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[16px]
                        ${isCompleted ? 'bg-[#4ade80]/20 text-[#4ade80]' : ''}
                        ${isActive ? 'bg-[#ffd66e]/20 text-[#ffd66e]' : ''}
                        ${isLocked ? 'bg-[#3a2820] text-[#6a5a4a]' : ''}
                        ${canStart ? 'bg-[#b388ff]/20 text-[#b388ff] animate-pulse' : ''}
                      `}>
                        {isCompleted ? (
                          <Check size={20} />
                        ) : isLocked ? (
                          <Lock size={16} />
                        ) : (
                          chapter.chapterNumber
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-white">{chapter.title}</h3>
                          {chapter.isBossChapter && (
                            <span className="px-1.5 py-0.5 bg-[#ff6b6b]/20 rounded text-[9px] text-[#ff6b6b] font-bold">BOSS</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#6a5a4a]">{chapter.subtitle}</p>
                        
                        {/* Requirements */}
                        {(isLocked || canStart) && (
                          <div className="mt-1 flex items-center gap-2 text-[10px]">
                            {playerLevel < chapter.requiredLevel ? (
                              <span className="text-[#ff6b6b]">Requiere nivel {chapter.requiredLevel}</span>
                            ) : isLocked ? (
                              <span className="text-[#6a5a4a]">Completa capítulo anterior</span>
                            ) : (
                              <span className="text-[#4ade80]">Listo para jugar</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      {!isLocked && (
                        <ChevronRight size={20} className={`
                          ${isActive ? 'text-[#ffd66e]' : ''}
                          ${isCompleted ? 'text-[#4ade80]' : ''}
                          ${canStart ? 'text-[#b388ff]' : ''}
                        `} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}