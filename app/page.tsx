"use client";

import React, { startTransition, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { HomeHubView } from '@/components/views/HomeHubView';
import { UnitListView } from '@/components/views/UnitListView';
import { CharacterView } from '@/components/views/CharacterView';
import { InventoryView } from '@/components/views/InventoryView';
import { BattleScreenView } from '@/components/views/BattleScreenView';
import { SummoningScreenView } from '@/components/views/SummoningScreenView';
import { calculateUnitStats } from '@/core/stats';
import { useGameStore, selectCurrentOwnedUnit, selectCurrentUnitDefinition, selectEquippedItems } from '@/store/game-store';

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
  } = useGameStore();

  useEffect(() => {
    startTransition(() => {
      void bootstrapGame();
    });
  }, [bootstrapGame]);

  const currentOwnedUnit = selectCurrentOwnedUnit(useGameStore.getState());
  const currentUnit = selectCurrentUnitDefinition(useGameStore.getState());
  const equipped = selectEquippedItems(useGameStore.getState());
  const currentStats = currentUnit && currentOwnedUnit
    ? calculateUnitStats(currentUnit, currentOwnedUnit, [equipped.Weapon, equipped.Armor, equipped.Accessory])
    : { hp: 0, atk: 0, def: 0, rec: 0 };

  const uiCharacters = bootstrap.content.units.map((unit) => {
    const owned = bootstrap.roster.find((entry) => entry.unitId === unit.id);
    return {
      ...unit,
      level: owned?.level ?? 1,
      maxLevel: unit.maxLevel,
      exp: owned?.exp ?? 0,
      maxExp: Math.max(15, unit.maxLevel * 150),
    };
  });

  const inventory = bootstrap.content.items.filter((item) =>
    bootstrap.items.some((ownedItem) => ownedItem.itemId === item.id && ownedItem.quantity > 0)
  );

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
              onOpenQuest={() => setView('battle')}
              onOpenSummon={() => setView('summon')}
            />
          )}

          {!isBootstrapping && view === 'unitList' && (
            <UnitListView
              characters={uiCharacters}
              onSelectCharacter={(unitId) => {
                const owned = bootstrap.roster.find((entry) => entry.unitId === unitId);
                if (owned) selectUnit(owned.instanceId);
              }}
            />
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

          {!isBootstrapping && view === 'battle' && (
            <BattleScreenView onBack={() => setView('home')} />
          )}

          {!isBootstrapping && view === 'summon' && (
            <SummoningScreenView />
          )}
        </div>

        <BottomNavBar currentView={view} setView={setView} />
      </div>
    </div>
  );
}
