import React from 'react';
import { Sword, Zap, Sparkles } from 'lucide-react';
import type { CombatUnit, EnemyInstance } from '@/services/battle-service';
import type { BattlePhase } from '@/hooks/useBattle';

interface BattleControlsProps {
  phase: BattlePhase;
  turnCount: number;
  playerUnits: CombatUnit[];
  enemy: EnemyInstance | null;
  currentEnemyHp: number;
  onStartBattle: () => void;
  onBack?: () => void;
  onFlee?: () => void;
}

export function BattleControls({
  phase,
  turnCount,
  playerUnits,
  enemy,
  currentEnemyHp,
  onStartBattle,
  onBack,
  onFlee,
}: BattleControlsProps) {
  return (
    <div className="flex flex-col bg-gradient-to-t from-[#0d0502] to-[#1a0a05] border-t border-[#3a2820] p-3">
      {/* Turn counter */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#a58d78] text-[12px]">Turn {turnCount + 1}</span>
        <div className="flex gap-3 text-[#a58d78] text-[10px]">
          <span>Units: {playerUnits.filter(u => u.alive).length}/{playerUnits.length}</span>
          {enemy && <span>Enemy: {Math.round((currentEnemyHp / enemy.maxHp) * 100)}%</span>}
        </div>
      </div>

      {/* Unit quick view */}
      <div className="flex justify-around mb-3">
        {playerUnits.slice(0, 4).map(unit => (
          <div key={unit.instanceId} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${unit.alive ? 'bg-[#2a4a3a] border border-[#4a6a4a]' : 'bg-[#1a1a1a] border border-[#3a3a3a] opacity-50'}`}>
              <span className="text-sm">⚔️</span>
            </div>
            <div className={`h-1 w-8 mt-1 rounded ${unit.hp > unit.maxHp * 0.3 ? 'bg-[#40cc40]' : 'bg-[#cc2020]'}`} style={{ width: `${Math.min(100, (unit.hp / unit.maxHp) * 100)}%` }} />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {phase === 'selecting' && (
        <button
          onClick={onStartBattle}
          className="w-full py-4 bg-gradient-to-r from-[#4a7020] via-[#6a9020] to-[#4a7020] border-2 border-[#80b040] rounded-lg text-white font-bold text-lg hover:brightness-110 active:scale-95 transition-all"
        >
          ⚔️ FIGHT! ⚔️
        </button>
      )}

      {phase === 'fighting' && (
        <div className="grid grid-cols-3 gap-2">
          <button className="py-3 bg-[#2a4a6a] border border-[#4a6a8a] rounded text-white text-sm font-bold flex items-center justify-center gap-1">
            <Zap size={14} /> Attack
          </button>
          <button className="py-3 bg-[#3a2a5a] border border-[#5a4a8a] rounded text-white text-sm font-bold flex items-center justify-center gap-1">
            <Sparkles size={14} /> BB
          </button>
          <button onClick={onFlee} className="py-3 bg-[#6a2020] border border-[#8a4040] rounded text-white text-sm font-bold">
            Flee
          </button>
        </div>
      )}

      {(phase === 'victory' || phase === 'defeat') && (
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-[#4a3020] border-2 border-[#6a5040] rounded-lg text-white font-bold"
          >
            {phase === 'victory' ? '🎁 Claim' : '🔄 Retry'}
          </button>
        </div>
      )}
    </div>
  );
}