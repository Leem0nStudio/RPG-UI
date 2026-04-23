'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Swords, Shield, Star, BookOpen } from 'lucide-react';
import { getChapterById, type StoryChapter, type StoryChoice } from '@/content/story-content';
import { completeChapter, startChapter, type PathType } from '@/services/story-service';
import { useGameStore } from '@/store/game-store';
import { updateCurrencies } from '@/services/write-service';
import { useNotifications } from '@/components/ui/Notifications';

type Props = {
  chapterId: string;
  onClose: () => void;
  onComplete: () => void;
  onNextChapter: (nextChapterId: string | null) => void;
};

export function StoryModeView({ chapterId, onClose, onComplete, onNextChapter }: Props) {
  const [chapter, setChapter] = useState<StoryChapter | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'choices' | 'rewards' | 'complete'>('intro');
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);
  const [selectedPath, setSelectedPath] = useState<PathType>('neutral');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showReward, showAchievement } = useNotifications();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ch = getChapterById(chapterId);
    if (ch) {
      setChapter(ch);
      startChapter(chapterId);
    }
  }, [chapterId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChoiceSelect = (choice: StoryChoice) => {
    setSelectedChoice(choice);
    setSelectedPath(choice.path);
  };

  const handleConfirmChoice = async () => {
    if (!selectedChoice || !chapter) return;

    setIsProcessing(true);
    
    try {
      await completeChapter(chapterId, selectedChoice.id, selectedChoice.path);
      
      setCurrentStep('rewards');
      
      if (chapter.rewards.gems > 0) {
        await updateCurrencies([{ code: 'gems', amount: chapter.rewards.gems }]);
        showReward(`+${chapter.rewards.gems} Gemas`, 'Recompensa del capítulo');
      }
      if (chapter.rewards.zel > 0) {
        await updateCurrencies([{ code: 'zel', amount: chapter.rewards.zel }]);
        showReward(`+${chapter.rewards.zel} Zel`, 'Recompensa del capítulo');
      }
      
      showAchievement(`Capítulo ${chapter.chapterNumber} completado!`, `Camino ${selectedChoice.path}`);
    } catch (err) {
      console.error('Error completing chapter:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceed = () => {
    setCurrentStep('complete');
  };

  const handleContinue = () => {
    const nextChapter = chapter ? getChapterById(chapter.id) : null;
    const nextId = nextChapter ? `chapter_${chapter!.chapterNumber + 1}` : null;
    onNextChapter(nextId);
  };

  if (!chapter) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b388ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getPathColor = (path: PathType) => {
    switch (path) {
      case 'light': return { bg: 'from-[#fef3c7] to-[#fcd34d]', text: 'text-[#d97706]', border: 'border-[#fcd34d]', icon: Star };
      case 'dark': return { bg: 'from-[#374151] to-[#111827]', text: 'text-[#9ca3af]', border: 'border-[#6b7280]', icon: Shield };
      default: return { bg: 'from-[#e5e7eb] to-[#d1d5db]', text: 'text-[#6b7280]', border: 'border-[#9ca3af]', icon: Sparkles };
    }
  };

  const pathConfig = getPathColor(selectedPath);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#1a0a05] border-b border-[#3a2820]">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#b388ff]" />
          <div>
            <span className="text-[10px] text-[#6a5a4a]">Capítulo {chapter.chapterNumber}</span>
            <h2 className="ui-heading text-[14px] text-white text-stroke-sm">{chapter.title}</h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-[#6a5a4a] hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="animate-in fade-in duration-300">
            {/* Chapter Banner */}
            <div className="mb-4 relative h-32 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a1a30] via-[#1a1020] to-[#0a0510]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(179,136,255,0.3),transparent_70%)]" />
              
              {chapter.isBossChapter && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#ff6b6b]/30 animate-pulse flex items-center justify-center">
                    <Swords size={32} className="text-[#ff6b6b]" />
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[10px] text-[#b388ff]">{chapter.world.toUpperCase()}</span>
              </div>
            </div>

            {/* Lore Intro */}
            <div className="mb-4">
              <p className="text-[12px] text-[#c9a872] leading-relaxed italic">
                {chapter.loreIntro}
              </p>
            </div>

            {/* Lore Body */}
            <div className="mb-6 p-4 bg-[#1a0a05] rounded-lg border border-[#3a2820]">
              {chapter.loreBody.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-[11px] text-[#a58d78] leading-relaxed mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setCurrentStep('choices')}
              className="w-full py-3 bg-gradient-to-r from-[#b388ff] to-[#9333ea] rounded text-white font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Continuar
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Choices Step */}
        {currentStep === 'choices' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-4 p-3 bg-[#2a1a30] rounded-lg border border-[#b388ff]/30">
              <p className="text-[11px] text-[#a58d78] text-center">
                Tu decision afectara el resultado de esta historia...
              </p>
            </div>

            <div className="space-y-3">
              {chapter.choices.map((choice) => {
                const isSelected = selectedChoice?.id === choice.id;
                const choicePath = getPathColor(choice.path);
                
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelect(choice)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected 
                        ? `${choicePath.border} bg-[#1a0a05]` 
                        : 'border-[#3a2820] bg-[#1a0a05] hover:border-[#6a5a4a]'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${isSelected ? choicePath.bg : 'bg-[#2a2a2a]'}
                      `}>
                        {isSelected ? (
                          <choicePath.icon size={16} className={choicePath.text} />
                        ) : (
                          <Sparkles size={16} className="text-[#6a5a4a]" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-[12px] text-white font-medium">{choice.text}</p>
                        
                        {isSelected && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {choice.effects.map((effect, idx) => (
                              <span key={idx} className={`
                                px-2 py-0.5 rounded text-[9px] font-bold capitalize
                                ${choice.path === 'light' ? 'bg-[#fef3c7]/20 text-[#d97706]' : ''}
                                ${choice.path === 'dark' ? 'bg-[#374151]/20 text-[#9ca3af]' : ''}
                                ${choice.path === 'neutral' ? 'bg-[#e5e7eb]/20 text-[#6b7280]' : ''}
                              `}>
                                {effect.type}: {effect.target} +{effect.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="flex items-center">
                          <ChevronRight size={16} className={choicePath.text} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm Button */}
            {selectedChoice && (
              <button
                onClick={handleConfirmChoice}
                disabled={isProcessing}
                className="mt-6 w-full py-3 bg-gradient-to-r from-[#b388ff] to-[#9333ea] rounded text-white font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Confirmar Decision</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Rewards Step */}
        {currentStep === 'rewards' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center">
            <div className="mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-[#ffd66e] to-[#f59e0b] flex items-center justify-center shadow-[0_0_30px_rgba(255,214,110,0.5)] animate-bounce-slow">
              <Star size={48} className="text-white" />
            </div>

            <h3 className="ui-heading text-[20px] text-white text-stroke-sm mb-2">
              Capítulo Completado!
            </h3>

            <p className="text-[12px] text-[#a58d78] mb-6 text-center">
              Has elegido el camino {selectedPath}.
            </p>

            {/* Rewards */}
            <div className="w-full p-4 bg-[#1a0a05] rounded-lg border border-[#3a2820] mb-6">
              <p className="text-[10px] text-[#6a5a4a] uppercase tracking-wider mb-3 text-center">Recompensas</p>
              <div className="flex justify-center gap-6">
                {chapter.rewards.gems > 0 && (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#00ffcc]/20 flex items-center justify-center mb-1">
                      <Sparkles size={24} className="text-[#00ffcc]" />
                    </div>
                    <span className="text-[16px] font-bold text-[#00ffcc]">+{chapter.rewards.gems}</span>
                    <p className="text-[9px] text-[#6a5a4a]">Gemas</p>
                  </div>
                )}
                {chapter.rewards.zel > 0 && (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#ffd66e]/20 flex items-center justify-center mb-1">
                      <Star size={24} className="text-[#ffd66e]" />
                    </div>
                    <span className="text-[16px] font-bold text-[#ffd66e]">+{chapter.rewards.zel}</span>
                    <p className="text-[9px] text-[#6a5a4a]">Zel</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3 bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded text-white font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h3 className="ui-heading text-[24px] text-white text-stroke-sm mb-2">
                Historia Continua...
              </h3>
              <p className="text-[12px] text-[#a58d78] mb-6">
                {chapter.chapterNumber < 5 
                  ? 'El siguiente capítulo aguardará cuando estés listo.' 
                  : 'Has completado la campaña de Rune-Midgard. Felicitaciones, héroe!'}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 bg-gradient-to-r from-[#b388ff] to-[#9333ea] rounded text-white font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {chapter.chapterNumber < 5 ? 'Volver a Campaña' : 'Finalizar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}