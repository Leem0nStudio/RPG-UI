import React, { useState, useCallback } from 'react';
import { ChevronLeft, Sparkles, Flame, Droplet, Leaf, Moon, Sun, Sword } from 'lucide-react';
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

type BattlePhase = 'selecting' | 'fighting' | 'victory' | 'defeat';

// Element advantage constants
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
    case 'Fire': return 'from-[#b53c22] to-[#6e1e0a] border-[#8a2d18]';
    case 'Water': return 'from-[#295a8f] to-[#0a233b] border-[#1a4a7f]';
    case 'Earth': return 'from-[#38703a] to-[#123614] border-[#1b5e20]';
    case 'Dark': return 'from-[#4a267a] to-[#1a0833] border-[#311b92]';
    case 'Light': return 'from-[#b59d22] to-[#6e580a] border-[#a18116]';
    default: return 'from-[#295a8f] to-[#0a233b] border-[#1a4a7f]';
  }
}

function getElementIcon(element: Element, size = 14) {
  switch (element) {
    case 'Fire': return <Flame size={size} className="fill-[#e85433] text-[#a62c12]" />;
    case 'Water': return <Droplet size={size} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
    case 'Earth': return <Leaf size={size} className="fill-[#4caf50] text-[#1b5e20]" />;
    case 'Dark': return <Moon size={size} className="fill-[#7e57c2] text-[#311b92]" />;
    case 'Light': return <Sun size={size} className="fill-[#f2da3e] text-[#a18116]" />;
  }
}

interface BattleScreenProps {
  quest: QuestDefinition;
  enemies: EnemyDefinition[];
  onVictory: (result: BattleResult) => void;
  onDefeat: () => void;
  onBack: () => void;
  onFlee: () => void;
}

export function BattleScreen({
  quest,
  enemies,
  onVictory,
  onDefeat,
  onBack,
  onFlee,
}: BattleScreenProps) {
  const { bootstrap } = useGameStore();
  const [phase, setPhase] = useState<BattlePhase>('selecting');
  const [turnCount, setTurnCount] = useState(0);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(0);
  const [battleLog, setBattleLog] = useState<BattleAction[]>([]);
  const [lastAction, setLastAction] = useState<BattleAction | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [animatingAction, setAnimatingAction] = useState(false);
  const [showDamage, setShowDamage] = useState<{ value: number; isEnemy: boolean } | null>(null);
  
  // Track player unit HP in state
const [playerUnitHp, setPlayerUnitHp] = useState<Record<string, number>>({});

  // Debug: Show enemy IDs in UI when empty
  const debugEnemyInfo = enemies.length === 0 ? (
    <div className="text-[10px] text-red-400 mt-1">
      Debug: enemies empty | quest: {quest?.id} | phase: {phase}
    </div>
  ) : null;

  // Initialize player unit HP
  React.useEffect(() => {
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

  // Calculate player units from real data (with dynamic HP)
  const playerUnits: CombatUnit[] = React.useMemo(() => {
    return bootstrap.roster.slice(0, 4).map((owned) => {
      const unitDef = bootstrap.content.units.find(u => u.id === owned.unitId);
      if (!unitDef) {
        return null;
      }
      
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

  // Create enemy instance
  const currentEnemy: EnemyInstance | null = React.useMemo(() => {
    if (enemies.length === 0 || phase !== 'selecting') return null;
    
    const enemyDef = enemies[0];
    const avgPlayerLevel = bootstrap.roster.length > 0
      ? bootstrap.roster.reduce((sum, u) => sum + u.level, 0) / bootstrap.roster.length
      : 1;
    
    return createEnemyInstance(enemyDef, Math.floor(avgPlayerLevel), Math.floor(avgPlayerLevel));
  }, [enemies, phase, bootstrap.roster]);

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
    
    // Calculate damage using the same formula as core battle
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

    // Animation delay
    setTimeout(() => {
      setAnimatingAction(false);
      
      if (newHp <= 0) {
        // Victory!
        setPhase('victory');
        onVictory({
          victory: true,
          turns: turnCount + 1,
          actions: battleLog,
          rewards: {
            exp: currentEnemy.maxHp / 10,
            zel: currentEnemy.maxHp / 5,
            items: [],
          },
          survivingUnits: playerUnits.filter(u => u.alive).map(u => u.instanceId),
          fallenUnits: playerUnits.filter(u => !u.alive).map(u => u.instanceId),
        });
      } else {
        // Enemy turn
        setIsPlayerTurn(false);
        
        setTimeout(() => {
          // Enemy attacks random alive player unit
          const aliveUnits = playerUnits.filter(u => u.alive);
          if (aliveUnits.length === 0) {
            setPhase('defeat');
            onDefeat();
            return;
          }
          
          const target = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
          const enemyDamage = Math.max(1, currentEnemy.stats.atk - Math.round(target.stats.def * 0.55));
          
          // Show damage indicator
          setShowDamage({ value: enemyDamage, isEnemy: true });
          setTimeout(() => setShowDamage(null), 800);
          
          // Update target HP
          setPlayerUnitHp(prev => {
            const newHp = Math.max(0, prev[target.instanceId] - enemyDamage);
            return { ...prev, [target.instanceId]: newHp };
          });
          
          const enemyAction: BattleAction = {
            type: 'attack',
            sourceId: currentEnemy.id,
            targetId: target.instanceId,
            damage: enemyDamage,
            elementMultiplier: getElementMultiplier(currentEnemy.element, target.element),
            isCritical: false,
          };
          
          setLastAction(enemyAction);
          setBattleLog(prev => [...prev, enemyAction]);
          setTurnCount(prev => prev + 1);
          setIsPlayerTurn(true);
        }, 800);
      }
    }, 600);
  }, [phase, isPlayerTurn, currentEnemy, currentEnemyHp, playerUnits, animatingAction, turnCount, battleLog, onVictory, onDefeat]);

  if (!currentEnemy) {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#ef5350] text-[14px]">Enemy not found</p>
          <p className="text-[#ef5350] text-[12px] mt-2">
            enemies: {enemies.length} | quest: {quest.id}
          </p>
          <p className="text-[#ef5350] text-[10px]">
            phase: {phase}
          </p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#5c3a21] rounded text-white font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
          </button>

          <div className="bg-[#1a110a] border-[1.5px] border-[#5a4227] rounded px-3 py-1 flex items-center shadow-inner">
            <span className="ui-heading font-bold text-white text-[12px] tracking-widest text-stroke-sm leading-none">
              {phase === 'fighting' ? `TURN ${turnCount + 1}` : 'BATTLE'}
            </span>
          </div>

          <button
            onClick={onFlee}
            className="bg-[#c62828] border-[2px] border-[#8b0000] rounded px-2 py-1 text-white text-[10px] font-bold"
          >
            FLEE
          </button>
        </div>
      </div>

      {/* Enemy Display */}
      <div className="w-full ui-panel p-2 rpg-panel-shadow relative">
        <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20" />
        
        <div className="relative z-10 flex items-center gap-4">
          {/* Enemy Sprite */}
          <div className="relative">
            <img
              src={getEnemySpriteUrl(currentEnemy.element)}
              alt={currentEnemy.name}
              className="w-[80px] h-[80px] object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: getEnemyCssFilter(currentEnemy.element),
              }}
            />
          </div>

          {/* Enemy Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getElementIcon(currentEnemy.element, 16)}
              <span className="ui-heading text-[16px] text-white text-stroke-sm">
                {currentEnemy.name}
              </span>
            </div>

            <div className="w-full h-[12px] bg-[#1a1105] border-[1.5px] border-[#000] rounded p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-[#ff3333] via-[#cc0000] to-[#660000] transition-all duration-300"
                style={{ width: `${(currentEnemyHp / currentEnemy.maxHp) * 100}%` }}
              />
            </div>
            <div className="text-right text-[12px] text-white mt-1">
              {currentEnemyHp.toLocaleString()} / {currentEnemy.maxHp.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log / Animation Area */}
      {phase === 'fighting' && lastAction && (
        <div className="w-full ui-panel p-2 rpg-panel-shadow relative h-[60px] flex items-center justify-center overflow-hidden">
          {/* Damage popup animation */}
          {showDamage && (
            <div className={`absolute text-[24px] font-bold ${showDamage.isEnemy ? 'text-[#ff4444]' : 'text-[#ffdd44]'} animate-bounce`}>
              -{showDamage.value}
            </div>
          )}
          <div className={`text-center ${showDamage ? 'opacity-30' : 'animate-pulse'}`}>
            <span className="text-[14px] font-bold text-white">
              {lastAction.sourceId.includes('enemy') ? currentEnemy.name : playerUnits.find(u => u.instanceId === lastAction.sourceId)?.name}
            </span>
            <span className="text-[#ef5350]"> deals </span>
            <span className="text-[16px] font-bold text-[#ffdd44]">{lastAction.damage}</span>
            <span className="text-[#ef5350]"> damage!</span>
            {lastAction && (lastAction.elementMultiplier ?? 1) !== 1 && (
              <span className={`ml-2 text-[12px] font-bold ${(lastAction.elementMultiplier ?? 1) > 1 ? 'text-[#88ff00]' : 'text-[#ff8800]'}`}>
                {(lastAction.elementMultiplier ?? 1) > 1 ? 'SUPER EFFECTIVE!' : 'NOT VERY EFFECTIVE...'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Player Squad */}
      <div className="w-full ui-panel p-2 rpg-panel-shadow relative flex-shrink-0">
        <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20" />
        
        <div className="grid grid-cols-2 gap-[4px] relative z-10">
          {playerUnits.map((unit, idx) => {
            const isBeingAttacked = showDamage?.isEnemy && lastAction?.targetId === unit.instanceId;
            return (
            <div
              key={unit.instanceId}
              className={`relative bg-gradient-to-b ${getElementColor(unit.element)} border-[1.5px] border-[#5a4227] rounded-[3px] flex shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-200 ${!unit.alive ? 'opacity-50' : ''} ${isBeingAttacked ? 'animate-pulse bg-red-900/50' : ''}`}
            >
              <div className="w-[50px] bg-black border-r-[1.5px] border-[#382618] flex-shrink-0 flex justify-center items-center">
                <Sparkles size={24} className="fill-[#f5d796] text-[#c79a5d]" />
              </div>

              <div className="flex-1 flex flex-col justify-center px-2">
                <div className="flex items-center gap-1">
                  {getElementIcon(unit.element, 10)}
                  <span className="text-[10px] font-bold text-white truncate">
                    {unit.name}
                  </span>
                </div>
                <div className={`text-[12px] font-bold text-right ${unit.hp < unit.maxHp * 0.3 ? 'text-[#ff4444]' : 'text-white'}`}>
                  {unit.hp}/{unit.maxHp}
                </div>
                <div className="w-full h-[6px] bg-[#1a1105] border-[1px] border-[#000] rounded p-[1px]">
                  <div
                    className={`h-full transition-all duration-300 ${unit.hp < unit.maxHp * 0.3 ? 'bg-gradient-to-r from-[#ff3333] via-[#cc0000] to-[#660000]' : 'bg-gradient-to-r from-[#88ff00] to-[#20cc20]'}`}
                    style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                  />
                </div>
                {/* BB Gauge */}
                <div className="w-full h-[4px] bg-[#1a1105] border-[1px] border-[#000] rounded p-[1px] mt-[2px]">
                  <div
                    className="h-full bg-gradient-to-r from-[#aaffff] to-[#0055ff] transition-all duration-300"
                    style={{ width: `${unit.bbGauge}%` }}
                  />
                </div>
              </div>

              {/* Attack Button */}
              {phase === 'fighting' && isPlayerTurn && unit.alive && (
                <button
                  onClick={() => executePlayerAttack(idx)}
                  disabled={animatingAction}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/40 transition-colors disabled:opacity-50"
                >
                  <Sword size={20} className="fill-[#ffdd44] text-[#cc9900]" />
                </button>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Phase-specific UI */}
      {phase === 'selecting' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="ui-heading text-[16px] text-white text-center">
            {quest.name}
          </p>
          <div className="flex gap-4">
            <button
              onClick={startBattle}
              className="bg-[#2e7d32] border-[2px] border-[#1b5e20] rounded px-6 py-3 text-white font-bold hover:brightness-110 active:scale-95"
            >
              FIGHT!
            </button>
            <button
              onClick={onFlee}
              className="bg-[#5c3a21] border-[2px] border-[#3c2a16] rounded px-6 py-3 text-white font-bold hover:brightness-110 active:scale-95"
            >
              RETREAT
            </button>
          </div>
        </div>
      )}

      {/* Victory/Defeat Overlay */}
      {(phase === 'victory' || phase === 'defeat') && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
          <div className={`ui-panel p-6 rpg-panel-shadow text-center ${phase === 'victory' ? 'border-[#2e7d32]' : 'border-[#c62828]'}`}>
            <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20" />
            
            <div className="relative z-10">
              <p className={`ui-heading text-[24px] ${phase === 'victory' ? 'text-[#88ff00]' : 'text-[#ef5350]'}`}>
                {phase === 'victory' ? 'VICTORY!' : 'DEFEAT'}
              </p>
              <p className="text-[#c79a5d] mt-2">
                {phase === 'victory' 
                  ? `Cleared in ${turnCount} turns!`
                  : 'Your squad was defeated...'}
              </p>
              <button
                onClick={onBack}
                className="mt-4 bg-[#5c3a21] border-[2px] border-[#c79a5d] rounded px-6 py-2 text-white font-bold"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}