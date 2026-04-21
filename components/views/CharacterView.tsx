import React from 'react';
import { ChevronLeft, Flame, Droplet, Leaf, Moon, Sun, Star, Flag, Sparkles, Sword } from 'lucide-react';
import { CharacterData, ItemType, CharEquipment } from '@/lib/types';
import type { JobDefinition } from '@/backend-contracts/game';
import { StatBox } from '@/components/ui/StatBox';
import { SkillPanel } from '@/components/ui/SkillPanel';
import { EquipmentSlot } from '@/components/ui/EquipmentSlot';

export function CharacterView({ character, job, stats, equipped, onOpenInventory, onBack }: { character: CharacterData, job?: JobDefinition, stats: any, equipped: CharEquipment, onOpenInventory: (slot: ItemType) => void, onBack: () => void }) {
  const spriteUrl = job?.spriteUrl ?? character.spriteUrl ?? '';
  const cssFilter = job?.cssFilter ?? character.cssFilter ?? '';
  const getStatColor = (current: number, base: number) => current > base ? "text-[#00ffcc]" : "text-white";

  const getElementIcon = () => {
    switch (character.element) {
      case 'Fire': return <Flame size={24} className="fill-[#e85433] text-[#a62c12]" />;
      case 'Water': return <Droplet size={24} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
      case 'Earth': return <Leaf size={24} className="fill-[#4caf50] text-[#1b5e20]" />;
      case 'Dark': return <Moon size={24} className="fill-[#7e57c2] text-[#311b92]" />;
      case 'Light': return <Sun size={24} className="fill-[#f2da3e] text-[#a18116]" />;
      default: return <Droplet size={24} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
    }
  };

  const getElementColor = () => {
    switch (character.element) {
      case 'Fire': return "from-[#f5a691] to-[#c44f36] border-[#782312]";
      case 'Water': return "from-[#b8d4e4] to-[#4b7a9f] border-[#223545]";
      case 'Earth': return "from-[#c8e6c9] to-[#66bb6a] border-[#2e7d32]";
      case 'Dark': return "from-[#d1c4e9] to-[#9575cd] border-[#4527a0]";
      case 'Light': return "from-[#f5e391] to-[#c4ab36] border-[#786b12]";
      default: return "from-[#b8d4e4] to-[#4b7a9f] border-[#223545]";
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300 ui-text">
      <div className="w-full flex justify-start mb-2 relative z-30">
        <button onClick={onBack} className="ui-panel px-2 py-1 flex items-center text-[12px] font-bold text-[#3c2a16] text-stroke-sm active:scale-95 hover:brightness-110 transition-all ui-heading tracking-wide">
           <ChevronLeft size={16} className="-ml-1 text-[#3c2a16]" /> Units
        </button>
      </div>
      <div className="flex flex-col sm:flex-row w-full mb-2 relative gap-2 sm:gap-0 sm:space-x-2">
        {/* LEFT COLUMN - STATS */}
        <div className="flex-[1.1] min-w-0 flex flex-col gap-[6px] relative z-20">
          
          {/* Header Panel */}
          <div className="ui-panel p-2 rpg-panel-shadow relative">
            <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative mb-1">
              <div className="flex flex-col min-w-0">
                <h1 className="text-[20px] sm:text-[22px] ui-heading text-[#f2e6d5] text-stroke-black fx-low leading-none font-bold tracking-tight truncate">
                  {character.name}
                </h1>
                <div className="flex mt-[3px] text-[#ffe46e]">
                  {[...Array(character.rarity)].map((_, i) => <Star key={i} size={13} className="fill-[#ffe46e]" />)}
                </div>
              </div>
              <div className={`w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-b ${getElementColor()} border-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center -mt-1 -mr-1 ml-1`}>
                {getElementIcon()}
              </div>
            </div>

            <div className="text-[12px] text-[#2c1d11] font-bold mb-[2px] tracking-tight ui-text">
              Class: <span className="text-[#2c1d11] capitalize">{job?.name ?? 'Unknown'}</span>
            </div>
            
            <div className="w-[102%] -ml-[1%] h-[2px] bg-gradient-to-r from-transparent via-[#8a6b4c] to-transparent my-[6px] opacity-60"></div>

            {/* Level / EXP block */}
            <div className="flex flex-col gap-[2px] text-[11px] font-bold text-[#2c1d11] w-full leading-tight ui-text">
              <div className="flex justify-between items-end border-b border-[#2c1d11] border-opacity-20 pb-[2px] mb-[2px]">
                <div className="text-[13px] leading-none">Lv <span className="text-[16px] text-[#1a110a]">{character.level}</span>/{character.maxLevel}</div>
                <div className="leading-none text-[11px]">{character.exp} / {character.maxExp} EXP</div>
              </div>
              
              <div className="w-full h-[5px] bg-[#1a110a] rounded-[2px] overflow-hidden relative shadow-[0_1px_0_rgba(255,255,255,0.3)] my-[1px]">
                 <div className="h-full bg-gradient-to-r from-[#88ff00] to-[#00ff88] transition-all duration-1000 ease-out" style={{ width: `${(character.exp / character.maxExp) * 100}%` }}></div>
              </div>
              
              <div className="flex justify-between w-full mt-[2px]">
                <div>Next Level: <span className="text-[#1a110a] text-[12px]">{character.maxExp - character.exp}</span></div>
                <div>Unit Cost: <span className="text-[#1a110a] text-[12px]">{character.cost}</span></div>
              </div>
            </div>
          </div>

          {/* Stats Box Grid */}
          <div className="ui-panel p-2 rpg-panel-shadow flex flex-wrap justify-between gap-y-[4px] relative">
            <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
            
            <StatBox label="HP" value={stats.hp} colorClass="from-[#3a6b42] via-[#295a30] to-[#1e4224]" borderClass="border-[#554b3e]" labelColor="text-[#89e09d]" valueColor={getStatColor(stats.hp, character.baseStats.hp)} />
            <StatBox label="ATK" value={stats.atk} colorClass="from-[#8c2b2b] via-[#6e1c1c] to-[#4a1010]" borderClass="border-[#554b3e]" labelColor="text-[#e25c5c]" valueColor={getStatColor(stats.atk, character.baseStats.atk)} />
            <StatBox label="DEF" value={stats.def} colorClass="from-[#2e588c] via-[#1c3a61] to-[#10243d]" borderClass="border-[#554b3e]" labelColor="text-[#7aaef0]" valueColor={getStatColor(stats.def, character.baseStats.def)} />
            <StatBox label="REC" value={stats.rec} colorClass="from-[#b38a2e] via-[#8c6b1f] to-[#5c4613]" borderClass="border-[#554b3e]" labelColor="text-[#fae18c]" valueColor={getStatColor(stats.rec, character.baseStats.rec)} />
          </div>

          {character.skills && character.skills.map((skill) => {
            let IconComponent = <Sparkles size={14} className="text-[#f5d796] fill-[#f5d796]" />;
            let typeGradient = "from-[#ffc466] to-[#eb7a23]";
            
            if (skill.iconType === 'Flag') {
              IconComponent = <Flag size={14} className="text-[#f5d796] fill-[#f5d796]" />;
              typeGradient = "from-[#ffd399] to-[#d68845]";
            } else if (skill.iconType === 'Sword') {
              IconComponent = <Sword size={14} className="text-[#f5d796] fill-[#f5d796]" />;
              typeGradient = "from-[#b8d4e4] to-[#4b7a9f]";
            }

            return (
              <SkillPanel 
                key={skill.id}
                icon={IconComponent}
                type={skill.type}
                title={skill.title}
                desc={skill.description}
                cost={skill.cost?.toString()}
                typeGradient={typeGradient}
              />
            );
          })}
        </div>

        {/* RIGHT COLUMN - SPRITE */}
        <div className="flex-[0.9] flex flex-col justify-start items-center z-10 sm:sticky sm:top-0 py-1 sm:py-2 min-w-0">
          
          <div className="w-[72%] sm:w-[85%] max-w-[140px] ui-panel shadow-[var(--shadow-medium)] flex flex-col items-center py-[6px] px-1 relative z-30 mb-4 sm:mb-8 mx-auto mt-0 sm:-mt-2">
            <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
            <span className="ui-heading text-[12px] sm:text-[13px] font-bold text-white text-stroke-black fx-low tracking-widest leading-none mb-[2px] truncate w-full text-center">
              {character.title}
            </span>
            <div className="flex flex-wrap justify-center max-w-full">
              {[...Array(character.rarity)].map((_, i) => <Star key={i} size={9} className="fill-[#ffe46e] text-[#b39832] drop-shadow-md" />)}
            </div>
          </div>

          <div className="relative w-full h-[170px] sm:h-[200px] flex flex-col items-center justify-end z-20 overflow-visible mt-1 sm:mt-2">
            <div className="relative w-full h-full flex justify-center items-end drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)] z-10">
               {/* Pulsing Aura/Glow */}
               <div className={`absolute bottom-[0px] left-1/2 -translate-x-1/2 w-[80px] h-[100px] rounded-full blur-[20px] opacity-35 -z-10 mix-blend-screen
                  ${character.element === 'Water' ? 'bg-[#00ffcc]' : 
                    character.element === 'Fire' ? 'bg-[#ff5500]' : 
                    character.element === 'Earth' ? 'bg-[#55ff00]' : 
                    character.element === 'Light' ? 'bg-[#ffeb3b]' : 'bg-[#aa00ff]'}`} />
               
{/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                   src={spriteUrl} 
                   alt={character.name} 
                   className="object-contain h-[135%] sm:h-[150%] max-w-[160%] sm:max-w-[180%] origin-bottom transform translate-y-2 pointer-events-none filter brightness-105"
                   style={{ imageRendering: 'pixelated', filter: cssFilter }}
                />
            </div>

            <div className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 w-[140px] sm:w-[160px] h-[50px] sm:h-[60px] -z-10 drop-shadow-[0_12px_15px_rgba(0,0,0,0.9)]">
              <img
                src="/assets/ui/plataforma.png"
                alt="platform"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* EQUIPMENT PANEL */}
      <div className="w-full mt-2 ui-panel p-2 rpg-panel-shadow relative z-20 text-black overflow-hidden flex flex-col flex-shrink-0">
        <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
        
        <div className="flex items-center gap-1 mb-2">
          <Sword size={16} className="text-[#cc9653]" />
          <span className="ui-heading text-[13px] font-bold text-stroke-black text-white tracking-wide">EQUIPMENT</span>
        </div>

        <div className="flex justify-between items-start w-full gap-[6px] overflow-x-auto custom-scrollbar pb-1">
            <EquipmentSlot type="Weapon" item={equipped.Weapon} onEquip={() => onOpenInventory('Weapon')} />
            <EquipmentSlot type="Armor" item={equipped.Armor} onEquip={() => onOpenInventory('Armor')} />
            <EquipmentSlot type="Accessory" item={equipped.Accessory} onEquip={() => onOpenInventory('Accessory')} />
        </div>
      </div>
    </div>
  );
}
