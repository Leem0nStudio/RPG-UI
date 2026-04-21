"use client";

import React, { useState } from 'react';
import { ItemType, Item, CharEquipment } from '@/lib/types';
import { CHARACTERS, INVENTORY } from '@/lib/mock-data';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

import { UnitListView } from '@/components/views/UnitListView';
import { CharacterView } from '@/components/views/CharacterView';
import { InventoryView } from '@/components/views/InventoryView';
import { BattleScreenView } from '@/components/views/BattleScreenView';
import { SummoningScreenView } from '@/components/views/SummoningScreenView';

export default function Home() {
  const [view, setView] = useState<'unitList' | 'character' | 'inventory' | 'battle' | 'summon'>('unitList');
  const [selectedCharId, setSelectedCharId] = useState<string>(CHARACTERS[0].id);
  const [targetSlot, setTargetSlot] = useState<ItemType | null>(null);

  const [equippedByChar, setEquippedByChar] = useState<Record<string, CharEquipment>>({
    c1: { Weapon: null, Armor: null, Accessory: null },
    c2: { Weapon: null, Armor: null, Accessory: null },
    c3: { Weapon: null, Armor: null, Accessory: null },
    c4: { Weapon: null, Armor: null, Accessory: null }
  });

  const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];
  const charEquip = equippedByChar[selectedCharId] || { Weapon: null, Armor: null, Accessory: null };

  // Calculate current stats including equipment boosts for the selected character
  const currentStats = {
    hp: selectedChar.baseStats.hp + (charEquip.Weapon?.stats.hp || 0) + (charEquip.Armor?.stats.hp || 0) + (charEquip.Accessory?.stats.hp || 0),
    atk: selectedChar.baseStats.atk + (charEquip.Weapon?.stats.atk || 0) + (charEquip.Armor?.stats.atk || 0) + (charEquip.Accessory?.stats.atk || 0),
    def: selectedChar.baseStats.def + (charEquip.Weapon?.stats.def || 0) + (charEquip.Armor?.stats.def || 0) + (charEquip.Accessory?.stats.def || 0),
    rec: selectedChar.baseStats.rec + (charEquip.Weapon?.stats.rec || 0) + (charEquip.Armor?.stats.rec || 0) + (charEquip.Accessory?.stats.rec || 0),
  };

  const handleOpenInventory = (slot: ItemType) => {
    setTargetSlot(slot);
    setView('inventory');
  };

  const handleSelectCharacter = (id: string) => {
    setSelectedCharId(id);
    setView('character');
  };

  const handleEquipItem = (item: Item) => {
    if (targetSlot === item.type) {
      setEquippedByChar(prev => ({
        ...prev,
        [selectedCharId]: { ...prev[selectedCharId], [item.type]: item }
      }));
      setView('character');
    }
  };

  const handleUnequip = (slot: ItemType) => {
    setEquippedByChar(prev => ({
      ...prev,
      [selectedCharId]: { ...prev[selectedCharId], [slot]: null }
    }));
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1a110a] overflow-hidden font-sans select-none">
      <div 
        className="relative w-full max-w-[420px] h-[100dvh] max-h-[850px] sm:h-[85dvh] sm:rounded-[12px] overflow-hidden flex flex-col sm:border-[5px] sm:border-[#382618] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,0,0,0.5)] bg-[#3a2010]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 50%, rgba(120, 60, 20, 0.15) 0%, rgba(20, 10, 5, 0.95) 100%),
            repeating-conic-gradient(from 45deg at 20% 20%, #462916 0deg 90deg, #3d2312 90deg 180deg)
          `,
          backgroundSize: '100% 100%, 80px 80px'
        }}
      >
        <TopBar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2 relative z-10 w-full flex flex-col scroll-smooth">
          {view === 'unitList' && (
            <UnitListView
               characters={CHARACTERS}
               onSelectCharacter={handleSelectCharacter}
            />
          )}
          {view === 'character' && (
            <CharacterView 
               character={selectedChar}
               stats={currentStats} 
               equipped={charEquip} 
               onOpenInventory={handleOpenInventory}
               onBack={() => setView('unitList')}
            />
          )}
          {view === 'inventory' && (
            <InventoryView 
               targetSlot={targetSlot} 
               inventory={INVENTORY}
               onBack={() => setView('character')}
               onEquip={handleEquipItem}
               onUnequip={handleUnequip}
               equippedItem={targetSlot ? charEquip[targetSlot] : null}
            />
          )}
          {view === 'battle' && (
            <BattleScreenView onBack={() => setView('unitList')} />
          )}
          {view === 'summon' && (
            <SummoningScreenView />
          )}
        </div>
        <BottomNavBar currentView={view} setView={setView} />
      </div>
    </div>
  );
}
