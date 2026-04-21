import React from 'react';
import { ChevronLeft, Flame, Droplet, Leaf, Moon, Sun, Sparkles } from 'lucide-react';
import { SpriteIcon } from '@/components/ui/SpriteIcon';
import { SQUAD_MOCK, ITEMS_MOCK } from '@/lib/mock-data';
import { PhaserBattleRuntime } from '@/game-runtime/PhaserBattleRuntime';

export function BattleScreenView({ onBack }: { onBack: () => void }) {
  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return "from-[#b53c22] to-[#6e1e0a] border-[#8a2d18]";
      case 'Water': return "from-[#295a8f] to-[#0a233b] border-[#1a4a7f]";
      case 'Earth': return "from-[#38703a] to-[#123614] border-[#1b5e20]";
      case 'Dark': return "from-[#4a267a] to-[#1a0833] border-[#311b92]";
      case 'Light': return "from-[#b59d22] to-[#6e580a] border-[#a18116]";
      default: return "from-[#295a8f] to-[#0a233b] border-[#1a4a7f]";
    }
  };

  const getElementIcon = (element: string, size = 12) => {
    switch (element) {
      case 'Fire': return <Flame size={size} className="fill-[#e85433] text-[#a62c12]" />;
      case 'Water': return <Droplet size={size} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
      case 'Earth': return <Leaf size={size} className="fill-[#4caf50] text-[#1b5e20]" />;
      case 'Dark': return <Moon size={size} className="fill-[#7e57c2] text-[#311b92]" />;
      case 'Light': return <Sun size={size} className="fill-[#f2da3e] text-[#a18116]" />;
      default: return <Droplet size={size} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-2 relative select-none animate-in fade-in duration-300 ui-text">
      
      {/* 1. Battlefield Environment (Framed) */}
      <div className="w-full ui-panel p-1 rpg-panel-shadow relative flex-shrink-0 flex flex-col">
        <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20"></div>
        
        {/* Header row with back button */}
        <div className="w-full flex justify-between items-start mb-1 relative z-30">
          <button onClick={onBack} className="bg-gradient-to-b from-[#e3cfb4] to-[#c7b08d] border-[2px] border-[#5a4227] rounded shadow-[0_2px_4px_rgba(0,0,0,0.5)] px-1 py-1 flex items-center hover:brightness-110 active:scale-95 transition-all duration-200 text-[#3c2a16]">
             <ChevronLeft size={16} />
          </button>
          
          <div className="bg-[#1a110a] border-[1.5px] border-[#5a4227] rounded px-3 py-1 flex items-center shadow-inner mt-[2px] mr-[2px]">
             <span className="ui-heading font-bold text-white text-[12px] tracking-widest text-stroke-sm leading-none">BATTLE PENDING</span>
          </div>
        </div>

        <div className="relative w-full h-[160px] sm:h-[220px] bg-cover bg-center rounded-[2px] overflow-hidden border-[1.5px] border-[#5a4227] shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]" style={{ backgroundImage: "url('https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png')" }}>
        
          {/* Mock Players Sprites (Right side) */}
          <div className="absolute right-[5%] sm:right-[10%] top-[40%] flex flex-col gap-6 scale-90 sm:scale-100">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={SQUAD_MOCK[1].portrait} className="w-[60px] h-[60px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter brightness-110" style={{imageRendering: 'pixelated'}} alt="" />
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={SQUAD_MOCK[3].portrait} className="w-[60px] h-[60px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter opacity-80" style={{imageRendering: 'pixelated', filter: SQUAD_MOCK[3].tint}} alt="" />
          </div>
          <div className="absolute right-[25%] sm:right-[30%] top-[25%] flex flex-col gap-8 scale-75 sm:scale-90">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={SQUAD_MOCK[2].portrait} className="w-[50px] h-[50px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter opacity-90" style={{imageRendering: 'pixelated', filter: SQUAD_MOCK[2].tint}} alt="" />
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={SQUAD_MOCK[0].portrait} className="w-[50px] h-[50px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter opacity-90" style={{imageRendering: 'pixelated', filter: SQUAD_MOCK[0].tint}} alt="" />
          </div>

          {/* Enemy Sprite Mock (Left side) */}
          <div className="absolute left-[15%] top-[25%] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SQUAD_MOCK[0].portrait} className="w-[100px] h-[100px] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] filter brightness-75 sepia(1) hue-rotate-180 scale-[1.5] -scale-x-[1.5]" style={{imageRendering: 'pixelated'}} alt="" />
          </div>

          {/* Enemy Name / HP Overlay */}
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.5)] to-transparent pt-6 pb-2 px-1 flex flex-col justify-end z-10 border-t border-[rgba(255,255,255,0.1)]">
            <div className="flex items-end gap-1 mb-1 ml-1 sm:ml-4 relative">
               <div className="w-8 h-8 flex items-center justify-center absolute -left-1 sm:-left-3 -bottom-1 z-20"><Sparkles size={24} className="text-[#f5d796] fill-[#f5d796] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" /></div>
               <span className="text-white font-bold text-[15px] sm:text-[18px] text-stroke-black fx-low tracking-wide ml-6">Enemy</span>
            </div>
            <div className="w-full px-1">
              <div className="w-full h-[10px] sm:h-[12px] bg-[#111] border-[1.5px] border-[#eacf9b] rounded-sm p-[1px] relative shadow-lg">
                 <div className="h-full bg-gradient-to-b from-[#ff3333] via-[#cc0000] to-[#660000] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] w-[95%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Squad Roster (Framed) */}
      <div className="w-full ui-panel p-1 rpg-panel-shadow flex-shrink-0 relative">
          <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20"></div>
          
          <div className="grid grid-cols-2 gap-[4px] relative z-10 w-full h-[145px] sm:h-[190px]">
              {SQUAD_MOCK.map((unit, idx) => (
                 <div key={idx} className={`relative bg-gradient-to-b ${getElementColor(unit.element)} border-[1.5px] border-[#5a4227] rounded-[3px] flex shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] overflow-hidden`}>
                    
                    {/* Portrait */}
                    <div className="w-[50px] sm:w-[60px] bg-black border-r-[1.5px] border-[#382618] flex-shrink-0 relative overflow-hidden flex justify-center items-end bg-[url('data:image/svg+xml,%3Csvg width=\\'4\\' height=\\'4\\' viewBox=\\'0 0 4 4\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M0 0h4v4H0V0zm2 2h2v2H2V2z\\' fill=\\'%23ffffff\\' fill-opacity=\\'0.05\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')]">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={unit.portrait} className="w-[180%] max-w-none text-center scale-[1.7] transform translate-y-3 origin-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" style={{imageRendering: 'pixelated', filter: unit.tint}} alt="" />
                    </div>
                    
                    {/* Stats */}
                    <div className="flex-1 flex flex-col justify-center px-1 sm:px-2 relative bg-gradient-to-r from-[rgba(0,0,0,0.5)] to-transparent">
                        <div className="flex items-center gap-[2px]">
                           {getElementIcon(unit.element, 11)}
                           <span className="text-[9px] sm:text-[11px] font-bold text-white text-stroke-sm drop-shadow-sm leading-none truncate max-w-[90px]">
                             {unit.name}
                           </span>
                        </div>
                        <div className="text-[11px] sm:text-[14px] font-bold text-white text-stroke-sm drop-shadow-[0_1px_1px_rgba(0,0,0,1)] leading-none text-right w-full pr-1 font-serif tracking-tighter mt-[2px] mb-[1px]">
                           {unit.hp}/{unit.maxHp}
                        </div>
                        {/* HP Bar */}
                        <div className="w-full h-[6px] sm:h-[8px] bg-[#1a1105] border-[1px] border-[#000] rounded-[2px] p-[1px] shadow-sm relative">
                           <div className="h-full bg-gradient-to-r from-[#88ff00] to-[#20cc20] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-sm transition-all duration-500 ease-in-out"></div>
                        </div>
                        {/* BB Bar */}
                        <div className="w-full h-[6px] sm:h-[8px] bg-[#1a1105] border-[1px] border-[#000] rounded-[2px] p-[1px] mt-[2px] shadow-sm relative overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-[#aaffff] via-[#44aaff] to-[#0055ff] w-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-sm transition-all duration-500 ease-in-out"></div>
                        </div>
                    </div>
                 </div>
              ))}
          </div>
      </div>

      {/* 3. Items Panel (Dark Strip style) */}
      <div className="bg-[#2c1d11] border-[2px] border-[#1a110a] rounded-[4px] p-2 mt-auto relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] pb-1 flex flex-col items-center flex-shrink-0">
         <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-[#4a2e1a] border border-[#1a110a] px-3 rounded-full text-[10px] font-bold text-[#c79a5d] tracking-wide shadow-md">
            ITEMS
         </div>
         <div className="flex justify-between items-end w-full px-1 flex-1 pt-[6px]">
            {ITEMS_MOCK.map((item, idx) => (
               <div key={idx} className="flex flex-col items-center w-[18%] relative group cursor-pointer hover:brightness-110 transition-all duration-200">
                  <span className="font-serif text-[12px] sm:text-[14px] font-bold text-white text-stroke-sm leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,1)] z-20 mb-[-6px] text-right w-[80%] pr-1 group-active:scale-95 transition-transform duration-200">
                     x{item.count}
                  </span>
                  {/* Pedestal */}
                  <div className="relative w-full aspect-square max-h-[50px] flex items-center justify-center group-active:scale-95 transition-transform duration-200">
                     <div className="absolute bottom-[2px] w-[90%] h-[12px] bg-gradient-to-r from-[#8b6131] via-[#e2bb7a] to-[#8b6131] rounded-full border-[1.5px] border-[#3d240d] shadow-[0_4px_6px_rgba(0,0,0,0.8)] z-0"></div>
                     <div className="absolute bottom-[4px] w-[80%] h-[10px] bg-[#1a0f05] rounded-full z-0 border border-[#000]"></div>
                     
                     {/* Icon from Atlas */}
                     <div className="relative z-10 translate-y-[-2px] flex items-center justify-center filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                         <SpriteIcon col={item.sprite.col} row={item.sprite.row} size={28} />
                     </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#e1c59f] text-stroke-black text-center leading-[1.1] mt-[2px] w-[120%] drop-shadow-md line-clamp-2">
                    {item.name}
                  </span>
               </div>
            ))}
         </div>
      </div>

      <div className="ui-panel p-2">
        <div className="mb-2">
          <div className="ui-heading text-[13px] text-white text-stroke-sm">Phaser Runtime Preview</div>
          <p className="mt-1 text-[11px] text-[#3c2a16]">The playfield is now scaffolded in Phaser so combat can leave static-only UI composition.</p>
        </div>
        <PhaserBattleRuntime />
      </div>
    </div>
  );
}

