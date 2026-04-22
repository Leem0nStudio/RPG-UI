import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
import { calculateUnitStats } from '@/core/stats';
import { getElementMultiplier } from '@/core/elemental';
import { createEnemyInstance, CombatUnit, EnemyInstance, BattleAction } from '@/services/battle-service';

export type BattlePhase = 'selecting' | 'fighting' | 'victory' | 'defeat';

export interface BattleState {
  phase: BattlePhase;
  turnCount: number;
  currentEnemyHp: number;
  currentEnemy: EnemyInstance | null;
  battleEnemy: EnemyInstance | null;
  battleLog: BattleAction[];
  lastAction: BattleAction | null;
  isPlayerTurn: boolean;
  playerUnitHp: Record<string, number>;
}

export function useBattle(enemyIds?: string[]) {
  const { bootstrap, currentEnemies } = useGameStore();
  const enemies = currentEnemies;

  // Battle phase
  const [phase, setPhase] = useState<BattlePhase>('selecting');
  const [turnCount, setTurnCount] = useState(0);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(0);
  const [battleEnemy, setBattleEnemy] = useState<EnemyInstance | null>(null);
  const [battleLog, setBattleLog] = useState<BattleAction[]>([]);
  const [lastAction, setLastAction] = useState<BattleAction | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [animatingAction, setAnimatingAction] = useState(false);
  const [showDamage, setShowDamage] = useState<{ value: number; isEnemy: boolean } | null>(null);

  // Player HP tracking
  const [playerUnitHp, setPlayerUnitHp] = useState<Record<string, number>>({});
  
  // Refs for timeout cleanup
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isMountedRef = useRef(true);
  const attackInProgressRef = useRef(false);

  // Initialize player HP when roster changes
  useEffect(() => {
    const initialHp: Record<string, number> = {};
    bootstrap.roster.slice(0, 5).forEach(owned => {
      const unitDef = bootstrap.content.units.find(u => u.id === owned.unitId);
      if (unitDef) {
        const job = bootstrap.content.jobs.find(j => j.id === owned.jobId);
        const stats = calculateUnitStats(unitDef, owned, [], job);
        initialHp[owned.instanceId] = stats.hp;
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerUnitHp(initialHp);
  }, [bootstrap.roster, bootstrap.content.units, bootstrap.content.jobs]);

  // Calculate player units with current HP
  const playerUnits: CombatUnit[] = useMemo(() => {
    return bootstrap.roster.slice(0, 5).map((owned) => {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBattleEnemy(enemy);
    
    return () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBattleEnemy(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, bootstrap.roster]);

  // Start battle
  const startBattle = useCallback(() => {
    if (!battleEnemy) return;
    setCurrentEnemyHp(battleEnemy.hp);
    setPhase('fighting');
    setTurnCount(0);
    setBattleLog([]);
    setIsPlayerTurn(true);
  }, [battleEnemy]);

  // Execute player attack
  const executePlayerAttack = useCallback((unitIndex: number, onVictory?: () => void, onDefeat?: () => void) => {
    if (attackInProgressRef.current) return;
    if (phase !== 'fighting' || !isPlayerTurn || !battleEnemy || animatingAction) return;
    const unit = playerUnits[unitIndex];
    if (!unit || !unit.alive) return;

    attackInProgressRef.current = true;
    setAnimatingAction(true);
    const elementMultiplier = getElementMultiplier(unit.element, battleEnemy.element);
    const rawDamage = Math.max(1, unit.stats.atk - Math.round(battleEnemy.stats.def * 0.55));
    const damage = Math.round(rawDamage * elementMultiplier);
    const newHp = Math.max(0, currentEnemyHp - damage);

    const action: BattleAction = {
      type: 'attack',
      sourceId: unit.instanceId,
      targetId: battleEnemy.id,
      damage,
      elementMultiplier,
      isCritical: false,
    };

    setLastAction(action);
    setBattleLog(prev => [...prev, action]);
    setCurrentEnemyHp(newHp);
    setShowDamage({ value: damage, isEnemy: true });

    const timeout1 = setTimeout(() => {
      if (!isMountedRef.current) {
        attackInProgressRef.current = false;
        return;
      }
      setAnimatingAction(false);
      if (newHp <= 0) {
        attackInProgressRef.current = false;
        setPhase('victory');
        onVictory?.();
      } else {
        setIsPlayerTurn(false);
        const timeout2 = setTimeout(() => {
          if (!isMountedRef.current) {
            attackInProgressRef.current = false;
            return;
          }
          const aliveUnits = playerUnits.filter(u => u.alive);
          if (aliveUnits.length === 0) {
            attackInProgressRef.current = false;
            setPhase('defeat');
            onDefeat?.();
            return;
          }
          const target = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
          const enemyDamage = Math.max(1, battleEnemy.stats.atk - Math.round(target.stats.def * 0.55));
          setPlayerUnitHp(prev => ({ ...prev, [target.instanceId]: Math.max(0, target.hp - enemyDamage) }));
          setTurnCount(prev => prev + 1);
          setIsPlayerTurn(true);
          attackInProgressRef.current = false;
        }, 800);
        timeoutRef.current.set('enemyTurn', timeout2);
      }
      setShowDamage(null);
    }, 600);
    timeoutRef.current.set('playerAttack', timeout1);
  }, [phase, isPlayerTurn, battleEnemy, currentEnemyHp, playerUnits, animatingAction]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      attackInProgressRef.current = false;
      const timeouts = timeoutRef.current;
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  return {
    // State
    phase,
    turnCount,
    currentEnemyHp,
    battleEnemy,
    battleLog,
    lastAction,
    isPlayerTurn,
    animatingAction,
    showDamage,
    playerUnits,
    playerUnitHp,
    setPlayerUnitHp,
    // Actions
    startBattle,
    executePlayerAttack,
    setPhase,
  };
}