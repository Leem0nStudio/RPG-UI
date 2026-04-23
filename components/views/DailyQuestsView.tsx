'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Gift, Zap, Swords, Sparkles, ScanLine, Trophy, Star } from 'lucide-react';
import { getDailyQuests, claimQuestReward, formatCountdown, getTimeUntilNextReset, type DailyQuest } from '@/services/quest-service';
import { useGameStore } from '@/store/game-store';
import { updateCurrencies } from '@/services/write-service';
import { useNotifications } from '@/components/ui/Notifications';

type Props = {
  onClose: () => void;
};

export function DailyQuestsView({ onClose }: Props) {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [dailyReset, setDailyReset] = useState(getTimeUntilNextReset('daily'));
  const [weeklyReset, setWeeklyReset] = useState(getTimeUntilNextReset('weekly'));
  const { showReward } = useNotifications();
  const { setBadgeCount } = useGameStore();

  useEffect(() => {
    const fetchQuests = async () => {
      setLoading(true);
      const data = await getDailyQuests();
      setQuests(data);
      setLoading(false);
    };
    fetchQuests();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDailyReset(getTimeUntilNextReset('daily'));
      setWeeklyReset(getTimeUntilNextReset('weekly'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (quest: DailyQuest) => {
    if (!quest.completed || quest.claimed) return;
    
    setClaimingId(quest.id);
    
    try {
      const result = await claimQuestReward(quest.id);
      
      if (result.success && result.reward) {
        const rewardData = result.reward as { gems?: number; zel?: number };
        
        if (rewardData.gems as number) {
          await updateCurrencies([{ code: 'gems', amount: rewardData.gems as number }]);
          showReward(`+${rewardData.gems} Gemas`, 'Misión completada!');
        }
        if (rewardData.zel as number) {
          await updateCurrencies([{ code: 'zel', amount: rewardData.zel as number }]);
          showReward(`+${rewardData.zel} Zel`, 'Recompensa de misión');
        }
        
        setQuests(prev => prev.map(q => 
          q.id === quest.id ? { ...q, claimed: true } : q
        ));
        
        // Update badge count for quests
        const { badgeCounts } = useGameStore.getState();
        setBadgeCount('quests', (badgeCounts.quests ?? 0) + 1);
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
    } finally {
      setClaimingId(null);
    }
  };

  const dailyQuests = quests.filter(q => q.type === 'daily');
  const weeklyQuests = quests.filter(q => q.type === 'weekly');

  const dailyCompleted = dailyQuests.filter(q => q.completed).length;
  const weeklyCompleted = weeklyQuests.filter(q => q.completed).length;
  const dailyProgress = (dailyCompleted / Math.max(dailyQuests.length, 1)) * 100;
  const weeklyProgress = (weeklyCompleted / Math.max(weeklyQuests.length, 1)) * 100;

  const getQuestIcon = (questId: string) => {
    if (questId.includes('battles') || questId.includes('wins')) return <Swords size={18} />;
    if (questId.includes('summon')) return <Sparkles size={18} />;
    if (questId.includes('qr')) return <ScanLine size={18} />;
    if (questId.includes('kills')) return <Trophy size={18} />;
    if (questId.includes('level')) return <Star size={18} />;
    return <Gift size={18} />;
  };

  const getQuestColor = (questId: string) => {
    if (questId.includes('battles') || questId.includes('wins')) return 'text-[#ff6b6b]';
    if (questId.includes('summon')) return 'text-[#b388ff]';
    if (questId.includes('qr')) return 'text-[#4ade80]';
    if (questId.includes('kills')) return 'text-[#fbbf24]';
    if (questId.includes('level')) return 'text-[#60a5fa]';
    return 'text-[#ffd66e]';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 bg-[#1a0a05] border-b border-[#3a2820]">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-[#ffd700]" />
          <h2 className="ui-heading text-[16px] text-white text-stroke-sm">Misiones</h2>
        </div>
        <button onClick={onClose} className="p-2 text-[#6a5a4a] hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-[#ffd66e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Daily Reset Timer */}
            <div className="mb-4 flex items-center justify-between p-3 bg-[#2a1a10] rounded-lg border border-[#3a2820]">
              <div className="flex items-center gap-2 text-[#c9a872]">
                <Clock size={16} />
                <span className="text-[12px]">Diarias resetean en:</span>
              </div>
              <span className="text-[14px] font-bold text-[#ffd66e]">{formatCountdown(dailyReset)}</span>
            </div>

            {/* Daily Quests */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold text-[#a58d78] uppercase tracking-wider">Diarias ({dailyCompleted}/{dailyQuests.length})</h3>
              </div>
              
              <div className="h-1.5 bg-[#1a0a05] rounded-full mb-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>

              <div className="space-y-2">
                {dailyQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    color={getQuestColor(quest.id)}
                    icon={getQuestIcon(quest.id)}
                    onClaim={() => handleClaim(quest)}
                    isClaiming={claimingId === quest.id}
                  />
                ))}
              </div>
            </div>

            {/* Weekly Reset Timer */}
            <div className="mb-4 flex items-center justify-between p-3 bg-[#2a1a10] rounded-lg border border-[#3a2820]">
              <div className="flex items-center gap-2 text-[#c9a872]">
                <Clock size={16} />
                <span className="text-[12px]">Semanales resetean en:</span>
              </div>
              <span className="text-[14px] font-bold text-[#b388ff]">{formatCountdown(weeklyReset)}</span>
            </div>

            {/* Weekly Quests */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold text-[#a58d78] uppercase tracking-wider">Semanales ({weeklyCompleted}/{weeklyQuests.length})</h3>
              </div>
              
              <div className="h-1.5 bg-[#1a0a05] rounded-full mb-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#b388ff] to-[#9333ea] rounded-full transition-all duration-500"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>

              <div className="space-y-2">
                {weeklyQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    color={getQuestColor(quest.id)}
                    icon={getQuestIcon(quest.id)}
                    onClaim={() => handleClaim(quest)}
                    isClaiming={claimingId === quest.id}
                    isWeekly
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuestCard({ 
  quest, 
  color, 
  icon, 
  onClaim, 
  isClaiming,
  isWeekly = false 
}: { 
  quest: DailyQuest; 
  color: string; 
  icon: React.ReactNode;
  onClaim: () => void;
  isClaiming: boolean;
  isWeekly?: boolean;
}) {
  const progress = (quest.progress / quest.targetCount) * 100;
  const canClaim = quest.completed && !quest.claimed;

  return (
    <div className={`
      ui-panel p-3 relative overflow-hidden
      ${quest.claimed ? 'opacity-60' : ''}
      ${quest.completed && !quest.claimed ? 'border-[#4ade80]' : ''}
    `}>
      {quest.completed && !quest.claimed && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#4ade80]/30 to-transparent rounded-bl-full" />
      )}
      
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-[#1a0a05] ${color}`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-white">{quest.title}</h4>
            {quest.completed && (
              <div className="flex items-center gap-1 text-[#4ade80]">
                <Check size={14} />
                <span className="text-[10px]">Completado</span>
              </div>
            )}
          </div>
          
          <p className="text-[10px] text-[#6a5a4a] mt-0.5">{quest.description}</p>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#8a7a6a]">{quest.progress}/{quest.targetCount}</span>
              <span className={isWeekly ? 'text-[#b388ff]' : 'text-[#ffd66e]'}>
                {quest.reward.gems && <><Gem size={10} className="inline mr-1" />{quest.reward.gems}</>}
                {quest.reward.zel && <><Zap size={10} className="inline mr-1" />{quest.reward.zel}</>}
              </span>
            </div>
            <div className="h-2 bg-[#1a0a05] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  quest.completed 
                    ? 'bg-[#4ade80]' 
                    : isWeekly 
                      ? 'bg-gradient-to-r from-[#b388ff] to-[#9333ea]' 
                      : 'bg-gradient-to-r from-[#ffd66e] to-[#f59e0b]'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Claim Button */}
          {canClaim && (
            <button
              onClick={onClaim}
              disabled={isClaiming}
              className="mt-2 w-full py-2 bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded text-white text-[11px] font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isClaiming ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Gift size={14} />
                  RECLAMAR
                </>
              )}
            </button>
          )}

          {quest.claimed && (
            <div className="mt-2 py-2 bg-[#1a2a1a] rounded text-center text-[10px] text-[#4ade80] font-bold">
              RECLAMADO
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Gem(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 9l10 13 10-13L12 2zm0 3.5L18.5 9 12 18.5 5.5 9 12 5.5z"/>
    </svg>
  );
}