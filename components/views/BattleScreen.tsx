import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useBattle, BattlePhase } from '@/hooks/useBattle';
import { BattleArena } from './BattleArena';
import { BattleControls } from './BattleControls';

interface BattleScreenProps {
  quest?: { id: string; name: string } | null;
  onVictory?: (result: { victory: boolean; turns: number; actions: unknown[]; rewards: { exp: number; zel: number; items: unknown[] } }) => void;
  onDefeat?: () => void;
  onBack?: () => void;
  onFlee?: () => void;
}

export function BattleScreen({
  quest: initialQuest,
  onVictory,
  onDefeat,
  onBack,
  onFlee,
}: BattleScreenProps) {
  const { currentQuest, currentEnemies } = useGameStore();
  const quest = currentQuest ?? initialQuest;
  const enemies = currentEnemies;

  const {
    phase,
    turnCount,
    currentEnemyHp,
    battleEnemy,
    playerUnits,
    showDamage,
    lastAction,
    isPlayerTurn,
    startBattle,
    executePlayerAttack,
  } = useBattle();

  const handleUnitAttack = (unitIndex: number) => {
    executePlayerAttack(unitIndex, () => {
      onVictory?.({
        victory: true,
        turns: turnCount + 1,
        actions: [],
        rewards: { exp: battleEnemy?.maxHp ?? 100 / 10, zel: battleEnemy?.maxHp ?? 100 / 5, items: [] },
      });
    }, onDefeat);
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-2 bg-gradient-to-b from-[#1a0a05] to-[#0d0502] border-b border-[#3a2820]">
        <button onClick={onBack} className="p-2 bg-[#2a1810] rounded-full border border-[#4a3020]">
          <ChevronLeft size={20} className="text-[#c9a872]" />
        </button>
        <span className="text-[#c9a872] font-bold text-[14px]">
          {phase === 'fighting' ? `Turn ${turnCount + 1}` : 'Battle'}
        </span>
        <button onClick={onFlee} className="px-3 py-1 bg-[#8b2020] rounded text-white text-[12px]">
          Flee
        </button>
      </div>

      {/* Arena - 60% */}
      <BattleArena
        enemy={battleEnemy}
        playerUnits={playerUnits}
        currentEnemyHp={currentEnemyHp}
        phase={phase}
        isPlayerTurn={isPlayerTurn}
        showDamage={showDamage}
        lastAction={lastAction}
        turnCount={turnCount}
        onUnitAttack={handleUnitAttack}
        disabled={phase !== 'fighting' || !isPlayerTurn}
      />

      {/* Controls - 40% */}
      <BattleControls
        phase={phase}
        turnCount={turnCount}
        playerUnits={playerUnits}
        enemy={battleEnemy}
        currentEnemyHp={currentEnemyHp}
        onStartBattle={startBattle}
        onBack={onBack}
        onFlee={onFlee}
      />
    </div>
  );
}