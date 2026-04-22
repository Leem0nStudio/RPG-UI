import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Sparkles, Flame, Droplet, Leaf, Moon, Sun, Sword, Shield, Zap } from 'lucide-react';
import type { QuestDefinition, Element, EnemyDefinition } from '@/backend-contracts/game';
import { useGameStore } from '@/store/game-store';
import { calculateUnitStats } from '@/core/stats';
import {
  createEnemyInstance,
  getEnemySpriteUrl,
  getEnemyCssFilter,
  CombatUnit,
  EnemyInstance,
  BattleAction,
  BattleResult,
} from '@/services/battle-service';

type BattleScreenProps = {
  quest?: QuestDefinition;
  enemies?: EnemyDefinition[];
  onVictory?: (result: BattleResult) => void;
  onDefeat?: () => void;
  onBack?: () => void;
  onFlee?: () => void;
}

const ELEMENT_ADVANTAGES: Record<Element, Element> = {
  Fire: 'Earth',
  Earth: 'Water',
  Water: 'Fire',
  Light: 'Dark',
  Dark: 'Light',
};

function getElementMultiplier(attacker: Element, defender: Element): number {
  if (ELEMENT_ADVANTAGES[attacker] === defender) return 1.5;
  if (ELEMENT_ADVANTAGES[defender] === attacker) return 0.75;
  return 1.0;
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

function getElementIcon(element: Element, size = 14) {
  switch (element) {
    case 'Fire': return <Flame size={size} className="fill-[#e85433] text-[#a62c12]" />;
    case 'Water': return <Droplet size={size} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
    case 'Earth': return <Leaf size={size} className="fill-[#4caf50] text-[#1b5e20]" />;
    case 'Dark': return <Moon size={size} className="fill-[#7e57c2] text-[#311b92]" />;
    case 'Light': return <Sun size={size} className="fill-[#f2da3e] text-[#a18116]" />;
    default: return <Droplet size={size} />;
  }
}

export function BattleScreen({
  quest: initialQuest,
  enemies: initialEnemies,
  onVictory,
  onDefeat,
  onBack,
  onFlee,
}: BattleScreenProps) {
  const { bootstrap, currentQuest, currentEnemies } = useGameStore();
  const quest = currentQuest ?? initialQuest ?? { id: 'unknown', name: 'Battle', enemyIds: [], energyCost: 0, difficulty: 'Normal', worldId: '', stage: 0, rewardsPreview: [] };
  const enemies = (currentEnemies.length > 0 ? currentEnemies : initialEnemies) ?? [];

  const [phase, setPhase] = useState<'selecting' | 'fighting' | 'victory' | 'defeat'>('selecting');
  const [turnCount, setTurnCount] = useState(0);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(0);
  const [battleEnemy, setBattleEnemy] = useState<EnemyInstance | null>(null);
  const [battleLog, setBattleLog] = useState<BattleAction[]>([]);
  const [lastAction, setLastAction] = useState<BattleAction | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [animatingAction, setAnimatingAction] = useState(false);
  const [showDamage, setShowDamage] = useState<{ value: number; isEnemy: boolean } | null>(null);

  // Player unit HP tracking
  const [playerUnitHp, setPlayerUnitHp] = useState<Record<string, number>>({});

  // Initialize player HP
  useEffect(() => {
    const initialHp: Record<string, number> = {};
    bootstrap.roster.slice(0, 4).forEach(owned => {
      const unitDef = bootstrap.content.units.find(u => u.id === owned.unitId);
      if (unitDef) {
        const job = bootstrap.content.jobs.find(j => j.id === owned.jobId);
        const stats = calculateUnitStats(unitDef, owned, [], job);
        initialHp[owned.instanceId] = stats.hp;
      }
    });
    setPlayerUnitHp(initialHp);
  }, [bootstrap.roster, bootstrap.content.units, bootstrap.content.jobs]);

  // Calculate player units
  const playerUnits: CombatUnit[] = React.useMemo(() => {
    return bootstrap.roster.slice(0, 4).map((owned) => {
      const unitDef = bootstrap.content.units.find(u => u.id === owned.unitId);
      if (!unitDef) return null;
      const job = bootstrap.content.jobs.find(j => j.id === owned.jobId);
      const stats = calculateUnitStats(unitDef, owned, [], job);
      const currentHp = playerUnitHp[owned.instanceId] ?? stats.hp;
      return {
        instanceId: owned.instanceId,
        unitId: owned.unitId,
        name: unitDef.name,
        element: unitDef.element,
        stats,
        hp: currentHp,
        maxHp: stats.hp,
        bbGauge: 0,
        alive: currentHp > 0,
      };
    }).filter(Boolean) as CombatUnit[];
  }, [bootstrap.roster, bootstrap.content.units, bootstrap.content.jobs, playerUnitHp]);

  // Initialize enemy
  useEffect(() => {
    if (battleEnemy) return;
    if (enemies.length === 0) return;
    const enemyDef = enemies[0];
    const avgPlayerLevel = bootstrap.roster.length > 0
      ? bootstrap.roster.reduce((sum, u) => sum + u.level, 0) / bootstrap.roster.length
      : 1;
    const enemy = createEnemyInstance(enemyDef, Math.floor(avgPlayerLevel), Math.floor(avgPlayerLevel));
    setBattleEnemy(enemy);
  }, [enemies, bootstrap.roster]);

  const currentEnemy = battleEnemy;

  // Start battle
  const startBattle = useCallback(() => {
    if (!currentEnemy) return;
    setCurrentEnemyHp(currentEnemy.hp);
    setPhase('fighting');
    setTurnCount(0);
    setBattleLog([]);
    setIsPlayerTurn(true);
  }, [currentEnemy]);

  // Execute player attack
  const executePlayerAttack = useCallback((unitIndex: number) => {
    if (phase !== 'fighting' || !isPlayerTurn || !currentEnemy || animatingAction) return;
    const unit = playerUnits[unitIndex];
    if (!unit || !unit.alive) return;

    setAnimatingAction(true);
    const elementMultiplier = getElementMultiplier(unit.element, currentEnemy.element);
    const rawDamage = Math.max(1, unit.stats.atk - Math.round(currentEnemy.stats.def * 0.55));
    const damage = Math.round(rawDamage * elementMultiplier);
    const newHp = Math.max(0, currentEnemyHp - damage);

    const action: BattleAction = {
      type: 'attack',
      sourceId: unit.instanceId,
      targetId: currentEnemy.id,
      damage,
      elementMultiplier,
      isCritical: false,
    };

    setLastAction(action);
    setBattleLog(prev => [...prev, action]);
    setCurrentEnemyHp(newHp);
    setShowDamage({ value: damage, isEnemy: true });

    setTimeout(() => {
      setAnimatingAction(false);
      if (newHp <= 0) {
        setPhase('victory');
        onVictory?.({
          victory: true,
          turns: turnCount + 1,
          actions: battleLog,
          rewards: { exp: currentEnemy.maxHp / 10, zel: currentEnemy.maxHp / 5, items: [] },
          survivingUnits: playerUnits.filter(u => u.alive).map(u => u.instanceId),
          fallenUnits: playerUnits.filter(u => !u.alive).map(u => u.instanceId),
        });
      } else {
        setIsPlayerTurn(false);
        setTimeout(() => {
          const aliveUnits = playerUnits.filter(u => u.alive);
          if (aliveUnits.length === 0) {
            setPhase('defeat');
            onDefeat?.();
            return;
          }
          // Enemy attacks - random unit
          const target = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
          const enemyDamage = Math.max(1, currentEnemy.stats.atk - Math.round(target.stats.def * 0.55));
          setPlayerUnitHp(prev => ({ ...prev, [target.instanceId]: Math.max(0, target.hp - enemyDamage) }));
          setTurnCount(prev => prev + 1);
          setIsPlayerTurn(true);
        }, 800);
      }
      setShowDamage(null);
    }, 600);
  }, [phase, isPlayerTurn, currentEnemy, currentEnemyHp, playerUnits, battleLog, turnCount, onVictory, onDefeat]);

  // If no enemy or no players, show empty state
  if (!currentEnemy || playerUnits.length === 0) {
    return (
      <div className="w-full flex-1 flex items-center justify-center bg-[#0a0604]">
        <div className="text-center p-4">
          <p className="text-[#ef5350] text-[14px]">No battle data</p>
          <p className="text-[#a58d78] text-[12px] mt-2">Enemy: {currentEnemy?.id || 'none'} | Players: {playerUnits.length}</p>
          <button onClick={() => onBack?.()} className="mt-4 px-4 py-2 bg-[#5c3a21] rounded text-white font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col relative bg-gradient-to-b from-[#1a0a05] to-[#0d0502] overflow-hidden">
      {/* Background - side view with perspective floor */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#2a1810] to-transparent" />
        {/* Floor grid lines for perspective */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-full h-px bg-[#5a4030]" style={{ bottom: `${i * 12}%` }} />
          ))}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute h-full w-px bg-[#5a4030]" style={{ left: `${15 + i * 17}%`, transform: 'perspective(100px) rotateX(60deg)' }} />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-2 bg-gradient-to-b from-[#1a0a05] to-[#0d0502] border-b border-[#3a2820]">
        <button onClick={() => onBack?.()} className="p-2 bg-[#2a1810] rounded-full border border-[#4a3020]">
          <ChevronLeft size={20} className="text-[#c9a872]" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[#c9a872] font-bold text-[14px] uppercase tracking-widest">
            {phase === 'fighting' ? `Turn ${turnCount + 1}` : 'Battle'}
          </span>
        </div>
        <button onClick={() => onFlee?.()} className="px-3 py-1 bg-[#8b2020] rounded border border-[#ab4040] text-white text-[12px] font-bold">
          Flee
        </button>
      </div>

      {/* Main battle area - side view layout */}
      <div className="flex-1 flex relative z-10">
        {/* Left side - Enemy */}
        <div className="w-2/5 flex flex-col justify-end items-start pl-4 pb-8">
          {/* Enemy sprite */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getElementColor(currentEnemy.element)} flex items-center justify-center border-4 border-[#2a1810] shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
              <span className="text-4xl">👾</span>
            </div>
            {/* Enemy shadow */}
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-full blur-md" />
          </div>

          {/* Enemy name */}
          <div className="mt-2 bg-[#1a0a05] px-3 py-1 rounded border border-[#4a3020]">
            <span className="text-[#c9a872] font-bold text-[14px]">{currentEnemy.name}</span>
          </div>

          {/* Enemy HP bar */}
          <div className="mt-1 w-32">
            <div className="h-2 bg-[#1a0a05] border border-[#3a2820] rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#cc2020] to-[#ff4040] transition-all duration-300" style={{ width: `${(currentEnemyHp / currentEnemy.maxHp) * 100}%` }} />
            </div>
            <div className="text-right text-[10px] text-[#a58d78] mt-0.5">
              {currentEnemyHp}/{currentEnemy.maxHp}
            </div>
          </div>

          {/* Enemy attack indicator */}
          {phase === 'fighting' && !isPlayerTurn && (
            <div className="mt-2 px-2 py-1 bg-[#8b2020] rounded animate-pulse">
              <Sword size={16} className="text-white" />
            </div>
          )}
        </div>

        {/* Center - Action indicators */}
        <div className="w-1/5 flex flex-col items-center justify-center">
          {showDamage && (
            <div className={`text-3xl font-bold ${showDamage.isEnemy ? 'text-[#ff4040]' : 'text-[#40ff40]'}`}>
              -{showDamage.value}
            </div>
          )}
          {phase === 'fighting' && isPlayerTurn && (
            <div className="text-[#c9a872] text-[12px] animate-pulse">ATACK!</div>
          )}
          {phase === 'victory' && (
            <div className="text-[#40ff40] text-2xl font-bold">WIN!</div>
          )}
          {phase === 'defeat' && (
            <div className="text-[#ff4040] text-2xl font-bold">LOSE</div>
          )}
        </div>

        {/* Right side - Player units (vertical stack) */}
        <div className="w-2/5 flex flex-col justify-end items-end pr-4 pb-8">
          {playerUnits.slice(0, 3).map((unit, idx) => (
            <div key={unit.instanceId} className="flex items-center gap-2 mb-2 last:mb-0">
              {/* Unit HP */}
              <div className="w-24">
                <div className="text-right text-[10px] text-[#a58d78] truncate">{unit.name}</div>
                <div className="h-1.5 bg-[#1a0a05] border border-[#3a2820] rounded overflow-hidden">
                  <div className={`h-full ${unit.hp > unit.maxHp * 0.3 ? 'bg-gradient-to-r from-[#40cc40] to-[#80ff80]' : 'bg-gradient-to-r from-[#cc2020] to-[#ff4040]'} transition-all duration-300`} style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
                </div>
              </div>

              {/* Unit sprite (clickable for attack) */}
              <button
                onClick={() => phase === 'fighting' && isPlayerTurn && unit.alive && executePlayerAttack(idx)}
                disabled={phase !== 'fighting' || !isPlayerTurn || !unit.alive || animatingAction}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  phase === 'fighting' && isPlayerTurn && unit.alive
                    ? 'bg-gradient-to-br from-[#2a4a6a] to-[#1a2a4a] border-[#4a8ab0] hover:scale-110 cursor-pointer'
                    : 'bg-[#1a1a1a] border-[#3a3a3a] opacity-50'
                }`}
              >
                <span className="text-xl">⚔️</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom - Action buttons */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-[#1a0a05] to-[#0d0502] border-t border-[#3a2820]">
        {phase === 'selecting' && (
          <button
            onClick={startBattle}
            className="w-full py-3 bg-gradient-to-r from-[#4a7020] via-[#6a9020] to-[#4a7020] border-2 border-[#80b040] rounded-lg text-white font-bold text-[16px] hover:brightness-110 active:scale-95 transition-all"
          >
            ⚔️ FIGHT! ⚔️
          </button>
        )}

        {phase === 'fighting' && !isPlayerTurn && (
          <div className="text-center text-[#a58d78] text-[14px] animate-pulse">
            Enemy attacking...
          </div>
        )}

        {(phase === 'victory' || phase === 'defeat') && (
          <div className="flex gap-2">
            <button
              onClick={() => onBack?.()}
              className="flex-1 py-3 bg-[#4a3020] border-2 border-[#6a5040] rounded-lg text-white font-bold"
            >
              {phase === 'victory' ? 'Claim Rewards' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}