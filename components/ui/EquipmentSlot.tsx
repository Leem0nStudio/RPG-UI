import React from 'react';
import { Item } from '@/lib/types';
import { SpriteIcon } from './SpriteIcon';

export function EquipmentSlot({ type, item, onEquip }: { type: string, item: Item | null, onEquip: () => void }) {
  const getEmptyIcon = () => {
    switch(type) {
      case 'Weapon': return <SpriteIcon col={3} row={2} size={28} className="brightness-0 opacity-30 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />;
      case 'Armor': return <SpriteIcon col={3} row={0} size={28} className="brightness-0 opacity-30 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />;
      case 'Accessory': return <SpriteIcon col={0} row={1} size={28} className="brightness-0 opacity-30 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />;
      default: return null;
    }
  }
  
  return (
    <div className="flex flex-col flex-shrink-0 w-[120px] sm:w-[130px] cursor-pointer group ui-text" onClick={onEquip}>
        <div className="flex w-full px-[2px] mb-[1px]">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#4a3424] tracking-tight transition-colors duration-300 group-hover:text-[#915e21]">{type}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] flex-shrink-0 bg-[#2d2116] border-[1.5px] border-[#1a110a] rounded-[4px] flex flex-col items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_1px_1px_rgba(255,255,255,0.24)] relative group-active:scale-[0.97] transition-all duration-300 group-hover:bg-[#3d2d20] group-hover:border-[#c79a5d] group-hover:shadow-[0_0_6px_rgba(199,154,93,0.45),inset_0_2px_4px_rgba(0,0,0,0.8)]">
               {item ? (
                  <SpriteIcon col={item.sprite.col} row={item.sprite.row} size={28} className={item.sprite.className} />
               ) : (
                  getEmptyIcon()
               )}
               {item && <div className="absolute inset-0 border border-[#c79a5d] rounded-[3px] opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>}
          </div>
          <div className={`text-[11px] sm:text-[12px] font-bold leading-none truncate transition-colors duration-300 ${item ? 'text-[#3c2a16] group-hover:text-[#5a4227]' : 'text-[#4a3424] group-hover:text-[#7a5940]'}`}>
             {item ? item.name : 'Empty'}
          </div>
        </div>
    </div>
  );
}
