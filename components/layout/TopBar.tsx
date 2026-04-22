import React from 'react';
import { Settings, Diamond, LogOut } from 'lucide-react';
import { signOut } from '@/services/auth-service';

export function TopBar({
  playerName = 'Summoner',
  playerLevel = 1,
  gems = 0,
  zel = 0,
  karma = 0,
}: {
  playerName?: string;
  playerLevel?: number;
  gems?: number;
  zel?: number;
  karma?: number;
}) {
  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="relative w-full bg-[var(--color-surface-4)] border-b-[3px] border-[var(--color-surface-5)] shadow-[var(--shadow-low)] z-30 flex-shrink-0">
      <div className="absolute top-0 w-full h-[1.5px] bg-[var(--color-surface-3)]"></div>
      <div className="absolute top-[1.5px] w-full h-[1px] bg-[#29170b] opacity-40"></div>
      <div className="absolute bottom-[-3px] w-full h-[1.5px] bg-[#7c5b3c] z-30 opacity-70"></div>
      
      <div className="flex justify-between items-start p-[6px] px-2 relative z-20">
        <div className="flex flex-col text-[var(--color-text-secondary)] text-[10px] sm:text-[12px] font-medium leading-[1.1] w-full max-w-[62%] sm:max-w-[65%] mt-[2px]">
          <div className="flex flex-wrap items-center gap-x-[6px] ui-text">
            <span className="text-[var(--color-text-primary)] text-stroke-sm fx-low tracking-wide ui-heading text-[11px] sm:text-[12px]">Brave Frontier</span>
            <span className="text-[#8c7456] hidden sm:inline">|</span>
            <span className="text-[var(--color-text-muted)]">Player:</span>
            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] truncate max-w-[64px] sm:max-w-none">{playerName}</span>
            <span className="text-[#8c7456]">|</span>
            <span className="text-[var(--color-text-muted)]">Lv <span className="text-white fx-low">{playerLevel}</span></span>
          </div>
          <div className="mt-[3px] hidden sm:flex items-center ui-text tracking-wide">
            <span className="text-[var(--color-text-muted)] whitespace-nowrap">Arena Status:</span>
            <span className="text-[#ffffff] ml-1 fx-low">0 points</span>
          </div>
        </div>

        <div className="flex gap-2 items-start">
          <button 
            onClick={handleLogout}
            className="p-2 bg-[#2a1a1a] rounded border border-[#4a2a2a] hover:bg-[#3a2a2a]"
            title="Logout"
          >
            <LogOut size={14} className="text-[#aa6a6a]" />
          </button>
          
          <div className="flex flex-col gap-[1px] bg-[var(--color-surface-5)] border border-[var(--color-surface-3)] rounded-[2px] p-[2px] w-[96px] sm:w-[110px] fx-low">
            <div className="flex items-center justify-between text-white text-[11px] font-bold px-1 relative h-[16px] bg-gradient-to-r from-[#2a1a0c] to-transparent rounded-sm ui-text">
              <Diamond size={13} className="fill-[#00ffcc] text-[#00ccaa] -ml-[2px]" />
              <span className="text-stroke-black text-right z-10 ui-text tracking-tight">{gems}</span>
            </div>
            <div className="flex items-center justify-between text-white text-[11px] font-bold px-[5px] relative h-[16px] bg-gradient-to-r from-[#2a1a0c] to-transparent rounded-sm ui-text">
              <div className="w-[11px] h-[11px] rounded-full bg-gradient-to-br from-[#4a9eff] to-[#0033aa] border-[1px] border-[#001144] shadow-inner -ml-[1px]"></div>
              <span className="text-stroke-black text-right z-10 ui-text tracking-tight">{zel}</span>
            </div>
            <div className="flex items-center justify-between text-white text-[11px] font-bold px-[5px] relative h-[16px] bg-gradient-to-r from-[#2a1a0c] to-transparent rounded-sm ui-text">
              <div className="w-[11px] h-[11px] rounded-full bg-gradient-to-br from-[#ffd700] to-[#aa6600] border-[1px] border-[#442200] shadow-inner -ml-[1px]"></div>
              <span className="text-stroke-black text-right z-10 ui-text tracking-tight">{karma}</span>
            </div>
          </div>
</div>
        </div>
      <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center z-40 bg-gradient-to-b from-[#5c412d] to-[#3a2517] rounded-full border-[1.5px] border-[#1d1209] shadow-md">
        <Settings size={12} className="text-[#baab99] drop-shadow-md" />
      </div>
    </div>
  );
}
