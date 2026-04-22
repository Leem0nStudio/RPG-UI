import React from 'react';
import type { CombatUnit, EnemyInstance, BattleAction } from '@/services/battle-service';
import type { Element } from '@/backend-contracts/game';

interface BattleArenaProps {
  enemy: EnemyInstance | null;
  playerUnits: CombatUnit[];
  currentEnemyHp: number;
  phase: 'selecting' | 'fighting' | 'victory' | 'defeat';
  isPlayerTurn: boolean;
  showDamage: { value: number; isEnemy: boolean } | null;
  lastAction: BattleAction | null;
  turnCount: number;
  onUnitAttack: (unitIndex: number) => void;
  disabled?: boolean;
}

function getElementColor(element: Element): string {
  switch (element) {
    case 'Fire': return 'from-[#b53c22] to-[#6e1e0a]';
    case 'Water': return 'from-[#295a8f] to-[#0a233b]';
    case 'Earth': return 'from-[#38703a] to-[#123614]';
    case 'Dark': return 'from-[#4a267a] to-[#1a0833]';
    case 'Light': return 'from-[#b59d22] to-[#6e580a]';
    default: return 'from-[#295a8f] to-[#0a233b]';
  }
}

export function BattleArena({
  enemy,
  playerUnits,
  currentEnemyHp,
  phase,
  isPlayerTurn,
  showDamage,
  turnCount,
  onUnitAttack,
  disabled,
}: BattleArenaProps) {
  if (!enemy) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0604]">
        <div className="text-[#a58d78]">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-gradient-to-b from-[#1a0a05] to-[#0d0502] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#2a1810] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-full h-px bg-[#5a4030]" style={{ bottom: `${i * 12}%` }} />
          ))}
        </div>
      </div>

      {/* Battle content */}
      <div className="flex-1 flex relative z-10">
        {/* Left - Enemy */}
        <div className="w-2/5 flex flex-col justify-end items-start pl-4 pb-8">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getElementColor(enemy.element)} flex items-center justify-center border-4 border-[#2a1810] shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
              <span className="text-4xl">👾</span>
            </div>
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-full blur-md" />
          </div>
          <div className="mt-2 bg-[#1a0a05] px-3 py-1 rounded border border-[#4a3020]">
            <span className="text-[#c9a872] font-bold text-[14px]">{enemy.name}</span>
          </div>
          <div className="mt-1 w-32">
            <div className="h-2 bg-[#1a0a05] border border-[#3a2820] rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#cc2020] to-[#ff4040] transition-all duration-300" style={{ width: `${(currentEnemyHp / enemy.maxHp) * 100}%` }} />
            </div>
            <div className="text-right text-[10px] text-[#a58d78] mt-0.5">
              {currentEnemyHp}/{enemy.maxHp}
            </div>
          </div>
          {phase === 'fighting' && !isPlayerTurn && (
            <div className="mt-2 px-2 py-1 bg-[#8b2020] rounded animate-pulse text-white">⚔️</div>
          )}
        </div>

        {/* Center */}
        <div className="w-1/5 flex flex-col items-center justify-center">
          {showDamage && (
            <div className={`text-3xl font-bold ${showDamage.isEnemy ? 'text-[#ff4040]' : 'text-[#40ff40]'}`}>
              -{showDamage.value}
            </div>
          )}
          {phase === 'fighting' && isPlayerTurn && <div className="text-[#c9a872] text-[12px] animate-pulse">TURN</div>}
          {phase === 'victory' && <div className="text-[#40ff40] text-2xl font-bold">VICTORY!</div>}
          {phase === 'defeat' && <div className="text-[#ff4040] text-2xl font-bold">DEFEAT</div>}
        </div>

        {/* Right - Players */}
        <div className="w-2/5 flex flex-col justify-end items-end pr-4 pb-8">
          {playerUnits.slice(0, 3).map((unit, idx) => (
            <div key={unit.instanceId} className="flex items-center gap-2 mb-2">
              <div className="w-24">
                <div className="text-right text-[10px] text-[#a58d78] truncate">{unit.name}</div>
                <div className="h-1.5 bg-[#1a0a05] border border-[#3a2820] rounded overflow-hidden">
                  <div className={`h-full ${unit.hp > unit.maxHp * 0.3 ? 'bg-[#40cc40]' : 'bg-[#cc2020]'} transition-all`} style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
                </div>
              </div>
              <button
                onClick={() => onUnitAttack(idx)}
                disabled={disabled || !unit.alive}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  disabled || !unit.alive
                    ? 'bg-[#1a1a1a] border-[#3a3a3a] opacity-50'
                    : 'bg-gradient-to-br from-[#2a4a6a] to-[#1a2a4a] border-[#4a8ab0] hover:scale-110'
                }`}
              >
                ⚔️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}