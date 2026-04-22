"use client";

import React, { startTransition, useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { HomeHubView } from '@/components/views/HomeHubView';
import { UnitListView } from '@/components/views/UnitListView';
import { CharacterView } from '@/components/views/CharacterView';
import { InventoryView } from '@/components/views/InventoryView';
import { QuestScreen } from '@/components/views/QuestScreen';
import { BattleScreen } from '@/components/views/BattleScreen';
import { SummoningScreenView } from '@/components/views/SummoningScreenView';
import { calculateUnitStats } from '@/core/stats';
import { useGameStore, selectCurrentOwnedUnit, selectCurrentUnitDefinition, selectEquippedItems } from '@/store/game-store';
import type { JobDefinition, QuestDefinition, EnemyDefinition, BattleState, StatBlock } from '@/backend-contracts/game';
import { useMemo } from 'react';

function resolveUnitSprite(unit: any, jobs: JobDefinition[]): { spriteUrl: string; cssFilter: string } {
  const job = jobs.find(j => j.id === unit.jobId);
  if (job) {
    return { spriteUrl: job.spriteUrl, cssFilter: job.cssFilter };
  }
  return { spriteUrl: unit.spriteUrl ?? '', cssFilter: unit.cssFilter ?? '' };
}

export default function Home() {
  const {
    isBootstrapping,
    view,
    targetSlot,
    bootstrap,
    setView,
    selectUnit,
    openInventoryForSlot,
    equipItem,
    unequipItem,
    bootstrapGame,
    startQuest,
    currentQuest,
    currentEnemies,
    battleState,
    lastBattleResult,
    completeBattle,
    cancelBattle,
  } = useGameStore();
  
  // Local state for quest selection flow
  const [pendingQuest, setPendingQuest] = useState<QuestDefinition | null>(null);

  useEffect(() => {
    startTransition(() => {
      void bootstrapGame();
    });
  }, [bootstrapGame]);

  // Get state directly to avoid selector issues
  const state = useGameStore();
  const currentOwnedUnit = state.selectedUnitInstanceId 
    ? state.bootstrap.roster.find(u => u.instanceId === state.selectedUnitInstanceId) ?? null
    : state.bootstrap.roster[0] ?? null;
  const currentUnit = currentOwnedUnit
    ? state.bootstrap.content.units.find(u => u.id === currentOwnedUnit.unitId) ?? null
    : null;
  
  const equipped = useMemo(() => {
    if (!currentOwnedUnit) return { Weapon: null, Armor: null, Accessory: null };
    return {
      Weapon: state.bootstrap.content.items.find(i => i.id === currentOwnedUnit.equipment.Weapon) ?? null,
      Armor: state.bootstrap.content.items.find(i => i.id === currentOwnedUnit.equipment.Armor) ?? null,
      Accessory: state.bootstrap.content.items.find(i => i.id === currentOwnedUnit.equipment.Accessory) ?? null,
    };
  }, [currentOwnedUnit, state.bootstrap.content.items]);
  
  const currentStats: StatBlock = useMemo(() => {
    if (!currentUnit || !currentOwnedUnit) return { hp: 0, atk: 0, def: 0, rec: 0 };
    const job = state.bootstrap.content.jobs.find(j => j.id === currentUnit.jobId);
    return calculateUnitStats(currentUnit, currentOwnedUnit, [equipped.Weapon, equipped.Armor, equipped.Accessory], job);
  }, [currentUnit, currentOwnedUnit, equipped, state.bootstrap.content.jobs]);

  const uiCharacters = bootstrap.content.units.map((unit) => {
    const owned = bootstrap.roster.find((entry) => entry.unitId === unit.id);
    const { spriteUrl, cssFilter } = resolveUnitSprite(unit, bootstrap.content.jobs);
    return {
      ...unit,
      spriteUrl,
      cssFilter,
      jobId: unit.jobId,
      level: owned?.level ?? 1,
      maxLevel: unit.maxLevel,
      exp: owned?.exp ?? 0,
      maxExp: Math.max(15, unit.maxLevel * 150),
    };
  });

  const inventory = bootstrap.content.items.filter((item) =>
    bootstrap.items.some((ownedItem) => ownedItem.itemId === item.id && ownedItem.quantity > 0)
  );

  const summonUnits = bootstrap.content.units.map((unit) => {
    const { spriteUrl, cssFilter } = resolveUnitSprite(unit, bootstrap.content.jobs);
    return { ...unit, spriteUrl, cssFilter };
  });

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden select-none ui-text bg-[var(--color-bg-root)]">
      <div
        className="relative w-full max-w-[420px] h-[100dvh] max-h-[850px] sm:h-[85dvh] sm:rounded-[12px] overflow-hidden flex flex-col sm:border-[5px] sm:border-[var(--color-surface-4)] shadow-[var(--shadow-high),inset_0_0_15px_rgba(0,0,0,0.45)] bg-[var(--color-bg-surface)]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 50%, rgba(120, 60, 20, 0.11) 0%, rgba(20, 10, 5, 0.93) 100%),
            repeating-conic-gradient(from 45deg at 20% 20%, #412614 0deg 90deg, #332012 90deg 180deg)
          `,
          backgroundSize: '100% 100%, 80px 80px',
        }}
      >
        <TopBar
          playerName={bootstrap.player.name}
          playerLevel={bootstrap.player.level}
          gems={bootstrap.player.currencies.gems}
          zel={bootstrap.player.currencies.zel}
          karma={bootstrap.player.currencies.karma}
        />

        <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2 relative z-10 w-full flex flex-col scroll-smooth">
          {isBootstrapping && (
            <div className="ui-panel p-4 text-center">
              <div className="ui-heading text-[18px] text-white text-stroke-sm">Loading realm data...</div>
              <p className="mt-2 text-[12px] text-[#3c2a16]">Bootstrapping Supabase-ready content, player state, and runtime shell.</p>
            </div>
          )}

          {!isBootstrapping && view === 'home' && (
            <HomeHubView
              bootstrap={bootstrap}
              onOpenUnits={() => setView('unitList')}
              onOpenQuest={() => setView('quest')}
              onOpenSummon={() => setView('summon')}
            />
          )}
          
          {!isBootstrapping && view === 'quest' && (
            <QuestScreen
              bootstrap={bootstrap}
              onSelectQuest={async (quest) => {
                setPendingQuest(quest);
                // Load enemies and wait for them
                await startQuest(quest);
                // Now set view to battle after enemies are loaded
                setView('battle');
              }}
              onBack={() => setView('home')}
            />
          )}

          {!isBootstrapping && view === 'unitList' && uiCharacters.length > 0 && (
            <UnitListView
              characters={uiCharacters}
              onSelectCharacter={(unitId) => {
                const owned = bootstrap.roster.find((entry) => entry.unitId === unitId);
                if (owned) selectUnit(owned.instanceId);
              }}
            />
          )}

          {!isBootstrapping && view === 'unitList' && uiCharacters.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#a58d78] text-center p-4">
              <div>
                <p className="ui-heading text-[18px] mb-2">No Units Found</p>
                <p className="text-[12px]">Visit the Summon to recruit units</p>
              </div>
            </div>
          )}

          {!isBootstrapping && view === 'character' && !currentUnit && (
            <div className="flex-1 flex items-center justify-center text-[#a58d78] text-center p-4">
              <div>
                <p className="ui-heading text-[18px] mb-2">No Unit Selected</p>
                <button 
                  onClick={() => setView('unitList')}
                  className="ui-panel px-4 py-2 text-[12px] font-bold text-[#3c2a16]"
                >
                  Select a Unit
                </button>
              </div>
            </div>
          )}

          {!isBootstrapping && view === 'character' && currentUnit && (
            <CharacterView
              character={{
                ...currentUnit,
                level: currentOwnedUnit?.level ?? 1,
                maxLevel: currentUnit.maxLevel,
                exp: currentOwnedUnit?.exp ?? 0,
                maxExp: Math.max(15, currentUnit.maxLevel * 150),
              }}
              job={bootstrap.content.jobs.find(j => j.id === currentUnit.jobId)}
              stats={currentStats}
              equipped={equipped}
              onOpenInventory={openInventoryForSlot}
              onBack={() => setView('unitList')}
            />
          )}

          {!isBootstrapping && view === 'inventory' && (
            <InventoryView
              targetSlot={targetSlot}
              inventory={inventory}
              onBack={() => setView('character')}
              onEquip={(item) => equipItem(item.id)}
              onUnequip={unequipItem}
              equippedItem={targetSlot ? equipped[targetSlot] : null}
            />
          )}

          {console.log('[page] battle render:', { view, pendingQuest: pendingQuest?.id, currentEnemiesLen: currentEnemies.length, currentEnemiesIds: currentEnemies.map(e => e.id) }) && null}

          {!isBootstrapping && view === 'battle' && pendingQuest && currentEnemies.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#a58d78] text-center p-4">
              <div>
                <p className="ui-heading text-[18px] mb-2">No Enemies Found</p>
                <p className="text-[12px]">Quest enemies not loaded</p>
                <button onClick={() => setView('quest')} className="ui-panel px-4 py-2 text-[12px] font-bold text-[#3c2a16] mt-2">
                  Back to Quests
                </button>
              </div>
            </div>
          )}

          {!isBootstrapping && view === 'battle' && pendingQuest && currentEnemies.length > 0 && (
            <BattleScreen
              quest={pendingQuest}
              enemies={currentEnemies}
              onVictory={(result) => {
                const battleResult: BattleState = {
                  questId: pendingQuest?.id ?? null,
                  enemyInstanceId: result.actions[0]?.targetId ?? '',
                  enemyHp: 0,
                  enemyMaxHp: 0,
                  enemyElement: 'Water',
                  playerUnits: bootstrap.roster.slice(0, 4).map(u => ({
                    instanceId: u.instanceId,
                    currentHp: 0,
                    bbGauge: 0,
                  })),
                  battlePhase: 'victory',
                  turnNumber: result.turns,
                };
                void completeBattle(battleResult);
                setView('home');
              }}
              onDefeat={() => {
                setView('home');
              }}
              onBack={() => {
                setPendingQuest(null);
                cancelBattle();
                setView('quest');
              }}
              onFlee={() => {
                setPendingQuest(null);
                cancelBattle();
                setView('quest');
              }}
            />
          )}

          {!isBootstrapping && view === 'summon' && (
            <SummoningScreenView units={summonUnits} banners={bootstrap.content.banners} />
          )}
        </div>

        <BottomNavBar currentView={view} setView={setView} />
      </div>
    </div>
  );
}
