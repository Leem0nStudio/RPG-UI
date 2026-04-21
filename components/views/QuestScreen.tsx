import React, { useState } from 'react';
import { ChevronLeft, Zap, Star, Shield, Skull } from 'lucide-react';
import type { GameBootstrap, QuestDefinition, Element } from '@/backend-contracts/game';
import { useGameStore } from '@/store/game-store';

interface EnemyPreview {
  id: string;
  name: string;
  element: Element;
  difficulty: number;
}

interface QuestScreenProps {
  bootstrap: GameBootstrap;
  onSelectQuest: (quest: QuestDefinition) => void;
  onBack: () => void;
}

function getDifficultyColor(difficulty: QuestDefinition['difficulty']) {
  switch (difficulty) {
    case 'Normal': return 'text-[#7cb342]';
    case 'Hard': return 'text-[#fb8c00]';
    case 'Heroic': return 'text-[#e53935]';
  }
}

function getDifficultyBg(difficulty: QuestDefinition['difficulty']) {
  switch (difficulty) {
    case 'Normal': return 'from-[#2e7d32] to-[#1b5e20]';
    case 'Hard': return 'from-[#ef6c00] to-[#e65100]';
    case 'Heroic': return 'from-[#c62828] to-[#b71c1c]';
  }
}

function getDifficultyBorder(difficulty: QuestDefinition['difficulty']) {
  switch (difficulty) {
    case 'Normal': return 'border-[#2e7d32]';
    case 'Hard': return 'border-[#ef6c00]';
    case 'Heroic': return 'border-[#c62828]';
  }
}

function getElementIcon(element: Element, size = 14) {
  const iconProps = { size, className: 'flex-shrink-0' };
  switch (element) {
    case 'Fire': return <Zap {...iconProps} className={`${iconProps.className} fill-[#ff4422] text-[#cc2200]`} />;
    case 'Water': return <Zap {...iconProps} className={`${iconProps.className} fill-[#2288ff] text-[#0044cc]`} />;
    case 'Earth': return <Shield {...iconProps} className={`${iconProps.className} fill-[#44bb44] text-[#228822]`} />;
    case 'Light': return <Star {...iconProps} className={`${iconProps.className} fill-[#ffdd44] text-[#cc9900]`} />;
    case 'Dark': return <Star {...iconProps} className={`${iconProps.className} fill-[#8844aa] text-[#552266]`} />;
  }
}

export function QuestScreen({ bootstrap, onSelectQuest, onBack }: QuestScreenProps) {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const { setView } = useGameStore();

  const worlds = React.useMemo(() => {
    const worldIds = new Set(bootstrap.content.quests.map(q => q.worldId));
    return Array.from(worldIds);
  }, [bootstrap.content.quests]);

  const questsForWorld = selectedWorld
    ? bootstrap.content.quests.filter(q => q.worldId === selectedWorld).sort((a, b) => a.stage - b.stage)
    : bootstrap.content.quests.sort((a, b) => a.stage - b.stage);

  const hasEnoughEnergy = (quest: QuestDefinition) => bootstrap.player.energy.current >= quest.energyCost;
  const hasRoster = bootstrap.roster.length > 0;

  const worldName = (worldId: string) => {
    switch (worldId) {
      case 'prontera': return 'Prontera Fields';
      case 'geffen': return 'Geffen Dungeon';
      case 'niflheim': return 'Niflheim';
      case 'rachel': return 'Rachel Sanctuary';
      default: return worldId.charAt(0).toUpperCase() + worldId.slice(1);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-2 relative select-none animate-in fade-in duration-300 ui-text">
      {/* Header */}
      <div className="w-full ui-panel p-2 rpg-panel-shadow relative flex-shrink-0">
        <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20" />
        
        <div className="flex justify-between items-center relative z-10">
          <button
            onClick={onBack}
            className="bg-gradient-to-b from-[#e3cfb4] to-[#c7b08d] border-[2px] border-[#5a4227] rounded shadow-[0_2px_4px_rgba(0,0,0,0.5)] px-2 py-1 flex items-center hover:brightness-110 active:scale-95 transition-all duration-200 text-[#3c2a16]"
          >
            <ChevronLeft size={16} />
            <span className="text-[11px] font-bold ml-1">BACK</span>
          </button>

          <div className="bg-[#1a110a] border-[1.5px] border-[#5a4227] rounded px-3 py-1 flex items-center shadow-inner">
            <span className="ui-heading font-bold text-white text-[12px] tracking-widest text-stroke-sm leading-none">QUEST</span>
          </div>

          {/* Energy Display */}
          <div className="bg-[#1a110a] border-[1.5px] border-[#5a4227] rounded px-2 py-1 flex items-center gap-1 shadow-inner">
            <Zap size={12} className="fill-[#ffdd00] text-[#cc9900]" />
            <span className="text-[#ffdd00] text-[11px] font-bold">
              {bootstrap.player.energy.current}/{bootstrap.player.energy.max}
            </span>
          </div>
        </div>
      </div>

      {/* World Filter Tabs */}
      {worlds.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedWorld(null)}
            className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${
              !selectedWorld
                ? 'bg-[#5c3a21] border-[#c79a5d] text-white'
                : 'bg-[#2a1a0c] border-[#3c2a16] text-[#8a6a4d] hover:border-[#5a4227]'
            }`}
          >
            ALL
          </button>
          {worlds.map(world => (
            <button
              key={world}
              onClick={() => setSelectedWorld(world)}
              className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${
                selectedWorld === world
                  ? 'bg-[#5c3a21] border-[#c79a5d] text-white'
                  : 'bg-[#2a1a0c] border-[#3c2a16] text-[#8a6a4d] hover:border-[#5a4227]'
              }`}
            >
              {worldName(world).toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Quest List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-2">
        {questsForWorld.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div>
              <p className="ui-heading text-[16px] text-white mb-2">No Quests Available</p>
              <p className="text-[12px] text-[#8a6a4d]">Quests will appear here as you progress</p>
            </div>
          </div>
        ) : (
          questsForWorld.map((quest) => {
            const canEnter = hasEnoughEnergy(quest) && hasRoster;
            const difficultyColor = getDifficultyColor(quest.difficulty);

            return (
              <button
                key={quest.id}
                onClick={() => canEnter && onSelectQuest(quest)}
                disabled={!canEnter}
                className={`w-full text-left ui-panel p-3 rpg-panel-shadow relative transition-all duration-200 border-[1.5px] ${
                  canEnter
                    ? getDifficultyBorder(quest.difficulty)
                    : 'border-[#3c2a16] opacity-50'
                } ${canEnter ? 'hover:brightness-110 active:scale-[0.99]' : 'cursor-not-allowed'}`}
              >
                <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20" />

                {/* World / Stage label */}
                <div className="absolute top-0 right-0 bg-[#1a110a] border-l-[1.5px] border-b-[1.5px] border-[#3c2a16] rounded-bl-[4px] px-2 py-[2px] z-30">
                  <span className="text-[9px] font-bold text-[#c79a5d]">
                    {selectedWorld ? `STAGE ${quest.stage}` : worldName(quest.worldId).toUpperCase()}
                  </span>
                </div>

                <div className="relative z-10">
                  {/* Quest Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <Skull size={18} className={`${difficultyColor} flex-shrink-0`} />
                    <span className="ui-heading text-[14px] text-white text-stroke-sm leading-none">
                      {quest.name}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-[1px] rounded border ${getDifficultyBorder(quest.difficulty)} text-white`}>
                      {quest.difficulty.toUpperCase()}
                    </span>
                  </div>

                  {/* Enemy Previews */}
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {quest.enemyIds.length > 0 ? quest.enemyIds.map((enemyId, idx) => {
                      // Parse enemy info from ID if available
                      const enemyElement = (['Fire', 'Water', 'Earth', 'Light', 'Dark'] as Element[])[idx % 5];
                      return (
                        <div key={idx} className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-[#3c2a16]">
                          {getElementIcon(enemyElement, 10)}
                          <span className="text-[10px] text-[#c79a5d] font-bold">
                            {enemyId.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        </div>
                      );
                    }) : (
                      <span className="text-[10px] text-[#8a6a4d] italic">Unknown enemy</span>
                    )}
                  </div>

                  {/* Footer: Energy Cost + Rewards */}
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                      {/* Energy Cost */}
                      <div className={`flex items-center gap-1 px-2 py-[2px] rounded ${
                        hasEnoughEnergy(quest)
                          ? 'bg-[#2e7d32]/30 border border-[#2e7d32]'
                          : 'bg-[#c62828]/30 border border-[#c62828]'
                      }`}>
                        <Zap size={10} className={hasEnoughEnergy(quest) ? 'fill-[#7cb342] text-[#4caf50]' : 'fill-[#ef5350] text-[#c62828]'} />
                        <span className={`text-[10px] font-bold ${hasEnoughEnergy(quest) ? 'text-[#7cb342]' : 'text-[#ef5350]'}`}>
                          {quest.energyCost} Energy
                        </span>
                      </div>
                    </div>

                    {/* Rewards Preview */}
                    <div className="flex items-center gap-2">
                      {quest.rewardsPreview.slice(0, 3).map((reward, idx) => (
                        <span key={idx} className="text-[10px] text-[#c79a5d] bg-[#2a1a0c] px-1 py-[1px] rounded border border-[#3c2a16]">
                          {reward}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Disabled Reason */}
                  {!hasRoster && (
                    <p className="text-[10px] text-[#ef5350] mt-1">Summon units first</p>
                  )}
                  {!hasEnoughEnergy(quest) && hasRoster && (
                    <p className="text-[10px] text-[#ef5350] mt-1">Not enough energy</p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}